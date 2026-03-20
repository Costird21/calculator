const PRIMARY_FUNCTIONS = {
  sin: { label: 'sin', action: { type: 'INPUT_FUNCTION', payload: 'sin' } },
  cos: { label: 'cos', action: { type: 'INPUT_FUNCTION', payload: 'cos' } },
  tan: { label: 'tan', action: { type: 'INPUT_FUNCTION', payload: 'tan' } },
  ln: { label: 'ln', action: { type: 'INPUT_FUNCTION', payload: 'ln' } },
  log: { label: 'log', action: { type: 'INPUT_FUNCTION', payload: 'log' } },
  sqrt: {
    label: '\u221a',
    action: { type: 'INPUT_FUNCTION', payload: 'sqrt' },
  },
};

const SECONDARY_FUNCTIONS = {
  sin: {
    label: 'sin\u207b\u00b9',
    action: { type: 'INPUT_FUNCTION', payload: 'asin' },
  },
  cos: {
    label: 'cos\u207b\u00b9',
    action: { type: 'INPUT_FUNCTION', payload: 'acos' },
  },
  tan: {
    label: 'tan\u207b\u00b9',
    action: { type: 'INPUT_FUNCTION', payload: 'atan' },
  },
  ln: { label: 'e\u02e3', action: { type: 'INPUT_FUNCTION', payload: 'exp' } },
  log: {
    label: '\u00b3\u221a',
    action: { type: 'INPUT_FUNCTION', payload: 'cbrt' },
  },
  sqrt: { label: 'x\u00b2', action: null }, // handled specially
};

export function createScientificGrid(container, store) {
  const wrapper = document.createElement('div');
  wrapper.className = 'scientific-grid-wrapper';

  // Top row: 2nd, deg/rad, and function buttons
  const funcRow = document.createElement('div');
  funcRow.className = 'button-grid button-grid--scientific-top';

  const buttonMap = new Map();
  const funcButtons = {};

  // 2nd button
  const secondBtn = createBtn('2nd', 'btn btn--action btn--small', () => {
    store.dispatch({ type: 'TOGGLE_SECOND' });
  });
  secondBtn.setAttribute('aria-label', 'Toggle secondary functions');
  funcRow.appendChild(secondBtn);

  // Deg/Rad button
  const degBtn = createBtn('DEG', 'btn btn--action btn--small', () => {
    store.dispatch({ type: 'TOGGLE_ANGLE_MODE' });
  });
  degBtn.setAttribute('aria-label', 'Toggle degree/radian mode');
  funcRow.appendChild(degBtn);

  // Function buttons
  Object.entries(PRIMARY_FUNCTIONS).forEach(([key, def]) => {
    const btn = createBtn(def.label, 'btn btn--small', () => {
      const state = store.getState();
      if (state.secondMode && SECONDARY_FUNCTIONS[key]) {
        const secDef = SECONDARY_FUNCTIONS[key];
        if (key === 'sqrt' && !secDef.action) {
          // x² = wrap with power
          store.dispatch({ type: 'INPUT_OPERATOR', payload: '^' });
          store.dispatch({ type: 'INPUT_DIGIT', payload: '2' });
        } else {
          store.dispatch(secDef.action);
        }
      } else {
        store.dispatch(def.action);
      }
    });
    funcButtons[key] = btn;
    funcRow.appendChild(btn);
  });

  wrapper.appendChild(funcRow);

  // Second row: parens, constants, and power
  const extraRow = document.createElement('div');
  extraRow.className = 'button-grid button-grid--scientific-mid';

  const parenOpen = createBtn('(', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_PAREN', payload: '(' });
  });
  extraRow.appendChild(parenOpen);
  buttonMap.set('paren-open', parenOpen);

  const parenClose = createBtn(')', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_PAREN', payload: ')' });
  });
  extraRow.appendChild(parenClose);
  buttonMap.set('paren-close', parenClose);

  const piBtn = createBtn('\u03c0', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_CONSTANT', payload: 'pi' });
  });
  extraRow.appendChild(piBtn);

  const eBtn = createBtn('e', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_CONSTANT', payload: 'e' });
  });
  extraRow.appendChild(eBtn);

  const powBtn = createBtn('x\u02b8', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '^' });
  });
  extraRow.appendChild(powBtn);
  buttonMap.set('op-^', powBtn);

  const factBtn = createBtn('x!', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_FUNCTION', payload: 'fact' });
  });
  extraRow.appendChild(factBtn);

  const absBtn = createBtn('|x|', 'btn btn--small', () => {
    store.dispatch({ type: 'INPUT_FUNCTION', payload: 'abs' });
  });
  extraRow.appendChild(absBtn);

  // Filler to align with 8-column layout
  const spacer = createBtn('', 'btn btn--small btn--spacer', () => {});
  spacer.disabled = true;
  spacer.style.visibility = 'hidden';
  extraRow.appendChild(spacer);

  wrapper.appendChild(extraRow);

  container.appendChild(wrapper);

  // Update function to reflect 2nd mode and deg/rad state
  function update(state) {
    // Update 2nd button appearance
    secondBtn.classList.toggle('btn--active-toggle', state.secondMode);

    // Update function button labels
    Object.entries(funcButtons).forEach(([key, btn]) => {
      if (state.secondMode && SECONDARY_FUNCTIONS[key]) {
        btn.textContent = SECONDARY_FUNCTIONS[key].label;
      } else {
        btn.textContent = PRIMARY_FUNCTIONS[key].label;
      }
    });

    // Update deg/rad button
    degBtn.textContent = state.degreeMode ? 'DEG' : 'RAD';
  }

  return { update, buttonMap };
}

function createBtn(label, className, onClick) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}
