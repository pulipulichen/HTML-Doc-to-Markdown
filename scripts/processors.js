// --- Processors ---

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

function hasAncestor(node, tagName) {
    let current = node.parentNode;
    while (current) {
        if (current.tagName === tagName) return true;
        current = current.parentNode;
    }
    return false;
}
