import {
  scientificReducer,
  getScientificInitialState,
} from '../engines/scientific.js';

export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      if (action.type === 'SWITCH_MODE') {
        state = handleSwitchMode(state, action.payload);
      } else if (state.mode === 'scientific') {
        state = scientificReducer(state, action);
      } else {
        state = standardReducer(state, action);
      }
      listeners.forEach((fn) => fn(state));
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

function handleSwitchMode(state, mode) {
  if (mode === 'scientific') {
    return {
      ...getScientificInitialState(),
      mode: 'scientific',
    };
  }
  return {
    ...getStandardInitialState(),
    mode: 'standard',
  };
}

function standardReducer(state, action) {
  switch (action.type) {
    case 'INPUT_DIGIT':
      return handleDigit(state, action.payload);
    case 'INPUT_DECIMAL':
      return handleDecimal(state);
    case 'INPUT_OPERATOR':
      return handleOperator(state, action.payload);
    case 'CALCULATE':
      return handleCalculate(state);
    case 'CLEAR':
      return handleClear(state);
    case 'CLEAR_ENTRY':
      return handleClearEntry(state);
    case 'BACKSPACE':
      return handleBackspace(state);
    case 'TOGGLE_SIGN':
      return handleToggleSign(state);
    case 'PERCENT':
      return handlePercent(state);
    case 'SET_VALUE':
      return {
        ...state,
        currentInput: action.payload,
        waitingForOperand: false,
      };
    default:
      return state;
  }
}

function getStandardInitialState() {
  return {
    mode: 'standard',
    currentInput: '0',
    previousInput: '',
    operator: null,
    expression: '',
    waitingForOperand: false,
    lastResult: null,
  };
}

export function getInitialState() {
  return getStandardInitialState();
}

function handleDigit(state, digit) {
  if (state.waitingForOperand) {
    return {
      ...state,
      currentInput: digit,
      waitingForOperand: false,
    };
  }

  const newInput =
    state.currentInput === '0' ? digit : state.currentInput + digit;

  // Limit input length
  if (newInput.replace(/[^0-9]/g, '').length > 15) {
    return state;
  }

  return { ...state, currentInput: newInput };
}

function handleDecimal(state) {
  if (state.waitingForOperand) {
    return {
      ...state,
      currentInput: '0.',
      waitingForOperand: false,
    };
  }

  if (state.currentInput.includes('.')) {
    return state;
  }

  return { ...state, currentInput: state.currentInput + '.' };
}

function handleOperator(state, nextOperator) {
  const current = parseFloat(state.currentInput);

  if (state.operator && !state.waitingForOperand) {
    const previous = parseFloat(state.previousInput);
    const result = calculate(previous, state.operator, current);
    const resultStr = formatResult(result);

    return {
      ...state,
      currentInput: resultStr,
      previousInput: resultStr,
      operator: nextOperator,
      expression: `${resultStr} ${getOperatorSymbol(nextOperator)}`,
      waitingForOperand: true,
    };
  }

  return {
    ...state,
    previousInput: state.currentInput,
    operator: nextOperator,
    expression: `${state.currentInput} ${getOperatorSymbol(nextOperator)}`,
    waitingForOperand: true,
  };
}

function handleCalculate(state) {
  if (state.operator === null) {
    return state;
  }

  const current = parseFloat(state.currentInput);
  const previous = parseFloat(state.previousInput);
  const result = calculate(previous, state.operator, current);
  const resultStr = formatResult(result);
  const expression = `${state.previousInput} ${getOperatorSymbol(state.operator)} ${state.currentInput} =`;

  return {
    ...state,
    currentInput: resultStr,
    previousInput: '',
    operator: null,
    expression,
    waitingForOperand: true,
    lastResult: {
      expression,
      result: resultStr,
    },
  };
}

function handleClear(state) {
  return { ...getStandardInitialState(), mode: state.mode };
}

function handleClearEntry(state) {
  return { ...state, currentInput: '0' };
}

function handleBackspace(state) {
  if (state.waitingForOperand) {
    return state;
  }

  const newInput = state.currentInput.slice(0, -1);
  return {
    ...state,
    currentInput: newInput === '' || newInput === '-' ? '0' : newInput,
  };
}

function handleToggleSign(state) {
  if (state.currentInput === '0') {
    return state;
  }

  const newInput = state.currentInput.startsWith('-')
    ? state.currentInput.slice(1)
    : '-' + state.currentInput;

  return { ...state, currentInput: newInput };
}

function handlePercent(state) {
  const current = parseFloat(state.currentInput);
  const result = current / 100;
  return { ...state, currentInput: formatResult(result) };
}

function calculate(a, operator, b) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function formatResult(num) {
  if (!isFinite(num)) {
    return 'Error';
  }
  // Remove floating point artifacts
  const rounded = parseFloat(num.toPrecision(12));
  const str = String(rounded);
  // Cap display length
  if (str.length > 15) {
    return rounded.toExponential(6);
  }
  return str;
}

function getOperatorSymbol(op) {
  const symbols = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };
  return symbols[op] || op;
}

export { calculate, formatResult, getOperatorSymbol };
