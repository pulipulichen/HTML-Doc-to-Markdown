function bindPreviewPanelEvents() {
    if (markdownPanelToggle && markdownPanel) {
        markdownPanelToggle.addEventListener('click', function () {
            togglePreviewPanel(markdownPanel, markdownPanelToggle);
        });
    }
    if (attachmentsPanelToggle && attachmentsPanel) {
        attachmentsPanelToggle.addEventListener('click', function () {
            togglePreviewPanel(attachmentsPanel, attachmentsPanelToggle);
        });
    }

    window.addEventListener('languagechange', updatePreviewPanelToggleLabels);
    updatePreviewPanelToggleLabels();
    syncPreviewPanelLayout();
}

function togglePreviewPanel(panel, toggleButton) {
    if (!panel || !toggleButton) return;
    panel.classList.toggle('is-collapsed');
    syncPreviewPanelLayout();
    updatePreviewPanelToggleLabels();
}

function syncPreviewPanelLayout() {
    if (!previewContainer) return;

    const panels = [markdownPanel, attachmentsPanel].filter(Boolean);
    const hasCollapsed = panels.some(function (panel) {
        return panel.classList.contains('is-collapsed');
    });
    previewContainer.classList.toggle('has-collapsed-panel', hasCollapsed);

    panels.forEach(function (panel) {
        const toggleButton = panel.querySelector('.preview-panel-toggle');
        const isCollapsed = panel.classList.contains('is-collapsed');
        if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
        }
    });
}

function updatePreviewPanelToggleLabels() {
    updatePreviewPanelToggleLabel(markdownPanelToggle, markdownPanel);
    updatePreviewPanelToggleLabel(attachmentsPanelToggle, attachmentsPanel);
}

function updatePreviewPanelToggleLabel(toggleButton, panel) {
    if (!toggleButton || !panel) return;
    const isCollapsed = panel.classList.contains('is-collapsed');
    const label = isCollapsed
        ? tMessage('preview.expandPanel', {}, 'Expand')
        : tMessage('preview.collapsePanel', {}, 'Collapse');
    toggleButton.setAttribute('aria-label', label);
    toggleButton.setAttribute('title', label);
}

function displayResult() {
    workspaceLayout.classList.add('lg:grid-cols-[340px_minmax(0,1fr)]');
    previewContainer.classList.remove('hidden');
    actionButtons.classList.remove('hidden');
    markdownPreview.textContent = currentData.markdown;
    imageCountDisplay.textContent = currentData.images.length;
    syncPreviewPanelLayout();

    const badge = fileTypeBadge;
    badge.textContent = currentData.extension.toUpperCase();
    const colors = { docx: 'bg-blue-100 text-blue-700', pptx: 'bg-orange-100 text-orange-700', pdf: 'bg-red-100 text-red-700', odt: 'bg-green-100 text-green-700', odp: 'bg-emerald-100 text-emerald-700', md: 'bg-violet-100 text-violet-700', markdown: 'bg-violet-100 text-violet-700', html: 'bg-pink-100 text-pink-700', htm: 'bg-pink-100 text-pink-700' };
    badge.className = `text-xs font-bold px-2 py-1 rounded ${colors[currentData.extension] || 'bg-slate-100'}`;

    clearPreviewImageObjectUrls();
    imagePreview.innerHTML = '';
    closeImageModal();

    currentData.images.forEach(function (img, index) {
        const div = document.createElement('div');
        div.className = 'bg-white border rounded-lg p-2 flex flex-col items-center shadow-sm';

        const imgEl = document.createElement('img');
        const thumbnailUrl = URL.createObjectURL(img.blob);
        previewImageObjectUrls.push(thumbnailUrl);
        imgEl.src = thumbnailUrl;
        imgEl.className = 'w-full h-24 object-contain mb-2 rounded bg-slate-100 cursor-zoom-in';
        imgEl.alt = img.name;
        imgEl.addEventListener('click', function () {
            openImageModal(index);
        });

        const actions = document.createElement('div');
        actions.className = 'w-full flex flex-col gap-2';

        const span = document.createElement('span');
        span.className = 'text-[10px] text-slate-500 truncate text-left';
        span.textContent = img.name;

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'w-full flex justify-end items-center gap-2';

        const copyBtnSingle = document.createElement('button');
        copyBtnSingle.type = 'button';
        copyBtnSingle.className = 'text-[10px] px-2 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition';
        copyBtnSingle.textContent = tMessage('preview.copyImage', {}, 'Copy');
        copyBtnSingle.addEventListener('click', async function () {
            try {
                await copyImageToClipboard(img.blob);
                showMessage(tMessage('status.copyImageSuccess', {}, 'Image copied to clipboard!'), 'success');
            } catch (error) {
                console.error('Copy image failed:', error);
                let errorKey = 'status.copyImageFailed';
                let fallback = 'Unable to copy image. Please download it.';
                if (error && error.message === 'clipboard-image-unsupported') {
                    errorKey = 'status.copyImageUnsupported';
                    fallback = 'This browser does not support image copy.';
                }
                showMessage(tMessage(errorKey, {}, fallback), 'error');
            }
        });

        const downloadBtnSingle = document.createElement('button');
        downloadBtnSingle.type = 'button';
        downloadBtnSingle.className = 'text-[10px] px-2 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition';
        downloadBtnSingle.textContent = tMessage('preview.downloadImage', {}, 'Download');
        downloadBtnSingle.addEventListener('click', function () {
            saveAs(img.blob, getImageDownloadFileName(img.name));
        });

        buttonGroup.append(copyBtnSingle, downloadBtnSingle);
        actions.append(span, buttonGroup);
        div.append(imgEl, actions);
        imagePreview.appendChild(div);
    });
}

async function copyImageToClipboard(blob) {
    if (!(navigator.clipboard && typeof navigator.clipboard.write === 'function' && window.ClipboardItem && window.isSecureContext)) {
        throw new Error('clipboard-image-unsupported');
    }

    const mimeType = blob.type || 'image/png';
    const clipboardBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
    await navigator.clipboard.write([
        new ClipboardItem({
            [mimeType]: clipboardBlob
        })
    ]);
}

function clearPreviewImageObjectUrls() {
    previewImageObjectUrls.forEach(function (imageUrl) {
        URL.revokeObjectURL(imageUrl);
    });
    previewImageObjectUrls = [];
}
