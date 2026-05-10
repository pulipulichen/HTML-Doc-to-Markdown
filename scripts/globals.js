// --- Globals & Initializations ---

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');
const actionButtons = document.getElementById('actionButtons');
const downloadBtn = document.getElementById('downloadBtn');
const markdownPreview = document.getElementById('markdownPreview');
const imagePreview = document.getElementById('imagePreview');
const imageCountDisplay = document.getElementById('imageCount');
const previewContainer = document.getElementById('previewContainer');
const fileTypeBadge = document.getElementById('fileTypeBadge');

let currentData = { markdown: '', images: [], fileName: '', extension: '' };

const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
