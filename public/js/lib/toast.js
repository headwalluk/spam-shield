export function showToast(message, { variant = 'primary', delay = 4000 } = {}) {
  const container = document.querySelector('.toast-container');
  if (!container) {
    console.warn('[toast] Missing .toast-container');
    return;
  }
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${variant} border-0`;
  el.role = 'alert';
  el.ariaLive = 'assertive';
  el.ariaAtomic = 'true';
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  container.appendChild(el);
  if (window.bootstrap && window.bootstrap.Toast) {
    const toast = new window.bootstrap.Toast(el, { autohide: true, delay });
    toast.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
  }
}
