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
