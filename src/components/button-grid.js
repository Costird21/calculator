const STANDARD_BUTTONS = [
  { label: 'AC', action: { type: 'CLEAR' }, className: 'btn--action' },
  { label: 'CE', action: { type: 'CLEAR_ENTRY' }, className: 'btn--action' },
  { label: '%', action: { type: 'PERCENT' }, className: 'btn--action' },
  {
    label: '\u00f7',
    action: { type: 'INPUT_OPERATOR', payload: '/' },
    className: 'btn--operator',
  },
  { label: '7', action: { type: 'INPUT_DIGIT', payload: '7' } },
  { label: '8', action: { type: 'INPUT_DIGIT', payload: '8' } },
  { label: '9', action: { type: 'INPUT_DIGIT', payload: '9' } },
  {
    label: '\u00d7',
    action: { type: 'INPUT_OPERATOR', payload: '*' },
    className: 'btn--operator',
  },
  { label: '4', action: { type: 'INPUT_DIGIT', payload: '4' } },
  { label: '5', action: { type: 'INPUT_DIGIT', payload: '5' } },
  { label: '6', action: { type: 'INPUT_DIGIT', payload: '6' } },
  {
    label: '\u2212',
    action: { type: 'INPUT_OPERATOR', payload: '-' },
    className: 'btn--operator',
  },
  { label: '1', action: { type: 'INPUT_DIGIT', payload: '1' } },
  { label: '2', action: { type: 'INPUT_DIGIT', payload: '2' } },
  { label: '3', action: { type: 'INPUT_DIGIT', payload: '3' } },
  {
    label: '+',
    action: { type: 'INPUT_OPERATOR', payload: '+' },
    className: 'btn--operator',
  },
  {
    label: '\u00b1',
    action: { type: 'TOGGLE_SIGN' },
    className: '',
  },
  { label: '0', action: { type: 'INPUT_DIGIT', payload: '0' } },
  { label: '.', action: { type: 'INPUT_DECIMAL' } },
  {
    label: '=',
    action: { type: 'CALCULATE' },
    className: 'btn--equals',
  },
];

export function createButtonGrid(container, store) {
  const grid = document.createElement('div');
  grid.className = 'button-grid';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Calculator buttons');

  const buttonMap = new Map();

  STANDARD_BUTTONS.forEach((btnDef) => {
    const btn = document.createElement('button');
    btn.className = `btn ${btnDef.className || ''}`.trim();
    btn.textContent = btnDef.label;
    btn.setAttribute('aria-label', getAriaLabel(btnDef));

    btn.addEventListener('click', () => {
      store.dispatch(btnDef.action);
    });

    // Store reference for keyboard highlighting
    const key = actionToKey(btnDef.action);
    if (key) {
      buttonMap.set(key, btn);
    }

    grid.appendChild(btn);
  });

  container.appendChild(grid);

  return { buttonMap };
}

function getAriaLabel(btnDef) {
  const labels = {
    '\u00f7': 'Divide',
    '\u00d7': 'Multiply',
    '\u2212': 'Subtract',
    '+': 'Add',
    '\u00b1': 'Toggle sign',
    AC: 'All clear',
    CE: 'Clear entry',
    '%': 'Percent',
    '=': 'Equals',
    '.': 'Decimal point',
  };
  return labels[btnDef.label] || btnDef.label;
}

function actionToKey(action) {
  if (action.type === 'INPUT_DIGIT') return `digit-${action.payload}`;
  if (action.type === 'INPUT_OPERATOR') return `op-${action.payload}`;
  if (action.type === 'INPUT_DECIMAL') return 'decimal';
  if (action.type === 'CALCULATE') return 'equals';
  if (action.type === 'CLEAR') return 'clear';
  if (action.type === 'CLEAR_ENTRY') return 'clear-entry';
  if (action.type === 'BACKSPACE') return 'backspace';
  if (action.type === 'PERCENT') return 'percent';
  if (action.type === 'TOGGLE_SIGN') return 'toggle-sign';
  return null;
}
