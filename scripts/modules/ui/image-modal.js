function bindImagePreviewEvents() {
    if (!imageModal || !imageModalClose || !imageModalDownload) return;

    imageModalClose.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', function (event) {
        if (event.target === imageModal) closeImageModal();
    });
    imageModalDownload.addEventListener('click', downloadActiveImage);

    if (imageModalPrev) {
        imageModalPrev.addEventListener('click', function (event) {
            event.stopPropagation();
            showAdjacentImage(-1);
        });
    }
    if (imageModalNext) {
        imageModalNext.addEventListener('click', function (event) {
            event.stopPropagation();
            showAdjacentImage(1);
        });
    }

    document.addEventListener('keydown', function (event) {
        if (imageModal.classList.contains('hidden')) return;

        if (event.key === 'Escape') {
            closeImageModal();
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showAdjacentImage(-1);
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showAdjacentImage(1);
        }
    });

    window.addEventListener('languagechange', function () {
        updateImageModalNavLabels();
        if (!previewContainer.classList.contains('hidden')) {
            displayResult();
        }
    });
}

function openImageModal(imageIndex) {
    showImageAtIndex(imageIndex);
    if (activeImageIndex < 0 || !imageModal) return;
    imageModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function showImageAtIndex(imageIndex) {
    const imageData = currentData.images[imageIndex];
    if (!imageData || !imageModalPreview || !imageModalFileName) return;

    closeActiveImageObjectUrl();

    activeImageIndex = imageIndex;
    activeImageObjectUrl = URL.createObjectURL(imageData.blob);
    imageModalPreview.src = activeImageObjectUrl;
    imageModalPreview.alt = imageData.name;
    imageModalFileName.textContent = imageData.name;
    updateImageModalNav();
}

function showAdjacentImage(direction) {
    const total = currentData.images.length;
    if (total <= 1 || activeImageIndex < 0) return;

    const nextIndex = (activeImageIndex + direction + total) % total;
    showImageAtIndex(nextIndex);
}

function updateImageModalNav() {
    const canNavigate = currentData.images.length > 1 && activeImageIndex >= 0;
    if (imageModalPrev) imageModalPrev.classList.toggle('hidden', !canNavigate);
    if (imageModalNext) imageModalNext.classList.toggle('hidden', !canNavigate);
    updateImageModalNavLabels();
}

function updateImageModalNavLabels() {
    if (imageModalPrev) {
        imageModalPrev.setAttribute('aria-label', tMessage('preview.previousImage', {}, 'Previous image'));
        imageModalPrev.setAttribute('title', tMessage('preview.previousImage', {}, 'Previous image'));
    }
    if (imageModalNext) {
        imageModalNext.setAttribute('aria-label', tMessage('preview.nextImage', {}, 'Next image'));
        imageModalNext.setAttribute('title', tMessage('preview.nextImage', {}, 'Next image'));
    }
}

function closeImageModal() {
    if (!imageModal || !imageModalPreview || !imageModalFileName) return;

    imageModal.classList.add('hidden');
    imageModalPreview.removeAttribute('src');
    imageModalPreview.alt = '';
    imageModalFileName.textContent = '';
    activeImageIndex = -1;
    closeActiveImageObjectUrl();
    updateImageModalNav();
    document.body.classList.remove('overflow-hidden');
}

function closeActiveImageObjectUrl() {
    if (activeImageObjectUrl) {
        URL.revokeObjectURL(activeImageObjectUrl);
        activeImageObjectUrl = '';
    }
}

function getImageDownloadFileName(imageName) {
    const baseName = (currentData.fileName || '').trim() || 'document';
    return `${baseName}_${imageName}`;
}

function downloadActiveImage() {
    const imageData = currentData.images[activeImageIndex];
    if (!imageData) return;
    saveAs(imageData.blob, getImageDownloadFileName(imageData.name));
}
