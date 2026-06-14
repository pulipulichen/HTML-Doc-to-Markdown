const DATA_IMAGE_URI_REGEX = /data:image\/([a-zA-Z0-9.+-]+)(?:;[^;,]*)*;base64,([^"'\s>)]+)/g;

function mimeSubtypeToExtension(mimeSubtype) {
    if (mimeSubtype === 'svg+xml') return 'svg';
    if (mimeSubtype === 'jpeg') return 'jpg';
    return mimeSubtype.split('+')[0];
}

function base64ToBlob(base64Data, contentType) {
    const normalized = base64Data.replace(/\s/g, '');
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: contentType });
}

function formatImageTimestamp(date) {
    const pad = (value) => String(value).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join('') + '-' + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join('');
}

function buildExtractedImageName(timestamp, index, ext) {
    return `${timestamp}_${index}.${ext}`;
}

function extractBase64ImagesFromText(text) {
    const timestamp = formatImageTimestamp(new Date());
    let imageIndex = 0;

    return text.replace(DATA_IMAGE_URI_REGEX, function (fullMatch, mimeSubtype, base64Data) {
        imageIndex += 1;
        const contentType = `image/${mimeSubtype}`;
        const ext = mimeSubtypeToExtension(mimeSubtype);
        const name = buildExtractedImageName(timestamp, imageIndex, ext);

        try {
            const blob = base64ToBlob(base64Data, contentType);
            currentData.images.push({ name, blob });
            return `attachments/${name}`;
        } catch (err) {
            console.warn('Failed to decode base64 image:', err);
            return fullMatch;
        }
    });
}
