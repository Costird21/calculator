import {
  factorial,
  sinDeg,
  cosDeg,
  tanDeg,
  radiansToDegrees,
} from '../utils/math-helpers.js';

// Operator precedence and associativity
const OPERATORS = {
  '+': { prec: 1, assoc: 'left' },
  '-': { prec: 1, assoc: 'left' },
  '*': { prec: 2, assoc: 'left' },
  '/': { prec: 2, assoc: 'left' },
  '^': { prec: 3, assoc: 'right' },
};

// Functions that take one argument
const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'ln',
  'log',
  'sqrt',
  'cbrt',
  'abs',
  'fact',
  'exp',
]);

// Constants
const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
};

/**
 * Tokenize an expression string into an array of tokens.
 * Each token is { type, value } where type is one of:
 * 'number', 'operator', 'function', 'lparen', 'rparen', 'constant'
 */
export function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const str = expr.replace(/\s+/g, '');

  while (i < str.length) {
    const ch = str[i];

    // Number (including decimals)
    if (
      isDigit(ch) ||
      (ch === '.' && i + 1 < str.length && isDigit(str[i + 1]))
    ) {
      let num = '';
      while (i < str.length && (isDigit(str[i]) || str[i] === '.')) {
        num += str[i];
        i++;
      }
      // Handle scientific notation like 1.5e10
      if (i < str.length && (str[i] === 'e' || str[i] === 'E')) {
        num += str[i];
        i++;
        if (i < str.length && (str[i] === '+' || str[i] === '-')) {
          num += str[i];
          i++;
        }
        while (i < str.length && isDigit(str[i])) {
          num += str[i];
          i++;
        }
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // Unary minus: at start, after operator, after '('
    if (
      ch === '-' &&
      (tokens.length === 0 ||
        tokens[tokens.length - 1].type === 'operator' ||
        tokens[tokens.length - 1].type === 'lparen')
    ) {
      // Read the number after the minus
      i++;
      if (i < str.length && (isDigit(str[i]) || str[i] === '.')) {
        let num = '-';
        while (i < str.length && (isDigit(str[i]) || str[i] === '.')) {
          num += str[i];
          i++;
        }
        tokens.push({ type: 'number', value: parseFloat(num) });
      } else {
        // Unary minus before a function or paren: push -1 * (...)
        tokens.push({ type: 'number', value: -1 });
        tokens.push({ type: 'operator', value: '*' });
      }
      continue;
    }

    // Operators
    if (ch in OPERATORS) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
      continue;
    }

    // Letters: function names or constants
    if (isAlpha(ch)) {
      let name = '';
      while (i < str.length && isAlpha(str[i])) {
        name += str[i];
        i++;
      }
      const lower = name.toLowerCase();
      if (CONSTANTS[lower] !== undefined) {
        tokens.push({ type: 'number', value: CONSTANTS[lower] });
      } else if (FUNCTIONS.has(lower)) {
        tokens.push({ type: 'function', value: lower });
      } else {
        throw new Error(`Unknown identifier: ${name}`);
      }
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

/**
 * Shunting-yard algorithm: convert infix tokens to postfix (RPN).
 */
export function toPostfix(tokens) {
  const output = [];
  const stack = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'function') {
      stack.push(token);
    } else if (token.type === 'operator') {
      const op = OPERATORS[token.value];
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.type === 'lparen') break;
        if (top.type === 'operator') {
          const topOp = OPERATORS[top.value];
          if (
            (op.assoc === 'left' && op.prec <= topOp.prec) ||
            (op.assoc === 'right' && op.prec < topOp.prec)
          ) {
            output.push(stack.pop());
            continue;
          }
        }
        if (top.type === 'function') {
          output.push(stack.pop());
          continue;
        }
        break;
      }
      stack.push(token);
    } else if (token.type === 'lparen') {
      stack.push(token);
    } else if (token.type === 'rparen') {
      while (stack.length > 0 && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop());
      }
      if (stack.length === 0) {
        throw new Error('Mismatched parentheses');
      }
      stack.pop(); // Remove the '('
      // If there's a function on top, pop it to output
      if (stack.length > 0 && stack[stack.length - 1].type === 'function') {
        output.push(stack.pop());
      }
    }
  }

  while (stack.length > 0) {
    const top = stack.pop();
    if (top.type === 'lparen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

/**
 * Evaluate a postfix token array.
 * @param {Array} postfix - tokens in RPN order
 * @param {boolean} degreeMode - true for degrees, false for radians
 */
export function evaluatePostfix(postfix, degreeMode = true) {
  const stack = [];

  for (const token of postfix) {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'operator') {
      if (stack.length < 2) throw new Error('Invalid expression');
      const b = stack.pop();
      const a = stack.pop();
      stack.push(applyOperator(token.value, a, b));
    } else if (token.type === 'function') {
      if (stack.length < 1) throw new Error('Invalid expression');
      const arg = stack.pop();
      stack.push(applyFunction(token.value, arg, degreeMode));
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return stack[0];
}

function applyOperator(op, a, b) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? NaN : a / b;
    case '^':
      return Math.pow(a, b);
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

function applyFunction(name, arg, degreeMode) {
  switch (name) {
    case 'sin':
      return degreeMode ? sinDeg(arg) : Math.sin(arg);
    case 'cos':
      return degreeMode ? cosDeg(arg) : Math.cos(arg);
    case 'tan':
      return degreeMode ? tanDeg(arg) : Math.tan(arg);
    case 'asin': {
      const result = Math.asin(arg);
      return degreeMode ? radiansToDegrees(result) : result;
    }
    case 'acos': {
      const result = Math.acos(arg);
      return degreeMode ? radiansToDegrees(result) : result;
    }
    case 'atan': {
      const result = Math.atan(arg);
      return degreeMode ? radiansToDegrees(result) : result;
    }
    case 'ln':
      return Math.log(arg);
    case 'log':
      return Math.log10(arg);
    case 'sqrt':
      return Math.sqrt(arg);
    case 'cbrt':
      return Math.cbrt(arg);
    case 'abs':
      return Math.abs(arg);
    case 'fact':
      return factorial(arg);
    case 'exp':
      return Math.exp(arg);
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

/**
 * Parse and evaluate an expression string.
 * @param {string} expr - the expression to evaluate
 * @param {boolean} degreeMode - true for degrees, false for radians
 * @returns {number} the result
 */
export function evaluate(expr, degreeMode = true) {
  const tokens = tokenize(expr);
  const postfix = toPostfix(tokens);
  return evaluatePostfix(postfix, degreeMode);
}

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

function isAlpha(ch) {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}
