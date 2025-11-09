import { showToast } from './lib/toast.js';

function $(sel, root = document) {
  return root.querySelector(sel);
}

// Loading spinner helpers (match /admin/users behavior)
function showLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.classList.remove('d-none', 'fade');
  }
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.classList.add('fade');
    setTimeout(() => {
      spinner.classList.add('d-none');
    }, 150); // Match Bootstrap's fade duration
  }
}

function createRow(country) {
  const tr = document.createElement('tr');
  tr.dataset.code2 = country.country_code2;

  tr.innerHTML = `
    <td class="align-middle">${flagCell(country.country_code2)}</td>
    <td><code>${country.country_code2}</code></td>
    <td>
      <input type="text" class="form-control form-control-sm code3-input" value="${
        country.country_code3 || ''
      }" maxlength="3" />
    </td>
    <td>
      <input type="text" class="form-control form-control-sm name-input" value="${
        country.name || ''
      }" />
    </td>
    <td style="max-width:120px">
      <input type="number" class="form-control form-control-sm score-input" value="${
        Number(country.score) || 0
      }" step="1" />
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-primary save-btn"><i class="bi bi-save"></i> Save</button>
    </td>
  `;

  const saveBtn = tr.querySelector('.save-btn');
  saveBtn.addEventListener('click', async () => {
    await saveRow(tr);
  });
  return tr;
}

function flagCell(code2) {
  if (!code2 || code2 === '??') {
    return '<span class="text-muted">&mdash;</span>';
  }
  const c = code2.toLowerCase();
  // Using dedicated /flags directory with lowercase ISO alpha-2 SVGs
  return `<img src="/flags/${c}.svg" loading="lazy" alt="${code2} flag" class="country-flag" style="width:24px;height:18px;object-fit:cover;border:1px solid #dee2e6;border-radius:2px;background:#fff" onerror="this.replaceWith(document.createElement('span'))">`;
}

async function fetchCountries() {
  const res = await fetch('/api/v3/countries', { credentials: 'same-origin' });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

function applyFilters(data) {
  const q = ($('#searchInput').value || '').trim().toLowerCase();
  const scoreFilter = $('#scoreFilter').value;
  let filtered = data;
  if (q) {
    filtered = filtered.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.country_code2 || '').toLowerCase().includes(q) ||
        (c.country_code3 || '').toLowerCase().includes(q)
      );
    });
  }
  if (scoreFilter === 'neg') {
    filtered = filtered.filter((c) => Number(c.score) < 0);
  }
  if (scoreFilter === 'zero') {
    filtered = filtered.filter((c) => Number(c.score) === 0);
  }
  if (scoreFilter === 'pos') {
    filtered = filtered.filter((c) => Number(c.score) > 0);
  }
  return filtered;
}

async function saveRow(tr) {
  const code2 = tr.dataset.code2;
  const name = tr.querySelector('.name-input').value.trim();
  const country_code3 = tr.querySelector('.code3-input').value.trim().toUpperCase();
  const score = Number(tr.querySelector('.score-input').value);
  const btn = tr.querySelector('.save-btn');
  try {
    btn.disabled = true;
    showLoadingSpinner();
    const res = await fetch(`/api/v3/countries/${encodeURIComponent(code2)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ name, score, country_code3 })
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    showToast('Saved', { variant: 'success' });
  } catch (err) {
    console.error(err);
    showToast(`Save failed: ${err.message}`, { variant: 'danger' });
  } finally {
    btn.disabled = false;
    hideLoadingSpinner();
  }
}

function renderTable(data) {
  const tbody = document.getElementById('countriesTbody');
  tbody.innerHTML = '';
  const rows = applyFilters(data);
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="text-muted">No results</td>';
    tbody.appendChild(tr);
  } else {
    rows.forEach((c) => tbody.appendChild(createRow(c)));
  }
  document.getElementById('countSummary').textContent = `${rows.length} / ${data.length}`;
}

async function init() {
  if (!window.assertBootstrapReady || !window.assertBootstrapReady('admin-countries')) {
    // continue anyway; only a console warn is emitted
  }
  try {
    showLoadingSpinner();
    const data = await fetchCountries();
    const original = Array.isArray(data) ? data : [];
    renderTable(original);
    document.getElementById('filterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      renderTable(original);
    });
    document.getElementById('searchInput').addEventListener('input', () => renderTable(original));
    document.getElementById('scoreFilter').addEventListener('change', () => renderTable(original));
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById('countriesTbody');
    tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load: ${err.message}</td></tr>`;
  } finally {
    hideLoadingSpinner();
  }
}

document.addEventListener('DOMContentLoaded', init);
