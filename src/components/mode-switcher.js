const MODES = [
  { id: 'standard', label: 'Standard', enabled: true },
  { id: 'scientific', label: 'Scientific', enabled: true },
  { id: 'programmer', label: 'Programmer', enabled: true },
];

export function createModeSwitcher(container, onSwitch) {
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
    btn.disabled = !mode.enabled;

    btn.addEventListener('click', () => {
      if (!mode.enabled || mode.id === currentMode) return;
      setActive(mode.id);
      if (onSwitch) onSwitch(mode.id);
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
