(() => {
  // public/js/login.js
  if (typeof window.assertBootstrapReady === 'function') {
    window.assertBootstrapReady('login');
  }
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
  var form = document.getElementById('loginForm');
  var loadingSpinner = document.getElementById('loadingSpinner');
  var showSpinner = () => {
    loadingSpinner.classList.remove('d-none', 'fade');
  };
  var hideSpinner = () => {
    loadingSpinner.classList.add('fade');
    setTimeout(() => {
      loadingSpinner.classList.add('d-none');
    }, 150);
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
})();
//# sourceMappingURL=login.bundle.js.map
