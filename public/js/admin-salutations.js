import { showToast } from './lib/toast.js';

(function () {
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let currentSearch = '';
  const tbody = document.getElementById('salutationsTableBody');
  const paginationUl = document.getElementById('pagination');
  const loadingSpinner = document.getElementById('loadingSpinner');

  const modalEl = document.getElementById('salutationModal');
  let modal = null;
  if (modalEl && window.bootstrap) {
    modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
  }
  const form = document.getElementById('salutationForm');
  const phraseInput = document.getElementById('salutationPhraseInput');
  const scoreInput = document.getElementById('salutationScoreInput');
  const idInput = document.getElementById('salutationIdInput');
  const modalTitle = modalEl.querySelector('.modal-title');

  function showLoading() {
    loadingSpinner.classList.remove('d-none', 'fade');
  }
  function hideLoading() {
    loadingSpinner.classList.add('fade');
    setTimeout(() => loadingSpinner.classList.add('d-none'), 150);
  }

  function renderPagination(pagination) {
    const totalPages = pagination.totalPages || 1;
    paginationUl.innerHTML = '';
    if (totalPages <= 1) {
      return;
    }
    const windowSize = 5;
    const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const addPage = (i, label = null, disabled = false) => {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = label || i;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (disabled) {
          return;
        }
        currentPage = i;
        fetchPage();
      });
      li.appendChild(a);
      paginationUl.appendChild(li);
    };
    addPage(1, '«', currentPage === 1);
    addPage(Math.max(1, currentPage - 1), '‹', currentPage === 1);
    for (let i = start; i <= end; i++) {
      addPage(i);
    }
    addPage(Math.min(totalPages, currentPage + 1), '›', currentPage === totalPages);
    addPage(totalPages, '»', currentPage === totalPages);
  }

  function rowFor(p) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.phrase}</td><td>${Number(p.score)}</td><td class='text-end'>
    <button class='btn btn-sm btn-outline-primary' data-edit-salutation data-id='${p.id}' title='Edit' data-bs-toggle='modal' data-bs-target='#salutationModal'><i class='bi bi-pencil-square'></i></button>
    <button class='btn btn-sm btn-outline-danger' data-delete-salutation data-id='${p.id}' title='Delete'><i class='bi bi-trash'></i></button>
    </td>`;
    return tr;
  }

  function renderTable() {
    tbody.innerHTML = '';
    if (
      !window.__salutationsPage ||
      !Array.isArray(window.__salutationsPage.items) ||
      window.__salutationsPage.items.length === 0
    ) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="3" class="text-muted">No salutations found.</td>';
      tbody.appendChild(tr);
    } else {
      window.__salutationsPage.items.forEach((p) => tbody.appendChild(rowFor(p)));
    }
    renderPagination(window.__salutationsPage.pagination);
  }

  async function fetchPage() {
    showLoading();
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
        search: currentSearch
      });
      const res = await fetch(`/api/v3/salutations?${params.toString()}`, {
        credentials: 'same-origin'
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      window.__salutationsPage = data;
      renderTable();
    } catch (e) {
      console.error(e);
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-danger">Error loading salutations.</td></tr>';
    } finally {
      hideLoading();
    }
  }

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearch = document.getElementById('salutationSearchInput').value || '';
    currentPage = 1;
    fetchPage();
  });

  modalEl.addEventListener('show.bs.modal', (event) => {
    const btn = event.relatedTarget;
    const id = btn ? btn.getAttribute('data-id') : null;
    form.reset();
    idInput.value = '';
    scoreInput.value = '0';
    if (id) {
      const existing = window.__salutationsPage.items.find((x) => String(x.id) === String(id));
      if (existing) {
        modalTitle.textContent = 'Edit Salutation';
        idInput.value = existing.id;
        phraseInput.value = existing.phrase;
        scoreInput.value = existing.score;
      }
    } else {
      modalTitle.textContent = 'Create Salutation';
    }
  });
  modalEl.addEventListener('shown.bs.modal', () => {
    if (phraseInput) {
      phraseInput.focus();
      const v = phraseInput.value;
      phraseInput.value = '';
      phraseInput.value = v;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = idInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/v3/salutations/${id}` : '/api/v3/salutations';
    const payload = { phrase: phraseInput.value.trim(), score: Number(scoreInput.value || 0) };
    try {
      showLoading();
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      modalEl.addEventListener(
        'hidden.bs.modal',
        () => {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          showToast('Saved', { variant: 'success' });
          fetchPage();
        },
        { once: true }
      );
      if (modal) {
        modal.hide();
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving', { variant: 'danger' });
    } finally {
      hideLoading();
    }
  });

  document.body.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('[data-delete-salutation]');
    if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      if (!confirm('Delete this salutation?')) {
        return;
      }
      try {
        showLoading();
        const res = await fetch(`/api/v3/salutations/${id}`, {
          method: 'DELETE',
          credentials: 'same-origin'
        });
        if (!res.ok) {
          throw new Error('Delete failed');
        }
        showToast('Deleted', { variant: 'success' });
        fetchPage();
      } catch (err) {
        console.error(err);
        showToast('Delete failed', { variant: 'danger' });
      } finally {
        hideLoading();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', fetchPage);
})();
