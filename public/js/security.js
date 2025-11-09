// Optional: verify Bootstrap JS readiness
if (typeof window.assertBootstrapReady === 'function') {
  window.assertBootstrapReady('security');
}

document.addEventListener('DOMContentLoaded', () => {
  const securityForm = document.getElementById('security-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const toastContainer = document.querySelector('.toast-container');

  const showToast = (message, type = 'success') => {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.role = 'alert';
    toastEl.ariaLive = 'assertive';
    toastEl.ariaAtomic = 'true';
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    if (!toastContainer) {
      console.error('Toast container not found!');
      return;
    }
    toastContainer.appendChild(toastEl);
    if (window.bootstrap) {
      const toast = new window.bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
      toast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/v3/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const user = await response.json();
      emailInput.value = user.email;
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('Could not load your current information.', 'danger');
    }
  };

  securityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const payload = { email };
    if (password) {
      payload.password = password;
    }

    try {
      const response = await fetch('/api/v3/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update' }));
        throw new Error(errorData.message || 'An unknown error occurred');
      }

      showToast('Your details have been updated successfully.');
      passwordInput.value = ''; // Clear password field after successful update
    } catch (error) {
      console.error('Error updating details:', error);
      showToast(`Update failed: ${error.message}`, 'danger');
    }
  });

  loadCurrentUser();
});
