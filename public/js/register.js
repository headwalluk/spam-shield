// Optional: verify Bootstrap JS readiness early
if (typeof window.assertBootstrapReady === 'function') {
  window.assertBootstrapReady('register');
}
// Register page logic

function setStatus(el, type, message) {
  if (!el) {
    return;
  }
  el.innerHTML = '';
  const div = document.createElement('div');
  div.className = `alert alert-${type} py-2 mb-0`;
  div.textContent = message;
  el.appendChild(div);
}

function validateForm(form) {
  if (!form) {
    return false;
  }
  form.classList.add('was-validated');
  return form.checkValidity();
}

const loadingSpinner = document.getElementById('loadingSpinner');

const showSpinner = () => {
  if (loadingSpinner) {
    loadingSpinner.classList.remove('d-none', 'fade');
  }
};

const hideSpinner = () => {
  if (loadingSpinner) {
    loadingSpinner.classList.add('fade');
    setTimeout(() => {
      loadingSpinner.classList.add('d-none');
    }, 150); // Match Bootstrap's fade duration
  }
};

async function onSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const resultEl = document.getElementById('register-result');
  if (!validateForm(form)) {
    setStatus(resultEl, 'danger', 'Please fix the highlighted fields.');
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  showSpinner();
  try {
    const res = await fetch('/api/v3/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email: data.email, password: data.password })
    });
    if (res.status === 201) {
      setStatus(
        resultEl,
        'success',
        'Registration successful. Please check your email to verify your account before logging in.'
      );
      form.reset();
      form.classList.remove('was-validated');
      return;
    }
    const payload = await res.json().catch(() => ({}));
    if (res.status === 409 && payload.error === 'EMAIL_EXISTS') {
      setStatus(resultEl, 'warning', 'That email is already registered. Try logging in.');
      return;
    }
    if (res.status === 400 && payload.error === 'WEAK_PASSWORD') {
      setStatus(resultEl, 'danger', 'Password does not meet the strength policy.');
      return;
    }
    if (res.status === 403 && payload.error === 'REGISTRATION_DISABLED') {
      setStatus(resultEl, 'warning', 'Registration is currently disabled.');
      return;
    }
    setStatus(resultEl, 'danger', 'Registration failed. Please try again.');
  } catch {
    setStatus(resultEl, 'danger', 'Network error. Please try again.');
  } finally {
    hideSpinner();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', onSubmit);
  }
});
