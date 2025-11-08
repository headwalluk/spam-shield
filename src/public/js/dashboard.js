import { Tooltip } from 'bootstrap';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl);
  });

  // Click-to-copy for API keys
  const copySpans = document.querySelectorAll('[data-copy-text]');
  copySpans.forEach((span) => {
    const tooltip = Tooltip.getInstance(span);
    span.addEventListener('click', () => {
      const textToCopy = span.getAttribute('data-copy-text');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalTitle = span.getAttribute('data-bs-original-title');
        tooltip.setContent({ '.tooltip-inner': 'Copied!' });
        tooltip.show();
        setTimeout(() => {
          tooltip.hide();
          tooltip.setContent({ '.tooltip-inner': originalTitle });
        }, 2000);
      });
    });
  });

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
        modalTitle.textContent = 'Edit API Key Name';
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
  }
});
