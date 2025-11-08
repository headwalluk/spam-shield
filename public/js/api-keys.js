document.addEventListener('DOMContentLoaded', () => {
  // API Key modal logic
  const apiKeyModal = document.getElementById('apiKeyModal');
  if (apiKeyModal) {
    const modalTitle = apiKeyModal.querySelector('.modal-title');
    const form = apiKeyModal.querySelector('#apiKeyForm');
    const input = apiKeyModal.querySelector('#apiKeyNameInput');

    apiKeyModal.addEventListener('show.bs.modal', (event) => {
      const button = event.relatedTarget;
      const keyId = button.getAttribute('data-key-id');
      const keyLabel = button.getAttribute('data-key-label');

      if (keyId) {
        // Editing an existing key
        modalTitle.textContent = 'Edit API Key';
        form.action = `/keys/${keyId}/relabel`;
        input.value = keyLabel;
      } else {
        // Creating a new key
        modalTitle.textContent = 'Create API Key';
        form.action = '/keys';
        input.value = '';
      }
    });

    apiKeyModal.addEventListener('shown.bs.modal', () => {
      input.focus();
    });

    form.addEventListener('submit', async (e) => {
      if (form.action.endsWith('/keys')) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
          const response = await fetch('/keys', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            const { apiKey } = await response.json();
            const newApiKeySection = document.getElementById('newApiKeySection');
            const newApiKeyElement = document.getElementById('newApiKey');
            const copyNewApiKeyButton = document.getElementById('copyNewApiKey');

            newApiKeyElement.textContent = apiKey;
            copyNewApiKeyButton.setAttribute('data-copy-text', apiKey);
            newApiKeySection.classList.remove('d-none');

            copyNewApiKeyButton.addEventListener('click', () => {
              navigator.clipboard.writeText(apiKey).then(() => {
                copyNewApiKeyButton.innerHTML = '<i class="bi bi-check-lg me-2"></i> Copied!';
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              });
            });

            // Expect Bootstrap JS loaded globally in bundle
            const modal = window.bootstrap ? window.bootstrap.Modal.getInstance(apiKeyModal) : null;
            modal.hide();
          } else {
            alert('Error creating API key');
          }
        } catch (error) {
          alert('Error creating API key');
        }
      }
    });
  }

  document.querySelectorAll('[data-delete-key]').forEach((button) => {
    button.addEventListener('click', async (e) => {
      if (confirm('Are you sure you want to delete this API key?')) {
        const keyId = button.getAttribute('data-key-id');
        try {
          const response = await fetch(`/keys/${keyId}/delete`, {
            method: 'POST'
          });
          if (response.ok) {
            window.location.reload();
          } else {
            alert('Error deleting API key');
          }
        } catch (error) {
          alert('Error deleting API key');
        }
      }
    });
  });
});
