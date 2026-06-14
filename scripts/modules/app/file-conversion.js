const SUPPORTED_EXTENSIONS = ['docx', 'pptx', 'pdf', 'odt', 'odp', 'xlsx', 'ods', 'md', 'markdown', 'html', 'htm'];

async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        showMessage(tMessage('status.unsupportedFormat', { ext: ext }, 'Unsupported format: ' + ext), 'error');
        return;
    }

    showMessage(tMessage('status.parsingFile', { ext: ext.toUpperCase() }, 'Parsing ' + ext.toUpperCase() + ' file...'), 'info');
    currentData = { markdown: '', images: [], fileName: file.name.split('.')[0], extension: ext };
    imagePreview.innerHTML = '';

    try {
        await processFileByExtension(ext, file);
        displayResult();
        statusMessageEl.classList.add('hidden');
        statusMessageEl.textContent = '';
    } catch (err) {
        console.error(err);
        showMessage(tMessage('status.convertFailed', { message: err.message }, 'Conversion failed: ' + err.message), 'error');
    }
}

async function processFileByExtension(ext, file) {
    switch (ext) {
        case 'docx':
            await processDocx(file);
            break;
        case 'pptx':
            await processPptx(file);
            break;
        case 'pdf':
            await processPdf(file);
            break;
        case 'odt':
            await processOpenDocument(file, 'text');
            break;
        case 'odp':
            await processOpenDocument(file, 'presentation');
            break;
        case 'xlsx':
            await processSpreadsheet(file, 'xlsx');
            break;
        case 'ods':
            await processSpreadsheet(file, 'ods');
            break;
        case 'md':
        case 'markdown':
            await processMarkdown(file);
            break;
        case 'html':
        case 'htm':
            await processHtml(file);
            break;
    }
}
