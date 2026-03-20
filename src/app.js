import { createStore, getInitialState } from './state/calculator-state.js';
import { createDisplay } from './components/display.js';
import { createButtonGrid } from './components/button-grid.js';
import { createScientificGrid } from './components/scientific-grid.js';
import { createProgrammerGrid } from './components/programmer-grid.js';
import { createModeSwitcher } from './components/mode-switcher.js';
import { createHistoryPanel } from './components/history-panel.js';
import { setupKeyboard } from './utils/keyboard.js';
import { setupTheme } from './utils/theme.js';

export function initApp(root) {
  const store = createStore(getInitialState());

  // Build the calculator shell
  const calculator = document.createElement('main');
  calculator.className = 'calculator';
  calculator.setAttribute('role', 'application');
  calculator.setAttribute('aria-label', 'Calculator');

  // Header: mode tabs + controls
  const header = document.createElement('div');
  header.className = 'calculator__header';

  createModeSwitcher(header, (mode) => {
    store.dispatch({ type: 'SWITCH_MODE', payload: mode });
    calculator.className = `calculator calculator--${mode}`;
  });

  const controls = document.createElement('div');
  controls.className = 'calculator__controls';

  const historyBtn = document.createElement('button');
  historyBtn.className = 'control-btn';
  historyBtn.textContent = '\u29D6';
  historyBtn.setAttribute('aria-label', 'Toggle history panel');

  const themeBtn = document.createElement('button');
  themeBtn.className = 'control-btn';
  themeBtn.setAttribute('aria-label', 'Toggle theme');

  controls.appendChild(historyBtn);
  controls.appendChild(themeBtn);
  header.appendChild(controls);
  calculator.appendChild(header);

  // Display
  const display = createDisplay(calculator);

  // Scientific function buttons (above the main grid)
  const sciGrid = createScientificGrid(calculator, store);

  // Programmer controls (above the main grid)
  const progGrid = createProgrammerGrid(calculator, store);

  // Standard button grid
  const { buttonMap } = createButtonGrid(calculator, store);

  root.appendChild(calculator);

  // History panel
  const historyPanel = createHistoryPanel(store);
  historyBtn.addEventListener('click', () => historyPanel.toggle());

  // Theme toggle
  setupTheme(themeBtn);

  // Keyboard support
  setupKeyboard(store, buttonMap);

  // Subscribe to state changes
  let pendingResult = null;

  store.subscribe((state) => {
    display.update(state);
    sciGrid.update(state);
    progGrid.update(state);

    // Add to history when a calculation completes
    if (state.lastResult && state.lastResult !== pendingResult) {
      pendingResult = state.lastResult;
      historyPanel.addEntry(state.lastResult);
    }
  });
}
