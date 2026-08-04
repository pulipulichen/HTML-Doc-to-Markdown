function initMainEventListeners() {
    bindDropZoneEvents();
    bindFileInputEvents();
    bindUrlConvertEvents();
    bindExportEvents();
    bindClipboardEvents();
    bindPreviewPanelEvents();
    bindImagePreviewEvents();
}

function bindDropZoneEvents() {
    dropZone.addEventListener('click', function () {
        fileInput.click();
    });

    dropZone.addEventListener('dragover', function (event) {
        event.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (event) {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = event.dataTransfer.files[0];
        if (file) handleFile(file);
    });
}

function bindFileInputEvents() {
    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) handleFile(file);
    });
}

function bindUrlConvertEvents() {
    urlConvertBtn.addEventListener('click', handleUrlConvert);
    urlInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleUrlConvert();
        }
    });
}

function bindExportEvents() {
    downloadBtn.addEventListener('click', function () {
        downloadCurrentAsZip();
    });

    downloadMarkdownBtn.addEventListener('click', function () {
        const downloaded = downloadCurrentAsMarkdown();
        if (!downloaded) {
            showMessage(tMessage('status.downloadMdEmpty', {}, 'No Markdown content to download yet.'), 'error');
        }
    });
}

function bindClipboardEvents() {
    copyMarkdownBtn.addEventListener('click', async function () {
        const markdown = (currentData.markdown || '').trim();
        if (!markdown) {
            showMessage(tMessage('status.copyEmpty', {}, 'Nothing to copy yet.'), 'error');
            return;
        }

        try {
            await copyTextToClipboard(markdown);
            showMessage(tMessage('status.copySuccess', {}, 'Markdown copied to clipboard!'), 'success');
        } catch (error) {
            console.error('Copy markdown failed:', error);
            showMessage(tMessage('status.copyFailed', {}, 'Unable to copy Markdown. Please copy manually.'), 'error');
        }
    });
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!copied) {
        throw new Error('document.execCommand copy failed');
    }
}

initMainEventListeners();
