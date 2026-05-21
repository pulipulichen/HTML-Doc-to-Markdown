function displayResult() {
    previewContainer.classList.remove('hidden');
    actionButtons.classList.remove('hidden');
    markdownPreview.textContent = currentData.markdown;
    imageCountDisplay.textContent = currentData.images.length;

    const badge = fileTypeBadge;
    badge.textContent = currentData.extension.toUpperCase();
    const colors = { docx: 'bg-blue-100 text-blue-700', pptx: 'bg-orange-100 text-orange-700', pdf: 'bg-red-100 text-red-700', odt: 'bg-green-100 text-green-700', odp: 'bg-emerald-100 text-emerald-700' };
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
            saveAs(img.blob, img.name);
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
