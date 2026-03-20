import { describe, it, expect } from 'vitest';
import { KEY_MAP } from '../../src/utils/keyboard.js';

describe('KEY_MAP', () => {
  it('should map digit keys', () => {
    for (let i = 0; i <= 9; i++) {
      expect(KEY_MAP[String(i)]).toEqual({
        type: 'INPUT_DIGIT',
        payload: String(i),
      });
    }
  });

  it('should map operator keys', () => {
    expect(KEY_MAP['+']).toEqual({ type: 'INPUT_OPERATOR', payload: '+' });
    expect(KEY_MAP['-']).toEqual({ type: 'INPUT_OPERATOR', payload: '-' });
    expect(KEY_MAP['*']).toEqual({ type: 'INPUT_OPERATOR', payload: '*' });
    expect(KEY_MAP['/']).toEqual({ type: 'INPUT_OPERATOR', payload: '/' });
  });

  it('should map Enter and = to CALCULATE', () => {
    expect(KEY_MAP['Enter']).toEqual({ type: 'CALCULATE' });
    expect(KEY_MAP['=']).toEqual({ type: 'CALCULATE' });
  });

  it('should map Escape and Delete to CLEAR', () => {
    expect(KEY_MAP['Escape']).toEqual({ type: 'CLEAR' });
    expect(KEY_MAP['Delete']).toEqual({ type: 'CLEAR' });
  });

  it('should map Backspace', () => {
    expect(KEY_MAP['Backspace']).toEqual({ type: 'BACKSPACE' });
  });

  it('should map decimal point', () => {
    expect(KEY_MAP['.']).toEqual({ type: 'INPUT_DECIMAL' });
  });

  it('should map percent', () => {
    expect(KEY_MAP['%']).toEqual({ type: 'PERCENT' });
  });
});
