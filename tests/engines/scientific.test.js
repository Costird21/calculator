import { describe, it, expect, beforeEach } from 'vitest';
import {
  scientificReducer,
  getScientificInitialState,
} from '../../src/engines/scientific.js';

function dispatch(state, ...actions) {
  return actions.reduce((s, action) => scientificReducer(s, action), state);
}

describe('scientific mode', () => {
  let state;

  beforeEach(() => {
    state = getScientificInitialState();
  });

  it('should have correct initial state', () => {
    expect(state.expression).toBe('');
    expect(state.currentInput).toBe('0');
    expect(state.degreeMode).toBe(true);
    expect(state.secondMode).toBe(false);
  });

  describe('digit input', () => {
    it('should build expression from digits', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_DIGIT', payload: '3' }
      );
      expect(state.expression).toBe('123');
    });

    it('should start fresh after evaluation', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'CALCULATE' },
        { type: 'INPUT_DIGIT', payload: '9' }
      );
      expect(state.expression).toBe('9');
    });
  });

  describe('operators', () => {
    it('should append operator to expression', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_OPERATOR', payload: '+' }
      );
      expect(state.expression).toBe('5+');
    });

    it('should replace trailing operator', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_OPERATOR', payload: '-' }
      );
      expect(state.expression).toBe('5-');
    });
  });

  describe('functions', () => {
    it('should insert function with open paren', () => {
      state = dispatch(state, { type: 'INPUT_FUNCTION', payload: 'sin' });
      expect(state.expression).toBe('sin(');
      expect(state.openParens).toBe(1);
    });

    it('should wrap existing expression with function after eval', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '4' },
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'CALCULATE' }
      );
      // After evaluate, applying sin wraps the result
      state = dispatch(state, { type: 'INPUT_FUNCTION', payload: 'sin' });
      expect(state.expression).toBe('sin(45)');
    });
  });

  describe('constants', () => {
    it('should insert pi', () => {
      state = dispatch(state, { type: 'INPUT_CONSTANT', payload: 'pi' });
      expect(state.expression).toBe('pi');
      expect(state.currentInput).toBe(String(Math.PI));
    });

    it('should insert e', () => {
      state = dispatch(state, { type: 'INPUT_CONSTANT', payload: 'e' });
      expect(state.expression).toBe('e');
    });

    it('should add implicit multiplication', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_CONSTANT', payload: 'pi' }
      );
      expect(state.expression).toBe('2*pi');
    });
  });

  describe('parentheses', () => {
    it('should track open parens', () => {
      state = dispatch(state, { type: 'INPUT_PAREN', payload: '(' });
      expect(state.openParens).toBe(1);
      expect(state.expression).toBe('(');
    });

    it('should close parens', () => {
      state = dispatch(
        state,
        { type: 'INPUT_PAREN', payload: '(' },
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_PAREN', payload: ')' }
      );
      expect(state.openParens).toBe(0);
      expect(state.expression).toBe('(5)');
    });

    it('should not close more parens than opened', () => {
      state = dispatch(state, { type: 'INPUT_PAREN', payload: ')' });
      expect(state.expression).toBe('');
    });
  });

  describe('calculate', () => {
    it('should evaluate simple expression', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'CALCULATE' }
      );
      expect(state.currentInput).toBe('5');
      expect(state.justEvaluated).toBe(true);
    });

    it('should evaluate sin(90) in degree mode', () => {
      state = dispatch(
        state,
        { type: 'INPUT_FUNCTION', payload: 'sin' },
        { type: 'INPUT_DIGIT', payload: '9' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'CALCULATE' }
      );
      expect(state.currentInput).toBe('1');
    });

    it('should auto-close open parens on calculate', () => {
      state = dispatch(
        state,
        { type: 'INPUT_PAREN', payload: '(' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'CALCULATE' }
      );
      expect(state.currentInput).toBe('5');
      expect(state.openParens).toBe(0);
    });

    it('should set lastResult on calculation', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'CALCULATE' }
      );
      expect(state.lastResult).toEqual({
        expression: '5+3 =',
        result: '8',
      });
    });

    it('should handle errors gracefully', () => {
      state = { ...state, expression: 'sin(+)' };
      state = dispatch(state, { type: 'CALCULATE' });
      expect(state.currentInput).toBe('Error');
    });
  });

  describe('angle mode', () => {
    it('should toggle between degree and radian', () => {
      expect(state.degreeMode).toBe(true);
      state = dispatch(state, { type: 'TOGGLE_ANGLE_MODE' });
      expect(state.degreeMode).toBe(false);
      state = dispatch(state, { type: 'TOGGLE_ANGLE_MODE' });
      expect(state.degreeMode).toBe(true);
    });
  });

  describe('second mode', () => {
    it('should toggle second mode', () => {
      expect(state.secondMode).toBe(false);
      state = dispatch(state, { type: 'TOGGLE_SECOND' });
      expect(state.secondMode).toBe(true);
    });
  });

  describe('clear and backspace', () => {
    it('should clear to initial state preserving deg/rad', () => {
      state = dispatch(
        state,
        { type: 'TOGGLE_ANGLE_MODE' },
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'CLEAR' }
      );
      expect(state.expression).toBe('');
      expect(state.currentInput).toBe('0');
      expect(state.degreeMode).toBe(false); // preserved
    });

    it('should backspace last character', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'BACKSPACE' }
      );
      expect(state.expression).toBe('12');
    });

    it('should reset to 0 on full backspace', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'BACKSPACE' }
      );
      expect(state.currentInput).toBe('0');
    });
  });
});
