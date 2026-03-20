import { describe, it, expect, beforeEach } from 'vitest';
import {
  createStore,
  getInitialState,
  calculate,
  formatResult,
  getOperatorSymbol,
} from '../../src/state/calculator-state.js';

describe('createStore', () => {
  let store;

  beforeEach(() => {
    store = createStore(getInitialState());
  });

  it('should have initial state with 0', () => {
    expect(store.getState().currentInput).toBe('0');
    expect(store.getState().operator).toBeNull();
  });

  it('should notify subscribers on dispatch', () => {
    let called = false;
    store.subscribe(() => {
      called = true;
    });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    expect(called).toBe(true);
  });

  it('should allow unsubscribing', () => {
    let count = 0;
    const unsub = store.subscribe(() => count++);
    store.dispatch({ type: 'INPUT_DIGIT', payload: '1' });
    expect(count).toBe(1);
    unsub();
    store.dispatch({ type: 'INPUT_DIGIT', payload: '2' });
    expect(count).toBe(1);
  });
});

describe('digit input', () => {
  let store;

  beforeEach(() => {
    store = createStore(getInitialState());
  });

  it('should replace initial 0 with digit', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    expect(store.getState().currentInput).toBe('5');
  });

  it('should append digits', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '1' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '2' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '3' });
    expect(store.getState().currentInput).toBe('123');
  });

  it('should not allow more than 15 digits', () => {
    for (let i = 0; i < 16; i++) {
      store.dispatch({ type: 'INPUT_DIGIT', payload: '1' });
    }
    expect(store.getState().currentInput.length).toBe(15);
  });
});

describe('decimal input', () => {
  let store;

  beforeEach(() => {
    store = createStore(getInitialState());
  });

  it('should add decimal point', () => {
    store.dispatch({ type: 'INPUT_DECIMAL' });
    expect(store.getState().currentInput).toBe('0.');
  });

  it('should not allow multiple decimals', () => {
    store.dispatch({ type: 'INPUT_DECIMAL' });
    store.dispatch({ type: 'INPUT_DECIMAL' });
    expect(store.getState().currentInput).toBe('0.');
  });

  it('should start with 0. after operator', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    store.dispatch({ type: 'INPUT_DECIMAL' });
    expect(store.getState().currentInput).toBe('0.');
  });
});

describe('operators', () => {
  let store;

  beforeEach(() => {
    store = createStore(getInitialState());
  });

  it('should set operator and expression', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    expect(store.getState().operator).toBe('+');
    expect(store.getState().expression).toBe('5 +');
  });

  it('should chain operations', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '3' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '*' });
    // 5 + 3 = 8, now waiting for next operand
    expect(store.getState().currentInput).toBe('8');
    expect(store.getState().operator).toBe('*');
  });
});

describe('calculate', () => {
  it('should add correctly', () => {
    expect(calculate(5, '+', 3)).toBe(8);
  });

  it('should subtract correctly', () => {
    expect(calculate(10, '-', 4)).toBe(6);
  });

  it('should multiply correctly', () => {
    expect(calculate(6, '*', 7)).toBe(42);
  });

  it('should divide correctly', () => {
    expect(calculate(15, '/', 3)).toBe(5);
  });

  it('should return NaN for division by zero', () => {
    expect(calculate(5, '/', 0)).toBeNaN();
  });
});

describe('full calculation flow', () => {
  let store;

  beforeEach(() => {
    store = createStore(getInitialState());
  });

  it('should compute 5 + 3 = 8', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '3' });
    store.dispatch({ type: 'CALCULATE' });
    expect(store.getState().currentInput).toBe('8');
  });

  it('should compute 10 / 3 without floating point issues', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '1' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '0' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '/' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '3' });
    store.dispatch({ type: 'CALCULATE' });
    expect(store.getState().currentInput).toBe('3.33333333333');
  });

  it('should handle 0.1 + 0.2 correctly', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '0' });
    store.dispatch({ type: 'INPUT_DECIMAL' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '1' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '0' });
    store.dispatch({ type: 'INPUT_DECIMAL' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '2' });
    store.dispatch({ type: 'CALCULATE' });
    expect(store.getState().currentInput).toBe('0.3');
  });

  it('should show Error for division by zero', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '/' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '0' });
    store.dispatch({ type: 'CALCULATE' });
    expect(store.getState().currentInput).toBe('Error');
  });

  it('should set lastResult on calculation', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '4' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '6' });
    store.dispatch({ type: 'CALCULATE' });
    expect(store.getState().lastResult).toEqual({
      expression: '4 + 6 =',
      result: '10',
    });
  });

  it('should do nothing on equals without operator', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'CALCULATE' });
    expect(store.getState().currentInput).toBe('5');
  });
});

describe('clear / backspace / toggle', () => {
  let store;

  beforeEach(() => {
    store = createStore(getInitialState());
  });

  it('should clear to initial state', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'CLEAR' });
    expect(store.getState().currentInput).toBe('0');
    expect(store.getState().operator).toBeNull();
  });

  it('should clear entry only', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_OPERATOR', payload: '+' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '3' });
    store.dispatch({ type: 'CLEAR_ENTRY' });
    expect(store.getState().currentInput).toBe('0');
    expect(store.getState().operator).toBe('+');
  });

  it('should backspace correctly', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '1' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '2' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '3' });
    store.dispatch({ type: 'BACKSPACE' });
    expect(store.getState().currentInput).toBe('12');
  });

  it('should reset to 0 on last digit backspace', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'BACKSPACE' });
    expect(store.getState().currentInput).toBe('0');
  });

  it('should toggle sign', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'TOGGLE_SIGN' });
    expect(store.getState().currentInput).toBe('-5');
    store.dispatch({ type: 'TOGGLE_SIGN' });
    expect(store.getState().currentInput).toBe('5');
  });

  it('should not toggle sign on 0', () => {
    store.dispatch({ type: 'TOGGLE_SIGN' });
    expect(store.getState().currentInput).toBe('0');
  });

  it('should compute percent', () => {
    store.dispatch({ type: 'INPUT_DIGIT', payload: '5' });
    store.dispatch({ type: 'INPUT_DIGIT', payload: '0' });
    store.dispatch({ type: 'PERCENT' });
    expect(store.getState().currentInput).toBe('0.5');
  });
});

describe('formatResult', () => {
  it('should remove floating point artifacts', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0.3');
  });

  it('should return Error for Infinity', () => {
    expect(formatResult(Infinity)).toBe('Error');
  });

  it('should return Error for NaN', () => {
    expect(formatResult(NaN)).toBe('Error');
  });

  it('should use scientific notation for very long numbers', () => {
    const result = formatResult(1.23456789e20);
    expect(result).toContain('e');
  });
});

describe('getOperatorSymbol', () => {
  it('should return correct symbols', () => {
    expect(getOperatorSymbol('+')).toBe('+');
    expect(getOperatorSymbol('-')).toBe('\u2212');
    expect(getOperatorSymbol('*')).toBe('\u00d7');
    expect(getOperatorSymbol('/')).toBe('\u00f7');
  });
});
