function bindImagePreviewEvents() {
    if (!imageModal || !imageModalClose || !imageModalDownload) return;

    imageModalClose.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', function (event) {
        if (event.target === imageModal) closeImageModal();
    });
    imageModalDownload.addEventListener('click', downloadActiveImage);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
            closeImageModal();
        }
    });

    window.addEventListener('languagechange', function () {
        if (!previewContainer.classList.contains('hidden')) {
            displayResult();
        }
    });
}

function openImageModal(imageIndex) {
    const imageData = currentData.images[imageIndex];
    if (!imageData || !imageModal || !imageModalPreview || !imageModalFileName) return;

    closeActiveImageObjectUrl();

    activeImageIndex = imageIndex;
    activeImageObjectUrl = URL.createObjectURL(imageData.blob);
    imageModalPreview.src = activeImageObjectUrl;
    imageModalPreview.alt = imageData.name;
    imageModalFileName.textContent = imageData.name;
    imageModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeImageModal() {
    if (!imageModal || !imageModalPreview || !imageModalFileName) return;

    imageModal.classList.add('hidden');
    imageModalPreview.removeAttribute('src');
    imageModalPreview.alt = '';
    imageModalFileName.textContent = '';
    activeImageIndex = -1;
    closeActiveImageObjectUrl();
    document.body.classList.remove('overflow-hidden');
}

function closeActiveImageObjectUrl() {
    if (activeImageObjectUrl) {
        URL.revokeObjectURL(activeImageObjectUrl);
        activeImageObjectUrl = '';
    }
}

function downloadActiveImage() {
    const imageData = currentData.images[activeImageIndex];
    if (!imageData) return;
    saveAs(imageData.blob, imageData.name);
}
