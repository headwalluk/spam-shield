// Login page script
function postJSON(url, data) {
  return fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text();
      throw new Error(t || `HTTP ${r.status}`);
    }
    return r.json().catch(() => ({}));
  });
}

const form = document.getElementById('loginForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    const errEl = document.getElementById('loginError');
    errEl.classList.add('d-none');
    try {
      await postJSON('/api/v3/auth/login', { email, password });
      // Session cookie set by server
      window.location.href = '/dash';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('d-none');
    }
  });
}
