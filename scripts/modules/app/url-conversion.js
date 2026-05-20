async function handleUrlConvert() {
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
        showMessage(tMessage('status.enterUrl', {}, 'Please enter a file URL first.'), 'error');
        return;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(rawUrl);
    } catch (err) {
        showMessage(tMessage('status.invalidUrl', {}, 'Invalid URL format. Please enter a full URL, for example: https://example.com/file.docx.'), 'error');
        return;
    }

    urlConvertBtn.disabled = true;
    urlConvertBtn.textContent = tMessage('status.downloadingButton', {}, 'Downloading...');
    try {
        const downloadInfo = getDownloadInfo(parsedUrl);
        const downloadingKey = downloadInfo.sourceLabel ? 'status.downloadingFileFromSource' : 'status.downloadingFile';
        const fallbackMessage = downloadInfo.sourceLabel ? `Downloading ${downloadInfo.sourceLabel} file...` : 'Downloading file...';
        showMessage(tMessage(downloadingKey, { source: downloadInfo.sourceLabel }, fallbackMessage), 'info');
        const file = await downloadFile(downloadInfo);
        await handleFile(file);
    } catch (err) {
        console.error(err);
        showMessage(tMessage('status.urlConvertFailed', { message: err.message }, 'URL conversion failed: ' + err.message), 'error');
    } finally {
        urlConvertBtn.disabled = false;
        urlConvertBtn.textContent = tMessage('url.buttonConvert', {}, 'Download and convert');
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
        throw new Error(tMessage(
            'errors.downloadBlockedByCors',
            {},
            'Unable to download from this URL. The source site may block cross-origin browser requests. Use a direct URL with CORS enabled, or download the file first and then drag it in.'
        ));
    }

    if (!response.ok) {
        throw new Error(tMessage(
            'errors.downloadHttp',
            { status: response.status },
            `Download failed (HTTP ${response.status}). Please verify the URL and sharing permission.`
        ));
    }

    const blob = await response.blob();
    const contentType = response.headers.get('Content-Type') || blob.type || '';
    if (downloadInfo.sourceLabel && contentType.includes('text/html')) {
        throw new Error(tMessage(
            'errors.googleReturnedHtml',
            { source: downloadInfo.sourceLabel },
            `${downloadInfo.sourceLabel} returned a webpage instead of a file. Check sharing permission or use a direct download link.`
        ));
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
