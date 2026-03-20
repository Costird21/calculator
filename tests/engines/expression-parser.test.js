import { describe, it, expect } from 'vitest';
import {
  tokenize,
  toPostfix,
  evaluatePostfix,
  evaluate,
} from '../../src/engines/expression-parser.js';

describe('tokenize', () => {
  it('should tokenize a simple number', () => {
    const tokens = tokenize('42');
    expect(tokens).toEqual([{ type: 'number', value: 42 }]);
  });

  it('should tokenize a decimal number', () => {
    const tokens = tokenize('3.14');
    expect(tokens).toEqual([{ type: 'number', value: 3.14 }]);
  });

  it('should tokenize a simple expression', () => {
    const tokens = tokenize('2+3');
    expect(tokens).toEqual([
      { type: 'number', value: 2 },
      { type: 'operator', value: '+' },
      { type: 'number', value: 3 },
    ]);
  });

  it('should tokenize with spaces', () => {
    const tokens = tokenize('2 + 3');
    expect(tokens).toEqual([
      { type: 'number', value: 2 },
      { type: 'operator', value: '+' },
      { type: 'number', value: 3 },
    ]);
  });

  it('should tokenize functions', () => {
    const tokens = tokenize('sin(45)');
    expect(tokens).toEqual([
      { type: 'function', value: 'sin' },
      { type: 'lparen', value: '(' },
      { type: 'number', value: 45 },
      { type: 'rparen', value: ')' },
    ]);
  });

  it('should tokenize constants', () => {
    const tokens = tokenize('pi');
    expect(tokens).toEqual([{ type: 'number', value: Math.PI }]);
  });

  it('should tokenize unary minus at start', () => {
    const tokens = tokenize('-5');
    expect(tokens).toEqual([{ type: 'number', value: -5 }]);
  });

  it('should tokenize unary minus after operator', () => {
    const tokens = tokenize('3+-5');
    expect(tokens).toEqual([
      { type: 'number', value: 3 },
      { type: 'operator', value: '+' },
      { type: 'number', value: -5 },
    ]);
  });

  it('should tokenize nested parentheses', () => {
    const tokens = tokenize('(2+3)*4');
    expect(tokens.length).toBe(7);
    expect(tokens[0].type).toBe('lparen');
    expect(tokens[4].type).toBe('rparen');
  });

  it('should throw on unknown identifier', () => {
    expect(() => tokenize('foo(5)')).toThrow('Unknown identifier');
  });

  it('should throw on unexpected character', () => {
    expect(() => tokenize('2@3')).toThrow('Unexpected character');
  });
});

describe('toPostfix (shunting-yard)', () => {
  it('should handle simple addition', () => {
    const tokens = tokenize('2+3');
    const postfix = toPostfix(tokens);
    expect(postfix.map((t) => t.value)).toEqual([2, 3, '+']);
  });

  it('should respect operator precedence', () => {
    const tokens = tokenize('2+3*4');
    const postfix = toPostfix(tokens);
    // 2 3 4 * +
    expect(postfix.map((t) => t.value)).toEqual([2, 3, 4, '*', '+']);
  });

  it('should handle parentheses', () => {
    const tokens = tokenize('(2+3)*4');
    const postfix = toPostfix(tokens);
    // 2 3 + 4 *
    expect(postfix.map((t) => t.value)).toEqual([2, 3, '+', 4, '*']);
  });

  it('should handle right-associative exponent', () => {
    const tokens = tokenize('2^3^2');
    const postfix = toPostfix(tokens);
    // 2 3 2 ^ ^  (right-associative: 2^(3^2) = 2^9 = 512)
    expect(postfix.map((t) => t.value)).toEqual([2, 3, 2, '^', '^']);
  });

  it('should handle functions', () => {
    const tokens = tokenize('sin(45)');
    const postfix = toPostfix(tokens);
    expect(postfix.map((t) => t.value)).toEqual([45, 'sin']);
  });

  it('should throw on mismatched parentheses', () => {
    expect(() => toPostfix(tokenize('(2+3'))).toThrow('Mismatched');
    expect(() => toPostfix(tokenize('2+3)'))).toThrow('Mismatched');
  });
});

describe('evaluatePostfix', () => {
  it('should evaluate simple postfix', () => {
    const postfix = toPostfix(tokenize('2+3'));
    expect(evaluatePostfix(postfix)).toBe(5);
  });

  it('should evaluate with precedence', () => {
    const postfix = toPostfix(tokenize('2+3*4'));
    expect(evaluatePostfix(postfix)).toBe(14);
  });
});

describe('evaluate (integration)', () => {
  it('should evaluate basic arithmetic', () => {
    expect(evaluate('2+3')).toBe(5);
    expect(evaluate('10-4')).toBe(6);
    expect(evaluate('6*7')).toBe(42);
    expect(evaluate('15/3')).toBe(5);
  });

  it('should respect operator precedence', () => {
    expect(evaluate('2+3*4')).toBe(14);
    expect(evaluate('2*3+4')).toBe(10);
  });

  it('should handle parentheses', () => {
    expect(evaluate('(2+3)*4')).toBe(20);
    expect(evaluate('2*(3+4)')).toBe(14);
  });

  it('should handle nested parentheses', () => {
    expect(evaluate('((2+3)*4)+1')).toBe(21);
  });

  it('should handle exponentiation', () => {
    expect(evaluate('2^10')).toBe(1024);
  });

  it('should handle right-associative exponents', () => {
    expect(evaluate('2^3^2')).toBe(512); // 2^(3^2) = 2^9
  });

  it('should handle unary minus', () => {
    expect(evaluate('-5+3')).toBe(-2);
  });

  it('should handle constants', () => {
    expect(evaluate('pi')).toBeCloseTo(Math.PI);
    expect(evaluate('e')).toBeCloseTo(Math.E);
  });

  // Trig functions (degree mode)
  it('should compute sin(0) = 0 in degree mode', () => {
    expect(evaluate('sin(0)', true)).toBe(0);
  });

  it('should compute sin(90) = 1 in degree mode', () => {
    expect(evaluate('sin(90)', true)).toBe(1);
  });

  it('should compute cos(0) = 1 in degree mode', () => {
    expect(evaluate('cos(0)', true)).toBe(1);
  });

  it('should compute cos(90) = 0 in degree mode', () => {
    expect(evaluate('cos(90)', true)).toBe(0);
  });

  it('should compute tan(45) ≈ 1 in degree mode', () => {
    expect(evaluate('tan(45)', true)).toBeCloseTo(1);
  });

  it('should return NaN for tan(90) in degree mode', () => {
    expect(evaluate('tan(90)', true)).toBeNaN();
  });

  // Trig functions (radian mode)
  it('should compute sin(pi/2) = 1 in radian mode', () => {
    expect(evaluate('sin(pi/2)', false)).toBeCloseTo(1);
  });

  // Inverse trig
  it('should compute asin(1) = 90 in degree mode', () => {
    expect(evaluate('asin(1)', true)).toBeCloseTo(90);
  });

  it('should compute acos(0) = 90 in degree mode', () => {
    expect(evaluate('acos(0)', true)).toBeCloseTo(90);
  });

  // Logarithms
  it('should compute ln(e) = 1', () => {
    expect(evaluate('ln(e)')).toBeCloseTo(1);
  });

  it('should compute log(100) = 2', () => {
    expect(evaluate('log(100)')).toBeCloseTo(2);
  });

  it('should return -Infinity for ln(0)', () => {
    expect(evaluate('ln(0)')).toBe(-Infinity);
  });

  // Other functions
  it('should compute sqrt(144) = 12', () => {
    expect(evaluate('sqrt(144)')).toBe(12);
  });

  it('should compute cbrt(27) = 3', () => {
    expect(evaluate('cbrt(27)')).toBe(3);
  });

  it('should compute abs(-42) = 42', () => {
    expect(evaluate('abs(-42)')).toBe(42);
  });

  it('should compute fact(5) = 120', () => {
    expect(evaluate('fact(5)')).toBe(120);
  });

  it('should compute exp(0) = 1', () => {
    expect(evaluate('exp(0)')).toBe(1);
  });

  // Complex expressions
  it('should evaluate sin(45) + ln(e)', () => {
    const result = evaluate('sin(45)+ln(e)', true);
    expect(result).toBeCloseTo(1 + Math.sin(Math.PI / 4));
  });

  it('should evaluate complex nested expression', () => {
    expect(evaluate('sqrt(3^2+4^2)')).toBe(5);
  });

  // Division by zero
  it('should return NaN for division by zero', () => {
    expect(evaluate('1/0')).toBeNaN();
  });

  // Factorial edge cases
  it('should compute fact(0) = 1', () => {
    expect(evaluate('fact(0)')).toBe(1);
  });
});
