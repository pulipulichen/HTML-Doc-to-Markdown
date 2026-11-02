async function downloadCurrentAsZip() {
    const zip = new JSZip();
    zip.file(`${currentData.fileName}.md`, currentData.markdown);

    const folder = zip.folder('attachments');
    currentData.images.forEach(function (img) {
        folder.file(img.name, img.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${currentData.fileName}_obsidian.zip`);
}

function downloadCurrentAsMarkdown() {
    const markdown = (currentData.markdown || '').trim();
    if (!markdown) return false;

    const baseName = (currentData.fileName || 'document').trim() || 'document';
    const mdBlob = new Blob([currentData.markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(mdBlob, `${baseName}.md`);
    return true;
}


/* Export an optional all-PNG archive without changing the Obsidian ZIP image paths. */
async function downloadCurrentOpaquePngZip() {
    if (!currentData.images.length) return;

    const zip = new JSZip();
    const folder = zip.folder('attachments');
    try {
        for (const [index, image] of currentData.images.entries()) {
            const png = await createOpaquePng(image.blob);
            const name = String(index + 1).padStart(3, '0') + '_' + getOpaquePngFileName(image.name);
            folder.file(name, png);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, ((currentData.fileName || 'document').trim() || 'document') + '_opaque_png.zip');
    } catch (error) {
        console.error('Opaque PNG ZIP export failed:', error);
        showMessage(tMessage('status.opaquePngFailed', {}, 'Unable to export PNG. Please download the original image.'), 'error');
    }
}
