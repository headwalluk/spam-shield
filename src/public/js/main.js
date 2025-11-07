document.addEventListener('DOMContentLoaded', () => {
  // Theme handling (Auto/Light/Dark)
  const storedTheme = localStorage.getItem('theme') || 'auto';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const getAppliedTheme = (theme) => {
    if (theme === 'auto') return prefersDark.matches ? 'dark' : 'light';
    return theme;
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-bs-theme', getAppliedTheme(theme));
    localStorage.setItem('theme', theme);
  };

  // Apply on load
  applyTheme(storedTheme);

  // React to system changes when in auto
  prefersDark.addEventListener('change', () => {
    if ((localStorage.getItem('theme') || 'auto') === 'auto') {
      applyTheme('auto');
    }
  });

  // Hook up dropdown actions
  document
    .querySelectorAll('[data-theme]')
    .forEach((btn) =>
      btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme')))
    );

  // Existing demo form logic (guarded if elements not present)
  const form = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const resultContainer = document.getElementById('resultContainer');

  if (form && messageInput && resultContainer) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const messageText = messageInput.value;

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: messageText })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        resultContainer.innerHTML = `Spam Score: ${data.spamScore}`;
      } catch (error) {
        resultContainer.innerHTML = `Error: ${error.message}`;
      }

      // Registration page: generate password
      const genBtn = document.getElementById('genPasswordBtn');
      const pwInput = document.getElementById('password');
      if (genBtn && pwInput) {
        genBtn.addEventListener('click', async () => {
          genBtn.disabled = true;
          try {
            const res = await fetch('/api/v3/auth/generate-password');
            if (!res.ok) throw new Error('Failed to generate');
            const data = await res.json();
            pwInput.value = data.password;
            pwInput.type = 'text'; // show generated value
            setTimeout(() => {
              pwInput.type = 'password';
            }, 3000);
          } catch (e) {
            // no-op; optional toast could be added
          } finally {
            genBtn.disabled = false;
          }
        });
      }
    });
  }
});
