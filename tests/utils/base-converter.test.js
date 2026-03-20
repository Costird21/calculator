import { describe, it, expect } from 'vitest';
import {
  toBase,
  fromBase,
  formatBinary,
  formatHex,
  getValidDigits,
  isValidDigit,
} from '../../src/utils/base-converter.js';

describe('toBase', () => {
  it('should convert 255 to hex FF', () => {
    expect(toBase(255, 16)).toBe('FF');
  });

  it('should convert 255 to binary 11111111', () => {
    expect(toBase(255, 2)).toBe('11111111');
  });

  it('should convert 255 to octal 377', () => {
    expect(toBase(255, 8)).toBe('377');
  });

  it('should convert 10 to decimal 10', () => {
    expect(toBase(10, 10)).toBe('10');
  });

  it('should convert 0 to any base as 0', () => {
    expect(toBase(0, 16)).toBe('0');
    expect(toBase(0, 2)).toBe('0');
    expect(toBase(0, 8)).toBe('0');
  });

  it("should handle negative numbers via two's complement", () => {
    // -1 in 32-bit two's complement = FFFFFFFF
    expect(toBase(-1, 16, 32)).toBe('FFFFFFFF');
  });

  it('should handle negative in 8-bit', () => {
    // -1 in 8-bit = FF
    expect(toBase(-1, 16, 8)).toBe('FF');
    // -128 in 8-bit = 80
    expect(toBase(-128, 16, 8)).toBe('80');
  });
});

describe('fromBase', () => {
  it('should convert hex FF to 255', () => {
    expect(fromBase('FF', 16)).toBe(255);
  });

  it('should convert binary 11111111 to 255', () => {
    expect(fromBase('11111111', 2)).toBe(255);
  });

  it('should convert octal 377 to 255', () => {
    expect(fromBase('377', 8)).toBe(255);
  });

  it('should interpret as signed: 8-bit FF = -1', () => {
    expect(fromBase('FF', 16, 8)).toBe(-1);
  });

  it('should interpret as signed: 8-bit 80 = -128', () => {
    expect(fromBase('80', 16, 8)).toBe(-128);
  });

  it('should interpret as unsigned: 8-bit 7F = 127', () => {
    expect(fromBase('7F', 16, 8)).toBe(127);
  });

  it('should return NaN for invalid input', () => {
    expect(fromBase('xyz', 10)).toBeNaN();
  });
});

describe('formatBinary', () => {
  it('should format with space-separated nibbles', () => {
    const result = formatBinary(255, 8);
    expect(result).toBe('1111 1111');
  });

  it('should pad to full bit width', () => {
    const result = formatBinary(1, 8);
    expect(result).toBe('0000 0001');
  });

  it('should handle 0', () => {
    const result = formatBinary(0, 8);
    expect(result).toBe('0000 0000');
  });
});

describe('formatHex', () => {
  it('should pad to full hex digits', () => {
    expect(formatHex(255, 32)).toBe('000000FF');
  });

  it('should handle 0', () => {
    expect(formatHex(0, 8)).toBe('00');
  });
});

describe('getValidDigits', () => {
  it('should return 0-1 for binary', () => {
    expect(getValidDigits(2)).toBe('01');
  });

  it('should return 0-7 for octal', () => {
    expect(getValidDigits(8)).toBe('01234567');
  });

  it('should return 0-9 for decimal', () => {
    expect(getValidDigits(10)).toBe('0123456789');
  });

  it('should return 0-F for hex', () => {
    expect(getValidDigits(16)).toBe('0123456789ABCDEF');
  });
});

describe('isValidDigit', () => {
  it('should accept valid hex digits', () => {
    expect(isValidDigit('A', 16)).toBe(true);
    expect(isValidDigit('f', 16)).toBe(true);
  });

  it('should reject invalid digits for base', () => {
    expect(isValidDigit('2', 2)).toBe(false);
    expect(isValidDigit('A', 10)).toBe(false);
  });
});
