// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['docx', 'pptx', 'pdf', 'odt', 'odp'];
    if (!allowed.includes(ext)) {
        showMessage('不支援的格式：' + ext, 'error');
        return;
    }

    showMessage('正在解析 ' + ext.toUpperCase() + ' 檔案...', 'info');
    currentData = { markdown: '', images: [], fileName: file.name.split('.')[0], extension: ext };
    imagePreview.innerHTML = '';
    
    try {
        switch(ext) {
            case 'docx': await processDocx(file); break;
            case 'pptx': await processPptx(file); break;
            case 'pdf':  await processPdf(file); break;
            case 'odt':  await processOpenDocument(file, 'text'); break;
            case 'odp':  await processOpenDocument(file, 'presentation'); break;
        }
        displayResult();
        showMessage('解析成功！', 'success');
    } catch (err) {
        console.error(err);
        showMessage('轉換失敗：' + err.message, 'error');
    }
}

downloadBtn.addEventListener('click', async () => {
    const zip = new JSZip();
    zip.file(`${currentData.fileName}.md`, currentData.markdown);
    const folder = zip.folder("attachments");
    currentData.images.forEach(img => folder.file(img.name, img.blob));
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${currentData.fileName}_obsidian.zip`);
});
