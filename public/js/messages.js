/* Dashboard - User Messages */
// Tiny helpers (local to this bundle)
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { credentials: 'same-origin', ...opts });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} ${text}`.trim());
  }
  return res.json();
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function html(strings, ...values) {
  return strings.reduce((out, s, i) => out + s + (i < values.length ? String(values[i]) : ''), '');
}

const state = {
  page: 1,
  pageSize: 10,
  q: ''
};

function flagEmoji(countryCode) {
  if (!countryCode) {
    return '';
  }
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return '';
  }
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

function badge(key, value) {
  const content = value == null ? '' : String(value);
  if (!content) {
    return '';
  }
  return `<span class="badge text-bg-secondary me-1">${escapeHtml(key)}: ${escapeHtml(content)}</span>`;
}

function renderCard(row) {
  const ip = row.sender_ip || '';
  const country = row.sender_country || '';
  const ttr = Number(row.time_to_result) || 0;
  let fields = '';
  try {
    const mf =
      typeof row.message_fields === 'string' ? JSON.parse(row.message_fields) : row.message_fields;
    if (mf && typeof mf === 'object') {
      for (const [k, v] of Object.entries(mf)) {
        fields += badge(k, v);
      }
    }
  } catch {
    // ignore bad JSON
  }
  const headerBits = [];
  if (ip) {
    headerBits.push(`<span title="Sender IP">${escapeHtml(ip)}</span>`);
  }
  if (country) {
    headerBits.push(`<span title="Country">${flagEmoji(country)} ${escapeHtml(country)}</span>`);
  }
  const header = headerBits.join(' · ');

  const body = escapeHtml(row.message_body || '');
  const when = row.event_time ? new Date(row.event_time).toLocaleString() : '';
  const resultBadge = row.is_spam
    ? '<span class="badge text-bg-danger">Spam</span>'
    : row.is_ham
      ? '<span class="badge text-bg-success">Ham</span>'
      : '';

  return html` <div class="col-12">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          ${resultBadge}
          <span>${header || '<span class="text-muted">Unknown sender</span>'}</span>
        </div>
        <div>${fields}</div>
      </div>
      <div class="card-body">
        <pre class="mb-0" style="white-space: pre-wrap;">${body}</pre>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center small text-muted">
        <span>${when}</span>
        <span title="Classification time">${ttr} ms</span>
      </div>
    </div>
  </div>`;
}

function renderPagination(p) {
  const ul = document.getElementById('messagesPagination');
  ul.innerHTML = '';
  const { currentPage, totalPages } = p;
  function li(page, label, disabled = false, active = false) {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = label;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (disabled || active) {
        return;
      }
      state.page = page;
      load();
    });
    li.appendChild(a);
    ul.appendChild(li);
  }
  li(Math.max(1, currentPage - 1), 'Prev', currentPage <= 1);
  for (let i = 1; i <= totalPages; i++) {
    li(i, String(i), false, i === currentPage);
  }
  li(Math.min(totalPages, currentPage + 1), 'Next', currentPage >= totalPages);
}

async function load() {
  const status = document.getElementById('messagesStatus');
  const list = document.getElementById('messagesList');
  status.textContent = 'Loading…';
  list.innerHTML = '';

  const params = new URLSearchParams();
  params.set('page', String(state.page));
  params.set('pageSize', String(state.pageSize));
  if (state.q) {
    params.set('q', state.q);
  }

  try {
    const data = await fetchJson(`/api/dash/messages?${params.toString()}`);
    const { items, pagination } = data;
    if (!items || items.length === 0) {
      status.textContent = 'No messages found';
      renderPagination(pagination);
      return;
    }
    status.textContent = `${pagination.total} total, page ${pagination.currentPage} of ${pagination.totalPages}`;
    list.innerHTML = items.map(renderCard).join('');
    renderPagination(pagination);
  } catch (err) {
    status.textContent = 'Failed to load messages';
    console.error(err);
  }
}

function bindSearch() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchQuery');
  const clear = document.getElementById('clearSearch');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = input.value.trim();
    state.page = 1;
    load();
  });
  clear.addEventListener('click', () => {
    input.value = '';
    state.q = '';
    state.page = 1;
    load();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindSearch();
  load();
});
