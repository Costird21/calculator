const STORAGE_KEY = 'calculator-history';

export function createHistoryPanel(store) {
  let history = loadHistory();
  let isOpen = false;

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'history-overlay';
  overlay.addEventListener('click', close);
  document.body.appendChild(overlay);

  // Panel
  const panel = document.createElement('aside');
  panel.className = 'history-panel';
  panel.setAttribute('aria-label', 'Calculation history');
  panel.innerHTML = `
    <div class="history-panel__header">
      <span class="history-panel__title">History</span>
      <button class="history-panel__clear" aria-label="Clear history">Clear</button>
    </div>
    <div class="history-panel__list"></div>
  `;

  panel.querySelector('.history-panel__clear').addEventListener('click', () => {
    history = [];
    saveHistory(history);
    renderList();
  });

  document.body.appendChild(panel);

  const listEl = panel.querySelector('.history-panel__list');

  function toggle() {
    isOpen ? close() : open();
  }

  function open() {
    isOpen = true;
    panel.classList.add('history-panel--open');
    overlay.classList.add('history-overlay--visible');
  }

  function close() {
    isOpen = false;
    panel.classList.remove('history-panel--open');
    overlay.classList.remove('history-overlay--visible');
  }

  function addEntry(entry) {
    history.unshift(entry);
    if (history.length > 50) history.pop();
    saveHistory(history);
    renderList();
  }

  function renderList() {
    if (history.length === 0) {
      listEl.innerHTML =
        '<div class="history-panel__empty">No history yet</div>';
      return;
    }

    listEl.innerHTML = '';
    history.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.innerHTML = `
        <div class="history-item__expression">${escapeHtml(item.expression)}</div>
        <div class="history-item__result">${escapeHtml(item.result)}</div>
      `;
      el.addEventListener('click', () => {
        store.dispatch({ type: 'SET_VALUE', payload: item.result });
        close();
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          store.dispatch({ type: 'SET_VALUE', payload: item.result });
          close();
        }
      });
      listEl.appendChild(el);
    });
  }

  renderList();

  return { toggle, addEntry };
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage full or unavailable
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
