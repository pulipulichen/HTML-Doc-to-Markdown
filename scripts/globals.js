// --- Globals & Initializations ---

pdfjsLib.GlobalWorkerOptions.workerSrc = './scripts/vendor/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const urlConvertBtn = document.getElementById('urlConvertBtn');
const statusMessageEl = document.getElementById('status');
const actionButtons = document.getElementById('actionButtons');
const downloadBtn = document.getElementById('downloadBtn');
const markdownPreview = document.getElementById('markdownPreview');
const imagePreview = document.getElementById('imagePreview');
const imageCountDisplay = document.getElementById('imageCount');
const previewContainer = document.getElementById('previewContainer');
const fileTypeBadge = document.getElementById('fileTypeBadge');
const imageModal = document.getElementById('imageModal');
const imageModalPreview = document.getElementById('imageModalPreview');
const imageModalClose = document.getElementById('imageModalClose');
const imageModalDownload = document.getElementById('imageModalDownload');
const imageModalFileName = document.getElementById('imageModalFileName');

let currentData = { markdown: '', images: [], fileName: '', extension: '' };
let activeImageObjectUrl = '';
let activeImageIndex = -1;
let previewImageObjectUrls = [];

const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

turndownService.addRule('tables', {
    filter: 'table',
    replacement: function (content, node) {
        const rows = Array.from(node.querySelectorAll('tr')).map(row =>
            Array.from(row.children)
                .filter(cell => ['TH', 'TD'].includes(cell.tagName))
                .map(cell => cleanMarkdownTableCell(cell.textContent))
        ).filter(row => row.length > 0);

        return rows.length > 0 ? `\n\n${rowsToMarkdownTable(rows)}\n\n` : '';
    }
});

function rowsToMarkdownTable(rows) {
    const columnCount = Math.max(...rows.map(row => row.length));
    const normalizedRows = rows.map(row => normalizeTableRow(row, columnCount));
    const header = normalizedRows[0];
    const body = normalizedRows.slice(1);
    const divider = Array(columnCount).fill('---');
    const tableRows = [header, divider, ...body];

    return tableRows.map(row => `| ${row.join(' | ')} |`).join('\n');
}

function normalizeTableRow(row, columnCount) {
    const normalized = row.slice(0, columnCount);
    while (normalized.length < columnCount) normalized.push('');
    return normalized;
}

function cleanMarkdownTableCell(value) {
    return (value || '')
        .replace(/\|/g, '\\|')
        .replace(/\s+/g, ' ')
        .trim();
}
