// Bundle entry for application JS (browser)
// - Includes Bootstrap JS (requires Popper)
// - Includes theme + main, plus dynamic header/footer + nav actions
import 'bootstrap';
import './theme.js';

async function inject(id, url) {
  const placeholder = document.getElementById(id);
  if (!placeholder) {
    return;
  }
  try {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const html = await res.text();
    placeholder.innerHTML = html;
  } catch (err) {
    console.warn(`[layout] Failed to load ${url}:`, err.message);
  }
}

async function renderNav() {
  try {
    const res = await fetch('/api/v3/state', { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const state = await res.json();
    const container = document.getElementById('nav-actions');
    if (container && state && Array.isArray(state.sitemap)) {
      container.innerHTML = '';
      state.sitemap.forEach((item) => {
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.text;
        const base = 'btn';
        const classes = (item.type || '').split(/\s+/).filter(Boolean);
        if (!classes.includes(base)) {
          classes.unshift(base);
        }
        if (!classes.includes('btn-sm')) {
          classes.push('btn-sm');
        }
        a.className = classes.join(' ');
        container.appendChild(a);
      });

      // Append Logout button for authenticated users
      if (state.isAuthenticated === true) {
        const logoutBtn = document.createElement('button');
        logoutBtn.type = 'button';
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'btn btn-outline-secondary btn-sm';
        logoutBtn.addEventListener('click', async () => {
          try {
            await fetch('/api/v3/auth/logout', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (_e) {
            // ignore network errors and still redirect
          } finally {
            // Redirect to front page
            window.location.href = '/';
          }
        });
        container.appendChild(logoutBtn);
      }
    }
  } catch (e) {
    console.warn('[layout] Failed to render nav actions from /api/v3/state:', e.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    inject('header-placeholder', '/partials/header.html'),
    inject('footer-placeholder', '/partials/footer.html')
  ]);
  // Initialize theme controls after header has been injected
  if (typeof window.ThemeSwitcherInit === 'function') {
    window.ThemeSwitcherInit();
  }
  await renderNav();
});
