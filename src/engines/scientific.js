import { evaluate } from './expression-parser.js';
import { formatResult } from '../state/calculator-state.js';

/**
 * Scientific mode state reducer.
 * In scientific mode, users build an expression string that gets
 * evaluated when they press equals.
 */
export function scientificReducer(state, action) {
  switch (action.type) {
    case 'INPUT_DIGIT':
      return sciDigit(state, action.payload);
    case 'INPUT_DECIMAL':
      return sciDecimal(state);
    case 'INPUT_OPERATOR':
      return sciOperator(state, action.payload);
    case 'INPUT_FUNCTION':
      return sciFunction(state, action.payload);
    case 'INPUT_CONSTANT':
      return sciConstant(state, action.payload);
    case 'INPUT_PAREN':
      return sciParen(state, action.payload);
    case 'CALCULATE':
      return sciCalculate(state);
    case 'CLEAR':
      return sciClear(state);
    case 'CLEAR_ENTRY':
      return sciClearEntry(state);
    case 'BACKSPACE':
      return sciBackspace(state);
    case 'TOGGLE_SIGN':
      return sciToggleSign(state);
    case 'TOGGLE_ANGLE_MODE':
      return { ...state, degreeMode: !state.degreeMode };
    case 'TOGGLE_SECOND':
      return { ...state, secondMode: !state.secondMode };
    case 'SET_VALUE':
      return {
        ...state,
        expression: action.payload,
        currentInput: action.payload,
        justEvaluated: false,
      };
    default:
      return state;
  }
}

export function getScientificInitialState() {
  return {
    expression: '',
    currentInput: '0',
    degreeMode: true,
    secondMode: false,
    justEvaluated: false,
    lastResult: null,
    openParens: 0,
  };
}

function sciDigit(state, digit) {
  if (state.justEvaluated) {
    return {
      ...state,
      expression: digit,
      currentInput: digit,
      justEvaluated: false,
      openParens: 0,
    };
  }
  const expr =
    state.expression === '' || state.expression === '0'
      ? digit
      : state.expression + digit;
  return {
    ...state,
    expression: expr,
    currentInput: getLastNumber(expr),
    justEvaluated: false,
  };
}

function sciDecimal(state) {
  if (state.justEvaluated) {
    return {
      ...state,
      expression: '0.',
      currentInput: '0.',
      justEvaluated: false,
      openParens: 0,
    };
  }
  const lastNum = getLastNumber(state.expression);
  if (lastNum.includes('.')) return state;

  const expr = state.expression === '' ? '0.' : state.expression + '.';
  return {
    ...state,
    expression: expr,
    currentInput: getLastNumber(expr),
    justEvaluated: false,
  };
}

function sciOperator(state, op) {
  const expr = state.expression || '0';
  // Replace trailing operator
  if (endsWithOperator(expr)) {
    return {
      ...state,
      expression: expr.slice(0, -1) + op,
      justEvaluated: false,
    };
  }
  return {
    ...state,
    expression: expr + op,
    currentInput: expr,
    justEvaluated: false,
  };
}

function sciFunction(state, funcName) {
  if (state.justEvaluated) {
    return {
      ...state,
      expression: funcName + '(' + state.currentInput + ')',
      currentInput: funcName + '(' + state.currentInput + ')',
      justEvaluated: false,
      openParens: 0,
    };
  }
  const expr = state.expression;
  // If expression is empty or ends with an operator or open paren, insert function
  if (
    expr === '' ||
    expr === '0' ||
    endsWithOperator(expr) ||
    expr.endsWith('(')
  ) {
    const newExpr =
      expr === '' || expr === '0' ? funcName + '(' : expr + funcName + '(';
    return {
      ...state,
      expression: newExpr,
      justEvaluated: false,
      openParens: state.openParens + 1,
    };
  }
  // Otherwise, wrap current expression
  return {
    ...state,
    expression: funcName + '(' + expr + ')',
    justEvaluated: false,
  };
}

function sciConstant(state, constant) {
  const value = constant === 'pi' ? 'pi' : 'e';
  if (state.justEvaluated) {
    return {
      ...state,
      expression: value,
      currentInput: constant === 'pi' ? String(Math.PI) : String(Math.E),
      justEvaluated: false,
      openParens: 0,
    };
  }
  const expr = state.expression;
  // If it would create an implicit multiplication, add *
  const needsMultiply =
    expr !== '' &&
    expr !== '0' &&
    !endsWithOperator(expr) &&
    !expr.endsWith('(');
  const newExpr =
    expr === '' || expr === '0'
      ? value
      : needsMultiply
        ? expr + '*' + value
        : expr + value;
  return {
    ...state,
    expression: newExpr,
    currentInput: constant === 'pi' ? String(Math.PI) : String(Math.E),
    justEvaluated: false,
  };
}

function sciParen(state, paren) {
  if (paren === '(') {
    const expr = state.expression;
    const needsMultiply =
      expr !== '' &&
      expr !== '0' &&
      !endsWithOperator(expr) &&
      !expr.endsWith('(') &&
      !state.justEvaluated;
    const newExpr =
      state.justEvaluated || expr === '' || expr === '0'
        ? '('
        : needsMultiply
          ? expr + '*('
          : expr + '(';
    return {
      ...state,
      expression: newExpr,
      justEvaluated: false,
      openParens: (state.justEvaluated ? 0 : state.openParens) + 1,
    };
  }
  // Close paren
  if (state.openParens <= 0) return state;
  return {
    ...state,
    expression: state.expression + ')',
    openParens: state.openParens - 1,
    justEvaluated: false,
  };
}

function sciCalculate(state) {
  let expr = state.expression;
  if (!expr || expr === '0') return state;

  // Auto-close open parens
  for (let i = 0; i < state.openParens; i++) {
    expr += ')';
  }

  try {
    const result = evaluate(expr, state.degreeMode);
    const resultStr = formatResult(result);
    return {
      ...state,
      expression: resultStr,
      currentInput: resultStr,
      justEvaluated: true,
      openParens: 0,
      lastResult: {
        expression: expr + ' =',
        result: resultStr,
      },
    };
  } catch {
    return {
      ...state,
      currentInput: 'Error',
      justEvaluated: true,
      openParens: 0,
    };
  }
}

function sciClear(state) {
  return {
    ...getScientificInitialState(),
    degreeMode: state.degreeMode,
    secondMode: state.secondMode,
  };
}

function sciClearEntry(state) {
  // Remove the last number or function entry
  const expr = state.expression;
  const lastOpIdx = findLastOperatorIndex(expr);
  const newExpr = lastOpIdx >= 0 ? expr.slice(0, lastOpIdx + 1) : '';
  return {
    ...state,
    expression: newExpr,
    currentInput: '0',
    justEvaluated: false,
  };
}

function sciBackspace(state) {
  if (state.justEvaluated) return state;
  const expr = state.expression;
  if (expr.length <= 1) {
    return { ...state, expression: '', currentInput: '0' };
  }
  // If removing a '(' or ')', adjust paren count
  const lastChar = expr[expr.length - 1];
  let openParens = state.openParens;
  if (lastChar === '(') openParens--;
  if (lastChar === ')') openParens++;

  const newExpr = expr.slice(0, -1);
  return {
    ...state,
    expression: newExpr,
    currentInput: getLastNumber(newExpr) || '0',
    openParens,
  };
}

function sciToggleSign(state) {
  if (state.justEvaluated) {
    const val = parseFloat(state.currentInput);
    if (val === 0) return state;
    const negated = String(-val);
    return {
      ...state,
      expression: negated,
      currentInput: negated,
    };
  }
  // In expression mode, wrap with negation or remove it
  const expr = state.expression;
  if (expr.startsWith('-(') && expr.endsWith(')')) {
    return { ...state, expression: expr.slice(2, -1) };
  }
  return { ...state, expression: '-(' + expr + ')' };
}

// Helpers
function getLastNumber(expr) {
  const match = expr.match(/[\d.]+$/);
  return match ? match[0] : '';
}

function endsWithOperator(expr) {
  return /[+\-*/^]$/.test(expr);
}

function findLastOperatorIndex(expr) {
  for (let i = expr.length - 1; i >= 0; i--) {
    if ('+-*/^'.includes(expr[i])) return i;
  }
  return -1;
}
