import { toBase, formatBinary, formatHex } from '../utils/base-converter.js';

const BASES = ['HEX', 'DEC', 'OCT', 'BIN'];
const BIT_WIDTHS = [8, 16, 32, 64];
const HEX_DIGITS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function createProgrammerGrid(container, store) {
  const wrapper = document.createElement('div');
  wrapper.className = 'programmer-grid-wrapper';

  // Multi-base display
  const baseDisplay = document.createElement('div');
  baseDisplay.className = 'multi-base-display';
  BASES.forEach((base) => {
    const row = document.createElement('div');
    row.className = 'base-row';
    row.dataset.base = base;
    row.innerHTML = `
      <span class="base-row__label">${base}</span>
      <span class="base-row__value" data-base-value="${base}">0</span>
    `;
    row.addEventListener('click', () => {
      store.dispatch({ type: 'SET_BASE', payload: base });
    });
    baseDisplay.appendChild(row);
  });
  wrapper.appendChild(baseDisplay);

  // Bit width selector
  const bitWidthRow = document.createElement('div');
  bitWidthRow.className = 'bit-width-row';
  const bitButtons = {};
  BIT_WIDTHS.forEach((w) => {
    const btn = document.createElement('button');
    btn.className = `btn btn--small bit-width-btn ${w === 32 ? 'bit-width-btn--active' : ''}`;
    btn.textContent = `${w}bit`;
    btn.addEventListener('click', () => {
      store.dispatch({ type: 'SET_BIT_WIDTH', payload: w });
    });
    bitButtons[w] = btn;
    bitWidthRow.appendChild(btn);
  });
  wrapper.appendChild(bitWidthRow);

  // Bitwise operation buttons
  const bitwiseRow = document.createElement('div');
  bitwiseRow.className = 'button-grid button-grid--bitwise';
  const bitwiseOps = ['AND', 'OR', 'XOR', 'NOT', '<<', '>>'];
  bitwiseOps.forEach((op) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn--small btn--action';
    btn.textContent = op;
    btn.addEventListener('click', () => {
      store.dispatch({ type: 'BITWISE_OP', payload: op });
    });
    bitwiseRow.appendChild(btn);
  });
  wrapper.appendChild(bitwiseRow);

  // Hex digit buttons (extra row above the standard grid)
  const hexRow = document.createElement('div');
  hexRow.className = 'button-grid button-grid--hex';
  const hexButtons = {};
  HEX_DIGITS.forEach((digit) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn--small';
    btn.textContent = digit;
    btn.addEventListener('click', () => {
      store.dispatch({ type: 'INPUT_DIGIT', payload: digit });
    });
    hexButtons[digit] = btn;
    hexRow.appendChild(btn);
  });
  wrapper.appendChild(hexRow);

  container.appendChild(wrapper);

  function update(state) {
    if (state.mode !== 'programmer') return;

    const value = state.value || 0;
    const bitWidth = state.bitWidth || 32;

    // Update multi-base display
    const hexVal = formatHex(value, bitWidth);
    const decVal = String(value);
    const octVal = toBase(value, 8, bitWidth);
    const binVal = formatBinary(value, bitWidth);

    setBaseValue('HEX', hexVal);
    setBaseValue('DEC', decVal);
    setBaseValue('OCT', octVal);
    setBaseValue('BIN', binVal);

    // Highlight active base
    baseDisplay.querySelectorAll('.base-row').forEach((row) => {
      row.classList.toggle('base-row--active', row.dataset.base === state.base);
    });

    // Update bit width buttons
    Object.entries(bitButtons).forEach(([w, btn]) => {
      btn.classList.toggle(
        'bit-width-btn--active',
        Number(w) === state.bitWidth
      );
    });

    // Enable/disable hex digits based on current base
    const radix =
      state.base === 'HEX'
        ? 16
        : state.base === 'OCT'
          ? 8
          : state.base === 'BIN'
            ? 2
            : 10;
    HEX_DIGITS.forEach((digit) => {
      const digitVal = parseInt(digit, 16);
      hexButtons[digit].disabled = digitVal >= radix;
      hexButtons[digit].classList.toggle('btn--disabled', digitVal >= radix);
    });
  }

  function setBaseValue(base, val) {
    const el = wrapper.querySelector(`[data-base-value="${base}"]`);
    if (el) el.textContent = val;
  }

  return { update };
}
