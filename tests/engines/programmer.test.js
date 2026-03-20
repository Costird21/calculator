import { describe, it, expect, beforeEach } from 'vitest';
import {
  programmerReducer,
  getProgrammerInitialState,
} from '../../src/engines/programmer.js';

function dispatch(state, ...actions) {
  return actions.reduce((s, action) => programmerReducer(s, action), state);
}

describe('programmer mode', () => {
  let state;

  beforeEach(() => {
    state = getProgrammerInitialState();
  });

  it('should have correct initial state', () => {
    expect(state.mode).toBe('programmer');
    expect(state.value).toBe(0);
    expect(state.base).toBe('DEC');
    expect(state.bitWidth).toBe(32);
  });

  describe('digit input', () => {
    it('should input decimal digits', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '5' }
      );
      expect(state.value).toBe(15);
      expect(state.inputInBase).toBe('15');
    });

    it('should reject invalid digits for current base', () => {
      state = dispatch(state, { type: 'SET_BASE', payload: 'BIN' });
      state = dispatch(state, { type: 'INPUT_DIGIT', payload: '2' });
      expect(state.value).toBe(0); // Rejected
    });

    it('should accept hex digits in hex mode', () => {
      state = dispatch(
        state,
        { type: 'SET_BASE', payload: 'HEX' },
        { type: 'INPUT_DIGIT', payload: 'F' },
        { type: 'INPUT_DIGIT', payload: 'F' }
      );
      expect(state.value).toBe(255);
      expect(state.inputInBase).toBe('FF');
    });

    it('should accept binary digits in binary mode', () => {
      state = dispatch(
        state,
        { type: 'SET_BASE', payload: 'BIN' },
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' }
      );
      expect(state.value).toBe(10);
      expect(state.inputInBase).toBe('1010');
    });
  });

  describe('base switching', () => {
    it('should preserve value when switching bases', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_DIGIT', payload: '5' }
      );
      expect(state.value).toBe(255);

      state = dispatch(state, { type: 'SET_BASE', payload: 'HEX' });
      expect(state.value).toBe(255);
      expect(state.inputInBase).toBe('FF');

      state = dispatch(state, { type: 'SET_BASE', payload: 'BIN' });
      expect(state.value).toBe(255);
      expect(state.inputInBase).toBe('11111111');

      state = dispatch(state, { type: 'SET_BASE', payload: 'OCT' });
      expect(state.value).toBe(255);
      expect(state.inputInBase).toBe('377');
    });
  });

  describe('arithmetic', () => {
    it('should add in decimal', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(15);
    });

    it('should subtract', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'INPUT_OPERATOR', payload: '-' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(7);
    });

    it('should integer divide (truncate)', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '7' },
        { type: 'INPUT_OPERATOR', payload: '/' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(3);
    });

    it('should handle divide by zero', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_OPERATOR', payload: '/' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(0);
    });
  });

  describe('bitwise operations', () => {
    it('should AND two values', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'BITWISE_OP', payload: 'AND' },
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(12 & 10);
    });

    it('should OR two values', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'BITWISE_OP', payload: 'OR' },
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(12 | 10);
    });

    it('should XOR two values', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'BITWISE_OP', payload: 'XOR' },
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(12 ^ 10);
    });

    it('should NOT a value', () => {
      state = dispatch(
        state,
        { type: 'SET_BIT_WIDTH', payload: 8 },
        { type: 'INPUT_DIGIT', payload: '0' },
        { type: 'BITWISE_OP', payload: 'NOT' }
      );
      expect(state.value).toBe(-1); // NOT 0 in 8-bit signed = -1
    });

    it('should left shift', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'BITWISE_OP', payload: '<<' },
        { type: 'INPUT_DIGIT', payload: '4' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(16);
    });

    it('should right shift', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '6' },
        { type: 'BITWISE_OP', payload: '>>' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'CALCULATE' }
      );
      expect(state.value).toBe(4);
    });
  });

  describe('bit width', () => {
    it('should truncate value on bit width change', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_DIGIT', payload: '5' }
      );
      expect(state.value).toBe(255);

      state = dispatch(state, { type: 'SET_BIT_WIDTH', payload: 8 });
      expect(state.value).toBe(-1); // 255 in 8-bit signed = -1
    });

    it('should handle 127 in 8-bit as positive', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_DIGIT', payload: '7' },
        { type: 'SET_BIT_WIDTH', payload: 8 }
      );
      expect(state.value).toBe(127);
    });
  });

  describe('clear and backspace', () => {
    it('should clear preserving base and bit width', () => {
      state = dispatch(
        state,
        { type: 'SET_BASE', payload: 'HEX' },
        { type: 'SET_BIT_WIDTH', payload: 16 },
        { type: 'INPUT_DIGIT', payload: 'F' },
        { type: 'CLEAR' }
      );
      expect(state.value).toBe(0);
      expect(state.base).toBe('HEX');
      expect(state.bitWidth).toBe(16);
    });

    it('should backspace last digit', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '1' },
        { type: 'INPUT_DIGIT', payload: '2' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'BACKSPACE' }
      );
      expect(state.value).toBe(12);
      expect(state.inputInBase).toBe('12');
    });

    it('should reset to 0 on full backspace', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'BACKSPACE' }
      );
      expect(state.value).toBe(0);
    });
  });

  describe('toggle sign', () => {
    it('should negate value', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'TOGGLE_SIGN' }
      );
      expect(state.value).toBe(-5);
    });

    it('should not negate zero', () => {
      state = dispatch(state, { type: 'TOGGLE_SIGN' });
      expect(state.value).toBe(0);
    });
  });

  describe('lastResult', () => {
    it('should set lastResult on calculation', () => {
      state = dispatch(
        state,
        { type: 'INPUT_DIGIT', payload: '5' },
        { type: 'INPUT_OPERATOR', payload: '+' },
        { type: 'INPUT_DIGIT', payload: '3' },
        { type: 'CALCULATE' }
      );
      expect(state.lastResult).toEqual({
        expression: '5 + 3 =',
        result: '8',
      });
    });
  });
});
