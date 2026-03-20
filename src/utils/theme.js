const STORAGE_KEY = 'calculator-theme';

export function setupTheme(toggleBtn) {
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  applyTheme(isDark);
  updateButton(toggleBtn, isDark);

  toggleBtn.addEventListener('click', () => {
    const currentlyDark =
      document.documentElement.getAttribute('data-theme') !== 'light';
    const newIsDark = !currentlyDark;
    applyTheme(newIsDark);
    updateButton(toggleBtn, newIsDark);
    localStorage.setItem(STORAGE_KEY, newIsDark ? 'dark' : 'light');
  });
}

function applyTheme(isDark) {
  document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'dark' : 'light'
  );
}

function updateButton(btn, isDark) {
  btn.textContent = isDark ? '\u2600' : '\u263E';
  btn.setAttribute(
    'aria-label',
    isDark ? 'Switch to light theme' : 'Switch to dark theme'
  );
}
