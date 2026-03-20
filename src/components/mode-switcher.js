const MODES = [
  { id: 'standard', label: 'Standard' },
  { id: 'scientific', label: 'Scientific' },
  { id: 'programmer', label: 'Programmer' },
];

export function createModeSwitcher(container) {
  const nav = document.createElement('nav');
  nav.className = 'calculator__modes';
  nav.setAttribute('aria-label', 'Calculator modes');

  let currentMode = 'standard';
  const buttons = {};

  MODES.forEach((mode) => {
    const btn = document.createElement('button');
    btn.className = `mode-btn ${mode.id === currentMode ? 'mode-btn--active' : ''}`;
    btn.textContent = mode.label;
    btn.setAttribute('aria-pressed', mode.id === currentMode);
    btn.disabled = mode.id !== 'standard'; // Only standard is implemented

    btn.addEventListener('click', () => {
      if (mode.id !== 'standard') return;
      setActive(mode.id);
    });

    buttons[mode.id] = btn;
    nav.appendChild(btn);
  });

  container.appendChild(nav);

  function setActive(modeId) {
    currentMode = modeId;
    Object.entries(buttons).forEach(([id, btn]) => {
      btn.classList.toggle('mode-btn--active', id === modeId);
      btn.setAttribute('aria-pressed', id === modeId);
    });
  }

  return { setActive };
}
