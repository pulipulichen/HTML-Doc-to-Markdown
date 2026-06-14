// --- Processors ---

async function processMarkdown(file) {
    const text = await file.text();
    currentData.markdown = extractBase64ImagesFromText(text);
}

async function processHtml(file) {
    const html = await file.text();
    const processedHtml = extractBase64ImagesFromText(html);
    currentData.markdown = turndownService.turndown(processedHtml);
}

async function processDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const options = {
        convertImage: mammoth.images.imgElement(async (image) => {
            const ext = image.contentType.split('/')[1];
            const name = `image_${currentData.images.length + 1}.${ext}`;
            const blob = new Blob([await image.read()], { type: image.contentType });
            currentData.images.push({ name, blob });
            return { src: `attachments/${name}` };
        })
    };
    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    currentData.markdown = turndownService.turndown(result.value);
}

async function processPptx(file) {
    const zip = await JSZip.loadAsync(file);
    let mdContent = `# ${currentData.fileName}\n\n`;
    
    // Extract Media
    const mediaFiles = Object.keys(zip.files).filter(p => p.startsWith('ppt/media/'));
    for (const path of mediaFiles) {
        const blob = await zip.file(path).async('blob');
        currentData.images.push({ name: path.split('/').pop(), blob });
    }

    // Extract Slides Text
    const slidePaths = Object.keys(zip.files).filter(p => p.startsWith('ppt/slides/slide') && p.endsWith('.xml')).sort();
    const parser = new DOMParser();
    for (let i = 0; i < slidePaths.length; i++) {
        const xml = await zip.file(slidePaths[i]).async('string');
        const doc = parser.parseFromString(xml, "text/xml");
        mdContent += `## Slide ${i+1}\n\n${extractPowerPointSlideMarkdown(doc)}\n\n---\n\n`;
    }

    if (currentData.images.length > 0) {
        mdContent += `\n## 附件圖片\n\n` + currentData.images.map(img => `![[attachments/${img.name}]]`).join('\n');
    }
    currentData.markdown = mdContent;
}

async function processPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let mdContent = `# ${currentData.fileName}\n\n`;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        mdContent += `### Page ${i}\n\n${text}\n\n`;
    }
    currentData.markdown = mdContent;
    // 注意：純前端提取 PDF 圖片非常複雜，目前僅提供文字提取。
}

async function processOpenDocument(file, type) {
    const zip = await JSZip.loadAsync(file);
    const contentXml = await zip.file('content.xml').async('string');
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentXml, "text/xml");
    
    let mdContent = `# ${currentData.fileName}\n\n`;

    mdContent += extractOpenDocumentMarkdown(doc) + "\n\n";

    // Extract Images (ODT/ODP 圖片通常在 Pictures/ 資料夾)
    const pictures = Object.keys(zip.files).filter(p => p.startsWith('Pictures/'));
    for (const path of pictures) {
        const blob = await zip.file(path).async('blob');
        const name = path.split('/').pop();
        currentData.images.push({ name, blob });
    }

    if (currentData.images.length > 0) {
        mdContent += `\n## 附件圖片\n\n` + currentData.images.map(img => `![[attachments/${img.name}]]`).join('\n');
    }

    currentData.markdown = mdContent;
}

async function processSpreadsheet(file, type) {
    if (type === 'xlsx') {
        await processExcelSpreadsheet(file);
        return;
    }

    if (type === 'ods') {
        await processOdsSpreadsheet(file);
        return;
    }

    throw new Error(`Unsupported spreadsheet format: ${type}`);
}

async function processExcelSpreadsheet(file) {
    const zip = await JSZip.loadAsync(file);
    const workbookXml = await zip.file('xl/workbook.xml')?.async('string');
    const workbookRelsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string');
    if (!workbookXml || !workbookRelsXml) {
        throw new Error('Invalid XLSX file structure.');
    }

    const parser = new DOMParser();
    const workbookDoc = parser.parseFromString(workbookXml, "text/xml");
    const workbookRelsDoc = parser.parseFromString(workbookRelsXml, "text/xml");
    const sharedStrings = await readXlsxSharedStrings(zip, parser);
    const sheetFilesById = getXlsxSheetFilesById(workbookRelsDoc);
    const sheets = getXlsxSheets(workbookDoc);

    let mdContent = `# ${currentData.fileName}\n\n`;
    for (const sheet of sheets) {
        const path = sheetFilesById[sheet.relationshipId];
        const rows = path ? await readXlsxSheetRows(zip, parser, path, sharedStrings) : [];
        mdContent += buildSheetMarkdownBlock(sheet.name, rows);
    }
    currentData.markdown = mdContent.trim();
}

async function processOdsSpreadsheet(file) {
    const zip = await JSZip.loadAsync(file);
    const contentXml = await zip.file('content.xml')?.async('string');
    if (!contentXml) {
        throw new Error('Invalid ODS file structure.');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(contentXml, "text/xml");
    const spreadsheet = doc.getElementsByTagName('office:spreadsheet')[0];
    if (!spreadsheet) {
        throw new Error('Cannot find spreadsheet data in ODS.');
    }

    const sheets = Array.from(spreadsheet.getElementsByTagName('table:table')).map((tableNode, index) => ({
        name: getSheetName(tableNode, `Sheet ${index + 1}`),
        rows: parseOdsTableRows(tableNode)
    }));

    let mdContent = `# ${currentData.fileName}\n\n`;
    for (const sheet of sheets) {
        mdContent += buildSheetMarkdownBlock(sheet.name, sheet.rows);
    }
    currentData.markdown = mdContent.trim();
}

function extractPowerPointSlideMarkdown(doc) {
    const tableNodes = Array.from(doc.getElementsByTagName('a:tbl'));
    const bodyText = Array.from(doc.getElementsByTagName('a:t'))
        .filter(node => !hasAncestor(node, 'a:tbl'))
        .map(node => node.textContent.trim())
        .filter(Boolean)
        .join(' ');

    const tableMarkdown = tableNodes
        .map(tableNode => tableNodeToMarkdown(tableNode, 'a:tr', 'a:tc', 'a:t'))
        .filter(Boolean)
        .join('\n\n');

    return [bodyText, tableMarkdown].filter(Boolean).join('\n\n');
}

function extractOpenDocumentMarkdown(doc) {
    const root = doc.getElementsByTagName('office:text')[0] || doc.getElementsByTagName('office:presentation')[0] || doc.documentElement;
    return Array.from(root.children)
        .map(node => openDocumentNodeToMarkdown(node))
        .filter(Boolean)
        .join('\n\n');
}

function openDocumentNodeToMarkdown(node) {
    if (node.tagName === 'table:table') {
        return tableNodeToMarkdown(node, 'table:table-row', 'table:table-cell', 'text:p');
    }

    if (node.tagName === 'text:h') {
        return `## ${node.textContent.trim()}`;
    }

    if (node.tagName === 'text:p') {
        return node.textContent.trim();
    }

    return Array.from(node.children || [])
        .map(child => openDocumentNodeToMarkdown(child))
        .filter(Boolean)
        .join('\n\n');
}

function tableNodeToMarkdown(tableNode, rowTag, cellTag, textTag) {
    const rows = Array.from(tableNode.getElementsByTagName(rowTag)).map(rowNode => {
        const cells = Array.from(rowNode.getElementsByTagName(cellTag)).map(cellNode => {
            const textNodes = Array.from(cellNode.getElementsByTagName(textTag));
            const cellText = textNodes.length > 0 ? textNodes.map(textNode => textNode.textContent).join(' ') : cellNode.textContent;
            return cleanMarkdownTableCell(cellText);
        });
        return cells;
    }).filter(row => row.length > 0);

    return rows.length > 0 ? rowsToMarkdownTable(rows) : '';
}

async function readXlsxSharedStrings(zip, parser) {
    const sharedStringsXml = await zip.file('xl/sharedStrings.xml')?.async('string');
    if (!sharedStringsXml) return [];
    const sharedDoc = parser.parseFromString(sharedStringsXml, "text/xml");
    return Array.from(sharedDoc.getElementsByTagName('si')).map(node =>
        cleanMarkdownTableCell(getNodeText(node))
    );
}

function getXlsxSheetFilesById(workbookRelsDoc) {
    const byId = {};
    const relationships = Array.from(workbookRelsDoc.getElementsByTagName('Relationship'));
    relationships.forEach(rel => {
        const id = rel.getAttribute('Id');
        const target = rel.getAttribute('Target') || '';
        if (!id || !target) return;
        byId[id] = normalizeZipPath(`xl/${target}`);
    });
    return byId;
}

function getXlsxSheets(workbookDoc) {
    const sheetNodes = Array.from(workbookDoc.getElementsByTagName('sheet'));
    return sheetNodes.map((node, index) => ({
        name: cleanMarkdownTableCell(node.getAttribute('name') || `Sheet ${index + 1}`),
        relationshipId: node.getAttribute('r:id') || node.getAttribute('id') || ''
    }));
}

async function readXlsxSheetRows(zip, parser, filePath, sharedStrings) {
    const sheetXml = await zip.file(filePath)?.async('string');
    if (!sheetXml) return [];
    const sheetDoc = parser.parseFromString(sheetXml, "text/xml");
    const rowNodes = Array.from(sheetDoc.getElementsByTagName('row'));
    const rows = rowNodes.map(rowNode => parseXlsxRow(rowNode, sharedStrings));
    return rows.filter(row => row.some(cell => cell !== ''));
}

function parseXlsxRow(rowNode, sharedStrings) {
    const row = [];
    const cells = Array.from(rowNode.getElementsByTagName('c'));
    cells.forEach(cellNode => {
        const reference = cellNode.getAttribute('r') || '';
        const index = reference ? excelRefToColIndex(reference) : row.length;
        while (row.length < index) row.push('');
        row[index] = parseXlsxCellValue(cellNode, sharedStrings);
    });
    trimTrailingEmptyCells(row);
    return row;
}

function parseXlsxCellValue(cellNode, sharedStrings) {
    const type = cellNode.getAttribute('t') || '';
    const valueNode = cellNode.getElementsByTagName('v')[0];
    const inlineTextNode = cellNode.getElementsByTagName('is')[0];
    const rawValue = valueNode ? valueNode.textContent : '';

    if (type === 's') {
        const idx = Number(rawValue);
        const sharedText = Number.isInteger(idx) ? sharedStrings[idx] : '';
        return cleanMarkdownTableCell(sharedText || '');
    }

    if (type === 'inlineStr') {
        return cleanMarkdownTableCell(getNodeText(inlineTextNode));
    }

    if (type === 'b') {
        return rawValue === '1' ? 'TRUE' : 'FALSE';
    }

    if (type === 'str') {
        return cleanMarkdownTableCell(rawValue);
    }

    return cleanMarkdownTableCell(rawValue);
}

function excelRefToColIndex(reference) {
    const letters = (reference.match(/[A-Z]+/i) || ['A'])[0].toUpperCase();
    let index = 0;
    for (let i = 0; i < letters.length; i++) {
        index = index * 26 + (letters.charCodeAt(i) - 64);
    }
    return index - 1;
}

function normalizeZipPath(path) {
    return path
        .replace(/\\/g, '/')
        .split('/')
        .reduce((parts, part) => {
            if (!part || part === '.') return parts;
            if (part === '..') {
                parts.pop();
                return parts;
            }
            parts.push(part);
            return parts;
        }, [])
        .join('/');
}

function parseOdsTableRows(tableNode) {
    const rows = [];
    const rowNodes = Array.from(tableNode.getElementsByTagName('table:table-row'));

    rowNodes.forEach(rowNode => {
        const repeatCount = Math.max(1, Number(rowNode.getAttribute('table:number-rows-repeated') || '1'));
        const parsedRow = parseOdsRowCells(rowNode);
        if (!parsedRow.some(cell => cell !== '')) return;
        for (let i = 0; i < repeatCount; i++) {
            rows.push([...parsedRow]);
        }
    });

    return rows;
}

function parseOdsRowCells(rowNode) {
    const row = [];
    const cellNodes = Array.from(rowNode.children || []).filter(node =>
        node.tagName === 'table:table-cell' || node.tagName === 'table:covered-table-cell'
    );

    cellNodes.forEach(cellNode => {
        const repeatCount = Math.max(1, Number(cellNode.getAttribute('table:number-columns-repeated') || '1'));
        const cellText = cellNode.tagName === 'table:covered-table-cell' ? '' : extractOdsCellText(cellNode);
        for (let i = 0; i < repeatCount; i++) {
            row.push(cellText);
        }
    });

    trimTrailingEmptyCells(row);
    return row;
}

function extractOdsCellText(cellNode) {
    const textNodes = Array.from(cellNode.getElementsByTagName('text:p'));
    if (textNodes.length > 0) {
        const text = textNodes
            .map(node => cleanMarkdownTableCell(getNodeText(node)))
            .filter(Boolean)
            .join(' ');
        if (text) return text;
    }

    return cleanMarkdownTableCell(cellNode.getAttribute('office:string-value') || cellNode.getAttribute('office:value') || cellNode.textContent);
}

function trimTrailingEmptyCells(row) {
    while (row.length > 0 && !row[row.length - 1]) {
        row.pop();
    }
}

function getSheetName(node, fallbackPrefix) {
    return cleanMarkdownTableCell(node.getAttribute('table:name') || fallbackPrefix);
}

function buildSheetMarkdownBlock(name, rows) {
    const safeName = name || 'Sheet';
    if (!rows || rows.length === 0) {
        return `## ${safeName}\n\n_(No data)_\n\n`;
    }
    return `## ${safeName}\n\n${rowsToMarkdownTable(rows)}\n\n`;
}

function getNodeText(node) {
    if (!node) return '';
    return node.textContent || '';
}

function hasAncestor(node, tagName) {
    let current = node.parentNode;
    while (current) {
        if (current.tagName === tagName) return true;
        current = current.parentNode;
    }
    return false;
}
