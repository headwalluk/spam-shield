/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  'use strict';

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return '';
  }

  const getStoredTheme = () => getCookie('theme') || null;

  const setStoredTheme = (theme) => {
    // 400 days (Chrome cap); SameSite=Lax to send on top-level navigations only
    try {
      document.cookie = `theme=${theme}; Path=/; Max-Age=34560000; SameSite=Lax`;
    } catch {
      // ignore cookie errors
    }
  };

  // New logic: default to light if no cookie; no automatic system preference detection.
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return 'light';
  };

  const setTheme = (theme) => {
    if (theme !== 'dark' && theme !== 'light') {
      theme = 'light';
    }
    document.documentElement.setAttribute('data-bs-theme', theme);
  };

  setTheme(getPreferredTheme());

  const updateToggleButton = (theme) => {
    const btn = document.getElementById('themeToggle');
    if (!btn) {
      return;
    }
    const icon = btn.querySelector('.bi');
    // Decide next theme and icon
    if (theme === 'dark') {
      // Show dark icon, label for switching to light on next click
      icon.className = 'bi bi-moon-stars-fill';
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('data-next-theme', 'light');
      btn.title = 'Switch to light theme';
    } else {
      icon.className = 'bi bi-sun-fill';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('data-next-theme', 'dark');
      btn.title = 'Switch to dark theme';
    }
  };

  // Removed system preference listener since auto mode is deprecated.

  function initThemeControls() {
    const current = getPreferredTheme();
    updateToggleButton(current);
    const btn = document.getElementById('themeToggle');
    if (btn && !btn.getAttribute('data-theme-init')) {
      btn.setAttribute('data-theme-init', '1');
      btn.addEventListener('click', () => {
        const next = btn.getAttribute('data-next-theme') === 'dark' ? 'dark' : 'light';
        setStoredTheme(next);
        setTheme(next);
        updateToggleButton(next);
      });
    }
  }

  // Expose a global initializer so late-inserted controls (e.g. injected header)
  // can be wired up after they are added to the DOM.
  window.ThemeSwitcherInit = initThemeControls;
  // Auto-initialize on DOM ready (header/footer are server-injected now)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        initThemeControls();
      } catch {
        /* noop */
      }
    });
  } else {
    try {
      initThemeControls();
    } catch {
      /* noop */
    }
  }
})();
