// Use global bootstrap provided by main bundle instead of importing again
if (typeof window.assertBootstrapReady === 'function') {
  window.assertBootstrapReady('api-keys');
}
const Modal = window.bootstrap ? window.bootstrap.Modal : null;

document.addEventListener('DOMContentLoaded', () => {
  const createKeyBtn = document.getElementById('createKeyBtn');
  const refreshKeysBtn = document.getElementById('refreshKeysBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const apiKeysTable = document.getElementById('apiKeysTable');
  const tableBody = apiKeysTable.querySelector('tbody');

  // Modals
  const keyModalEl = document.getElementById('keyModal');
  const keyModal = Modal ? Modal.getOrCreateInstance(keyModalEl) : null;
  const keyModalLabel = document.getElementById('keyModalLabel');
  const keyIdInput = document.getElementById('keyId');
  const keyLabelInput = document.getElementById('keyLabel');
  const saveKeyBtn = document.getElementById('saveKeyBtn');

  const showKeyModalEl = document.getElementById('showKeyModal');
  const showKeyModal = Modal ? Modal.getOrCreateInstance(showKeyModalEl) : null;
  const newApiKeyInput = document.getElementById('newApiKey');
  const copyKeyBtn = document.getElementById('copyKeyBtn');

  const fetchKeys = async () => {
    loadingSpinner.style.display = 'block';
    apiKeysTable.style.display = 'none';
    try {
      const response = await fetch('/api/v3/api-keys');
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const keys = await response.json();
      renderTable(keys);
    } catch (error) {
      console.error(error);
      tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-danger">Error loading API keys.</td></tr>`;
    } finally {
      loadingSpinner.style.display = 'none';
      apiKeysTable.style.display = 'table';
    }
  };

  const renderTable = (keys) => {
    tableBody.innerHTML = '';
    if (keys.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="2" class="text-center">No API keys found.</td></tr>`;
      return;
    }
    keys.forEach((key) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${key.label}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${key.id}" data-label="${key.label}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${key.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  };

  const openKeyModal = (id = null, label = '') => {
    keyIdInput.value = id || '';
    keyLabelInput.value = label;
    keyModalLabel.textContent = id ? 'Edit API Key' : 'Create API Key';
    if (keyModal) {
      keyModal.show();
    }
  };

  const saveKey = async () => {
    const id = keyIdInput.value;
    const label = keyLabelInput.value;
    const url = id ? `/api/v3/api-keys/${id}` : '/api/v3/api-keys';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      });

      if (!response.ok) {
        throw new Error('Failed to save key');
      }

      if (keyModal) {
        keyModal.hide();
      }

      if (method === 'POST') {
        const { apiKey } = await response.json();
        newApiKeyInput.value = apiKey;
        if (showKeyModal) {
          showKeyModal.show();
        }
      } else {
        await fetchKeys();
      }
    } catch (error) {
      console.error(error);
      alert('Error saving API key.');
    }
  };

  const deleteKey = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    try {
      const response = await fetch(`/api/v3/api-keys/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete key');
      }
      await fetchKeys();
    } catch (error) {
      console.error(error);
      alert('Error deleting API key.');
    }
  };

  // Event Listeners
  createKeyBtn.addEventListener('click', () => openKeyModal());
  refreshKeysBtn.addEventListener('click', fetchKeys);
  saveKeyBtn.addEventListener('click', saveKey);

  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const { id, label } = editBtn.dataset;
      openKeyModal(id, label);
      return;
    }

    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      deleteKey(deleteBtn.dataset.id);
    }
  });

  copyKeyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(newApiKeyInput.value).then(() => {
      const originalIcon = copyKeyBtn.innerHTML;
      copyKeyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
      setTimeout(() => {
        copyKeyBtn.innerHTML = originalIcon;
      }, 2000);
    });
  });

  showKeyModalEl.addEventListener('hidden.bs.modal', fetchKeys);

  // Initial fetch
  fetchKeys();
});
