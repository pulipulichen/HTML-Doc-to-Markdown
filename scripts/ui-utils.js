// --- UI Utils ---

function displayResult() {
    previewContainer.classList.remove('hidden');
    actionButtons.classList.remove('hidden');
    markdownPreview.textContent = currentData.markdown;
    imageCountDisplay.textContent = currentData.images.length;
    
    const badge = fileTypeBadge;
    badge.textContent = currentData.extension.toUpperCase();
    const colors = { docx: 'bg-blue-100 text-blue-700', pptx: 'bg-orange-100 text-orange-700', pdf: 'bg-red-100 text-red-700', odt: 'bg-green-100 text-green-700', odp: 'bg-emerald-100 text-emerald-700' };
    badge.className = `text-xs font-bold px-2 py-1 rounded ${colors[currentData.extension] || 'bg-slate-100'}`;

    imagePreview.innerHTML = '';
    currentData.images.forEach(img => {
        const div = document.createElement('div');
        div.className = 'bg-white border rounded-lg p-2 flex flex-col items-center shadow-sm';
        const imgEl = document.createElement('img');
        imgEl.src = URL.createObjectURL(img.blob);
        imgEl.className = 'w-full h-24 object-contain mb-2 rounded bg-slate-100';
        const span = document.createElement('span');
        span.className = 'text-[10px] text-slate-500 truncate w-full text-center';
        span.textContent = img.name;
        div.append(imgEl, span);
        imagePreview.appendChild(div);
    });
}

function showMessage(msg, type) {
    status.classList.remove('hidden', 'bg-blue-50', 'text-blue-700', 'bg-red-50', 'text-red-700', 'bg-green-50', 'text-green-700');
    const style = type === 'info' ? 'bg-blue-50 text-blue-700' : type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700';
    status.className = `text-center p-4 rounded-lg mb-4 text-sm font-medium ${style}`;
    status.textContent = msg;
}
