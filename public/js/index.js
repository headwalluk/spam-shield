// Bundle entry for application JS (browser)
// - Includes Bootstrap JS (requires Popper)
// - Includes theme + main, plus dynamic header/footer + nav actions
// Import Bootstrap ESM and expose a single global to avoid multiple instances across page bundles
import * as bootstrap from 'bootstrap';
if (!window.bootstrap) {
  window.bootstrap = bootstrap;
}

// Expose a tiny assertion helper so page bundles can verify ordering
if (!window.assertBootstrapReady) {
  window.assertBootstrapReady = function (context = 'page') {
    const ok = !!(window.bootstrap && (window.bootstrap.Dropdown || window.bootstrap.Modal));
    if (!ok) {
      if (!window.__bootstrapWarned) {
        console.warn(
          `[bootstrap] Bootstrap JS not initialized. Ensure /build/bundle.js loads before the ${context} bundle.`
        );
        window.__bootstrapWarned = true;
      }
      return false;
    }
    return true;
  };
}
import './theme.js';

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
        // logoutBtn.textContent = 'Logout';
        logoutBtn.innerHTML += '<i class="bi bi-box-arrow-right"></i>';
        logoutBtn.className = 'btn btn-outline-secondary btn-sm';
        logoutBtn.addEventListener('click', async () => {
          try {
            await fetch('/api/v3/auth/logout', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' }
            });
          } catch {
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
  // Partials are injected server-side; just render dynamic nav actions.
  await renderNav();
});
