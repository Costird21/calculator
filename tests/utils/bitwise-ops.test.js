import { describe, it, expect } from 'vitest';
import {
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
} from '../../src/utils/bitwise-ops.js';

describe('bitwiseAnd', () => {
  it('should AND two values', () => {
    expect(bitwiseAnd(0b1100, 0b1010)).toBe(0b1000);
  });

  it('should return 0 for AND with 0', () => {
    expect(bitwiseAnd(0xff, 0)).toBe(0);
  });
});

describe('bitwiseOr', () => {
  it('should OR two values', () => {
    expect(bitwiseOr(0b1100, 0b1010)).toBe(0b1110);
  });
});

describe('bitwiseXor', () => {
  it('should XOR two values', () => {
    expect(bitwiseXor(0b1100, 0b1010)).toBe(0b0110);
  });

  it('should return 0 for XOR with itself', () => {
    expect(bitwiseXor(42, 42)).toBe(0);
  });
});

describe('bitwiseNot', () => {
  it('should NOT a value within 8-bit', () => {
    // NOT 0 in 8-bit = 255 unsigned = -1 signed
    expect(bitwiseNot(0, 8)).toBe(-1);
  });

  it('should NOT 0xFF in 8-bit = 0', () => {
    expect(bitwiseNot(0xff, 8)).toBe(0);
  });

  it('should NOT 0 in 32-bit = -1', () => {
    expect(bitwiseNot(0, 32)).toBe(-1);
  });
});

describe('leftShift', () => {
  it('should left shift', () => {
    expect(leftShift(1, 4, 32)).toBe(16);
  });

  it('should wrap within bit width', () => {
    // 0x80 << 1 in 8-bit overflows
    expect(leftShift(0x80, 1, 8)).toBe(0);
  });
});

describe('rightShift', () => {
  it('should right shift', () => {
    expect(rightShift(16, 2)).toBe(4);
  });

  it('should preserve sign for negative', () => {
    expect(rightShift(-8, 1)).toBe(-4);
  });
});
