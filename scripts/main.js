/* jshint esversion: 11 */
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

urlConvertBtn.addEventListener('click', handleUrlConvert);
urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleUrlConvert();
    }
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

async function handleUrlConvert() {
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
        showMessage('請先輸入檔案網址。', 'error');
        return;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(rawUrl);
    } catch (err) {
        showMessage('網址格式不正確，請輸入完整網址，例如 https://example.com/file.docx。', 'error');
        return;
    }

    urlConvertBtn.disabled = true;
    urlConvertBtn.textContent = '下載中...';
    try {
        const downloadInfo = getDownloadInfo(parsedUrl);
        showMessage(`正在下載${downloadInfo.sourceLabel ? ' ' + downloadInfo.sourceLabel : ''}檔案...`, 'info');
        const file = await downloadFile(downloadInfo);
        await handleFile(file);
    } catch (err) {
        console.error(err);
        showMessage('網址轉換失敗：' + err.message, 'error');
    } finally {
        urlConvertBtn.disabled = false;
        urlConvertBtn.textContent = '下載並轉換';
    }
}

function getDownloadInfo(parsedUrl) {
    const googleInfo = getGoogleDownloadInfo(parsedUrl);
    if (googleInfo) return googleInfo;

    return {
        url: parsedUrl.href,
        fallbackName: getNameFromPath(parsedUrl.pathname) || 'downloaded-file',
        extension: getExtensionFromPath(parsedUrl.pathname),
        sourceLabel: ''
    };
}

function getGoogleDownloadInfo(parsedUrl) {
    const host = parsedUrl.hostname.toLowerCase();

    if (host === 'docs.google.com') {
        const parts = parsedUrl.pathname.split('/').filter(Boolean);
        const appType = parts[0];
        const fileId = getGoogleFileIdFromParts(parts);

        if (appType === 'document' && fileId) {
            return {
                url: `https://docs.google.com/document/d/${fileId}/export?format=docx`,
                fallbackName: `google-doc-${fileId}.docx`,
                extension: 'docx',
                sourceLabel: 'Google Docs'
            };
        }

        if (appType === 'presentation' && fileId) {
            return {
                url: `https://docs.google.com/presentation/d/${fileId}/export/pptx`,
                fallbackName: `google-slides-${fileId}.pptx`,
                extension: 'pptx',
                sourceLabel: 'Google Slides'
            };
        }
    }

    if (host === 'drive.google.com') {
        const fileId = getDriveFileId(parsedUrl);
        if (fileId) {
            return {
                url: `https://drive.google.com/uc?export=download&id=${fileId}`,
                fallbackName: `google-drive-${fileId}`,
                extension: '',
                sourceLabel: 'Google Drive'
            };
        }
    }

    return null;
}

function getGoogleFileIdFromParts(parts) {
    const idMarkerIndex = parts.indexOf('d');
    return idMarkerIndex >= 0 ? parts[idMarkerIndex + 1] || '' : '';
}

function getDriveFileId(parsedUrl) {
    const pathMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
    if (pathMatch) return pathMatch[1];
    return parsedUrl.searchParams.get('id') || '';
}

async function downloadFile(downloadInfo) {
    let response;
    try {
        response = await fetch(downloadInfo.url);
    } catch (err) {
        throw new Error('無法從此網址下載。對方網站可能未允許瀏覽器跨網域讀取，請改用可公開存取且允許 CORS 的直連網址，或先下載後再拖放檔案。');
    }

    if (!response.ok) {
        throw new Error(`下載失敗（HTTP ${response.status}）。請確認網址與分享權限。`);
    }

    const blob = await response.blob();
    const contentType = response.headers.get('Content-Type') || blob.type || '';
    if (downloadInfo.sourceLabel && contentType.includes('text/html')) {
        throw new Error(`${downloadInfo.sourceLabel} 回傳的是網頁而不是檔案，請確認分享權限或改用可直接下載的連結。`);
    }

    const headerName = getNameFromContentDisposition(response.headers.get('Content-Disposition'));
    const fileName = ensureSupportedFileName(
        headerName || downloadInfo.fallbackName,
        downloadInfo.extension || getExtensionFromContentType(contentType)
    );

    return new File([blob], fileName, { type: contentType || blob.type });
}

function getNameFromContentDisposition(disposition) {
    if (!disposition) return '';

    const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (encodedMatch) return decodeURIComponent(encodedMatch[1].replace(/["']/g, ''));

    const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
    return plainMatch ? plainMatch[1].trim() : '';
}

function ensureSupportedFileName(name, fallbackExtension) {
    const safeName = sanitizeFileName(name || 'downloaded-file');
    const extension = getExtensionFromPath(safeName) || fallbackExtension;
    if (!extension) return safeName;
    return safeName.toLowerCase().endsWith(`.${extension}`) ? safeName : `${safeName}.${extension}`;
}

function sanitizeFileName(name) {
    return name.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
}

function getNameFromPath(pathname) {
    const name = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '');
    return name.includes('.') ? name : '';
}

function getExtensionFromPath(pathname) {
    const cleanPath = pathname.split('?')[0].split('#')[0];
    const match = cleanPath.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
}

function getExtensionFromContentType(contentType) {
    const type = contentType.split(';')[0].trim().toLowerCase();
    const extensions = {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/pdf': 'pdf',
        'application/vnd.oasis.opendocument.text': 'odt',
        'application/vnd.oasis.opendocument.presentation': 'odp'
    };
    return extensions[type] || '';
}

downloadBtn.addEventListener('click', async () => {
    const zip = new JSZip();
    zip.file(`${currentData.fileName}.md`, currentData.markdown);
    const folder = zip.folder("attachments");
    currentData.images.forEach(img => folder.file(img.name, img.blob));
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${currentData.fileName}_obsidian.zip`);
});
