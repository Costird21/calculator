import { fromBase, toBase } from '../utils/base-converter.js';
import {
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
} from '../utils/bitwise-ops.js';

const BASE_RADIX = { HEX: 16, DEC: 10, OCT: 8, BIN: 2 };

export function programmerReducer(state, action) {
  switch (action.type) {
    case 'INPUT_DIGIT':
      return progDigit(state, action.payload);
    case 'INPUT_OPERATOR':
      return progOperator(state, action.payload);
    case 'BITWISE_OP':
      return progBitwiseOp(state, action.payload);
    case 'CALCULATE':
      return progCalculate(state);
    case 'CLEAR':
      return progClear(state);
    case 'CLEAR_ENTRY':
      return { ...state, currentInput: '0', inputInBase: '0' };
    case 'BACKSPACE':
      return progBackspace(state);
    case 'TOGGLE_SIGN':
      return progToggleSign(state);
    case 'SET_BASE':
      return progSetBase(state, action.payload);
    case 'SET_BIT_WIDTH':
      return progSetBitWidth(state, action.payload);
    case 'SET_VALUE': {
      const val = parseInt(action.payload, 10);
      const num = isNaN(val) ? 0 : val;
      return {
        ...state,
        value: num,
        currentInput: String(num),
        inputInBase: toBase(num, BASE_RADIX[state.base], state.bitWidth),
        waitingForOperand: false,
      };
    }
    default:
      return state;
  }
}

export function getProgrammerInitialState() {
  return {
    mode: 'programmer',
    value: 0,
    currentInput: '0',
    inputInBase: '0',
    previousValue: 0,
    operator: null,
    expression: '',
    waitingForOperand: false,
    lastResult: null,
    base: 'DEC',
    bitWidth: 32,
  };
}

function progDigit(state, digit) {
  const radix = BASE_RADIX[state.base];
  const upperDigit = digit.toUpperCase();

  // Validate digit for current base
  const maxDigit = radix - 1;
  const digitVal = parseInt(upperDigit, 16);
  if (isNaN(digitVal) || digitVal > maxDigit) return state;

  if (state.waitingForOperand) {
    const newValue = fromBase(upperDigit, radix, state.bitWidth);
    return {
      ...state,
      inputInBase: upperDigit,
      value: newValue,
      currentInput: String(newValue),
      waitingForOperand: false,
    };
  }

  const newInputInBase =
    state.inputInBase === '0' ? upperDigit : state.inputInBase + upperDigit;

  // Limit input length
  const maxLen = state.base === 'BIN' ? state.bitWidth : state.bitWidth / 4 + 2;
  if (newInputInBase.length > maxLen) return state;

  const newValue = fromBase(newInputInBase, radix, state.bitWidth);

  return {
    ...state,
    inputInBase: newInputInBase,
    value: newValue,
    currentInput: String(newValue),
  };
}

function progOperator(state, op) {
  if (state.operator && !state.waitingForOperand) {
    const result = progCalc(
      state.previousValue,
      state.operator,
      state.value,
      state.bitWidth
    );
    const radix = BASE_RADIX[state.base];
    return {
      ...state,
      value: result,
      currentInput: String(result),
      inputInBase: toBase(result, radix, state.bitWidth),
      previousValue: result,
      operator: op,
      expression: `${toBase(result, radix, state.bitWidth)} ${op}`,
      waitingForOperand: true,
    };
  }

  const radix = BASE_RADIX[state.base];
  return {
    ...state,
    previousValue: state.value,
    operator: op,
    expression: `${toBase(state.value, radix, state.bitWidth)} ${op}`,
    waitingForOperand: true,
  };
}

function progBitwiseOp(state, op) {
  switch (op) {
    case 'NOT': {
      const result = bitwiseNot(state.value, state.bitWidth);
      const radix = BASE_RADIX[state.base];
      return {
        ...state,
        value: result,
        currentInput: String(result),
        inputInBase: toBase(result, radix, state.bitWidth),
        expression: `NOT(${state.inputInBase})`,
      };
    }
    case 'AND':
    case 'OR':
    case 'XOR':
    case '<<':
    case '>>':
      return progOperator(state, op);
    default:
      return state;
  }
}

function progCalculate(state) {
  if (state.operator === null) return state;

  const result = progCalc(
    state.previousValue,
    state.operator,
    state.value,
    state.bitWidth
  );
  const radix = BASE_RADIX[state.base];
  const resultInBase = toBase(result, radix, state.bitWidth);
  const prevInBase = toBase(state.previousValue, radix, state.bitWidth);
  const expression = `${prevInBase} ${state.operator} ${state.inputInBase} =`;

  return {
    ...state,
    value: result,
    currentInput: String(result),
    inputInBase: resultInBase,
    previousValue: 0,
    operator: null,
    expression,
    waitingForOperand: true,
    lastResult: {
      expression,
      result: String(result),
    },
  };
}

function progCalc(a, op, b, bitWidth) {
  switch (op) {
    case '+':
      return truncBits(a + b, bitWidth);
    case '-':
      return truncBits(a - b, bitWidth);
    case '*':
      return truncBits(a * b, bitWidth);
    case '/':
      return b === 0 ? 0 : Math.trunc(a / b);
    case 'AND':
      return bitwiseAnd(a, b, bitWidth);
    case 'OR':
      return bitwiseOr(a, b, bitWidth);
    case 'XOR':
      return bitwiseXor(a, b, bitWidth);
    case '<<':
      return leftShift(a, b, bitWidth);
    case '>>':
      return rightShift(a, b);
    default:
      return b;
  }
}

function truncBits(value, bitWidth) {
  const max = Math.pow(2, bitWidth);
  const signBit = Math.pow(2, bitWidth - 1);
  const masked = ((value % max) + max) % max;
  return masked >= signBit ? masked - max : masked;
}

function progClear(state) {
  return {
    ...getProgrammerInitialState(),
    base: state.base,
    bitWidth: state.bitWidth,
  };
}

function progBackspace(state) {
  if (state.waitingForOperand) return state;

  const newInput = state.inputInBase.slice(0, -1);
  if (newInput === '' || newInput === '-') {
    return {
      ...state,
      inputInBase: '0',
      value: 0,
      currentInput: '0',
    };
  }

  const radix = BASE_RADIX[state.base];
  const newValue = fromBase(newInput, radix, state.bitWidth);
  return {
    ...state,
    inputInBase: newInput,
    value: newValue,
    currentInput: String(newValue),
  };
}

function progToggleSign(state) {
  if (state.value === 0) return state;
  const newValue = -state.value;
  const radix = BASE_RADIX[state.base];
  return {
    ...state,
    value: newValue,
    currentInput: String(newValue),
    inputInBase: toBase(newValue, radix, state.bitWidth),
  };
}

function progSetBase(state, newBase) {
  const radix = BASE_RADIX[newBase];
  return {
    ...state,
    base: newBase,
    inputInBase: toBase(state.value, radix, state.bitWidth),
  };
}

function progSetBitWidth(state, newWidth) {
  // Re-truncate current value to new bit width
  const max = Math.pow(2, newWidth);
  const signBit = Math.pow(2, newWidth - 1);
  const masked = ((state.value % max) + max) % max;
  const newValue = masked >= signBit ? masked - max : masked;

  const radix = BASE_RADIX[state.base];
  return {
    ...state,
    bitWidth: newWidth,
    value: newValue,
    currentInput: String(newValue),
    inputInBase: toBase(newValue, radix, newWidth),
  };
}
