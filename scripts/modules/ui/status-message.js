function showMessage(msg, type) {
    statusMessageEl.classList.remove('hidden', 'bg-blue-50', 'text-blue-700', 'bg-red-50', 'text-red-700', 'bg-green-50', 'text-green-700');
    const style = type === 'info' ? 'bg-blue-50 text-blue-700' : type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700';
    statusMessageEl.className = `text-center p-4 rounded-lg mb-4 text-sm font-medium ${style}`;
    statusMessageEl.textContent = msg;
}
