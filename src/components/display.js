export function createDisplay(container) {
  const el = document.createElement('div');
  el.className = 'display';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', 'Calculator display');

  el.innerHTML = `
    <div class="display__expression" aria-label="Expression"></div>
    <div class="display__value" aria-label="Current value">0</div>
  `;

  container.appendChild(el);

  const expressionEl = el.querySelector('.display__expression');
  const valueEl = el.querySelector('.display__value');

  function update(state) {
    if (state.mode === 'scientific') {
      updateScientific(state, expressionEl, valueEl);
    } else {
      updateStandard(state, expressionEl, valueEl);
    }
  }

  return { update };
}

function updateStandard(state, expressionEl, valueEl) {
  expressionEl.textContent = state.expression || '';
  valueEl.textContent = formatDisplayValue(state.currentInput);
  updateFontSize(valueEl, state.currentInput);
}

function updateScientific(state, expressionEl, valueEl) {
  // In scientific mode, show the expression being built
  const expr = state.expression || '';
  expressionEl.textContent = prettifyExpression(expr);

  // Show the current result or input
  valueEl.textContent = formatDisplayValue(state.currentInput);
  updateFontSize(valueEl, state.currentInput);
}

function prettifyExpression(expr) {
  return expr
    .replace(/\*/g, '\u00d7')
    .replace(/\//g, '\u00f7')
    .replace(/pi/g, '\u03c0')
    .replace(/sqrt/g, '\u221a')
    .replace(/cbrt/g, '\u00b3\u221a');
}

function formatDisplayValue(value) {
  if (value === 'Error') return value;

  if (value.endsWith('.') || value === '-') {
    return addThousandsSeparators(value);
  }

  const num = parseFloat(value);
  if (!isFinite(num)) return value;

  return addThousandsSeparators(value);
}

function addThousandsSeparators(str) {
  const parts = str.split('.');
  const intPart = parts[0];
  const isNegative = intPart.startsWith('-');
  const digits = isNegative ? intPart.slice(1) : intPart;

  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = isNegative ? '-' + withCommas : withCommas;

  return parts.length > 1 ? formatted + '.' + parts[1] : formatted;
}

function updateFontSize(el, value) {
  el.classList.remove('display__value--small', 'display__value--xsmall');
  const len = value.replace(/[-.]/g, '').length;
  if (len > 12) {
    el.classList.add('display__value--xsmall');
  } else if (len > 8) {
    el.classList.add('display__value--small');
  }
}
