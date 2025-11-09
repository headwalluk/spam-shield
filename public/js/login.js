// Optional: verify Bootstrap JS readiness early
if (typeof window.assertBootstrapReady === 'function') {
  window.assertBootstrapReady('login');
}
// Login page script
function postJSON(url, data) {
  return fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(async (r) => {
    if (!r.ok) {
      const errorJson = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
      throw errorJson;
    }
    return r.json().catch(() => ({}));
  });
}

const form = document.getElementById('loginForm');
const loadingSpinner = document.getElementById('loadingSpinner');

const showSpinner = () => {
  loadingSpinner.classList.remove('d-none', 'fade');
};

const hideSpinner = () => {
  loadingSpinner.classList.add('fade');
  setTimeout(() => {
    loadingSpinner.classList.add('d-none');
  }, 150); // Match Bootstrap's fade duration
};

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner();
    const email = form.email.value.trim();
    const password = form.password.value;
    const errEl = document.getElementById('loginError');
    errEl.classList.add('d-none');
    try {
      await postJSON('/api/v3/auth/login', { email, password });
      // Session cookie set by server
      window.location.href = '/dash';
    } catch (err) {
      let message = 'An unknown error occurred.';
      if (err.error === 'INVALID_CREDENTIALS') {
        message = 'Invalid email or password. Please try again.';
      } else if (err.message) {
        message = err.message;
      }
      errEl.textContent = message;
      errEl.classList.remove('d-none');
    } finally {
      hideSpinner();
    }
  });
}
