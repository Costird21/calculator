const KEY_MAP = {
  0: { type: 'INPUT_DIGIT', payload: '0' },
  1: { type: 'INPUT_DIGIT', payload: '1' },
  2: { type: 'INPUT_DIGIT', payload: '2' },
  3: { type: 'INPUT_DIGIT', payload: '3' },
  4: { type: 'INPUT_DIGIT', payload: '4' },
  5: { type: 'INPUT_DIGIT', payload: '5' },
  6: { type: 'INPUT_DIGIT', payload: '6' },
  7: { type: 'INPUT_DIGIT', payload: '7' },
  8: { type: 'INPUT_DIGIT', payload: '8' },
  9: { type: 'INPUT_DIGIT', payload: '9' },
  a: { type: 'INPUT_DIGIT', payload: 'A' },
  b: { type: 'INPUT_DIGIT', payload: 'B' },
  c: { type: 'INPUT_DIGIT', payload: 'C' },
  d: { type: 'INPUT_DIGIT', payload: 'D' },
  e: { type: 'INPUT_DIGIT', payload: 'E' },
  f: { type: 'INPUT_DIGIT', payload: 'F' },
  A: { type: 'INPUT_DIGIT', payload: 'A' },
  B: { type: 'INPUT_DIGIT', payload: 'B' },
  C: { type: 'INPUT_DIGIT', payload: 'C' },
  D: { type: 'INPUT_DIGIT', payload: 'D' },
  E: { type: 'INPUT_DIGIT', payload: 'E' },
  F: { type: 'INPUT_DIGIT', payload: 'F' },
  '.': { type: 'INPUT_DECIMAL' },
  '+': { type: 'INPUT_OPERATOR', payload: '+' },
  '-': { type: 'INPUT_OPERATOR', payload: '-' },
  '*': { type: 'INPUT_OPERATOR', payload: '*' },
  '/': { type: 'INPUT_OPERATOR', payload: '/' },
  Enter: { type: 'CALCULATE' },
  '=': { type: 'CALCULATE' },
  Backspace: { type: 'BACKSPACE' },
  Delete: { type: 'CLEAR' },
  Escape: { type: 'CLEAR' },
  '%': { type: 'PERCENT' },
};

// Map actions to button keys for visual highlighting
const ACTION_TO_BUTTON_KEY = {
  INPUT_DIGIT: (action) => `digit-${action.payload}`,
  INPUT_OPERATOR: (action) => `op-${action.payload}`,
  INPUT_DECIMAL: () => 'decimal',
  CALCULATE: () => 'equals',
  CLEAR: () => 'clear',
  BACKSPACE: () => 'backspace',
  PERCENT: () => 'percent',
};

export function setupKeyboard(store, buttonMap) {
  document.addEventListener('keydown', (e) => {
    const action = KEY_MAP[e.key];
    if (!action) return;

    e.preventDefault();
    store.dispatch(action);

    // Visual feedback — briefly highlight the matching button
    const keyFn = ACTION_TO_BUTTON_KEY[action.type];
    if (keyFn) {
      const btnKey = keyFn(action);
      const btn = buttonMap.get(btnKey);
      if (btn) {
        btn.classList.add('btn--active');
        setTimeout(() => btn.classList.remove('btn--active'), 120);
      }
    }
  });
}

export { KEY_MAP };
