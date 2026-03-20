import { describe, it, expect } from 'vitest';
import {
  factorial,
  degreesToRadians,
  radiansToDegrees,
  sinDeg,
  cosDeg,
  tanDeg,
} from '../../src/utils/math-helpers.js';

describe('factorial', () => {
  it('should compute 0! = 1', () => {
    expect(factorial(0)).toBe(1);
  });

  it('should compute 1! = 1', () => {
    expect(factorial(1)).toBe(1);
  });

  it('should compute 5! = 120', () => {
    expect(factorial(5)).toBe(120);
  });

  it('should compute 10! = 3628800', () => {
    expect(factorial(10)).toBe(3628800);
  });

  it('should return NaN for negative numbers', () => {
    expect(factorial(-1)).toBeNaN();
  });

  it('should return NaN for non-integers', () => {
    expect(factorial(3.5)).toBeNaN();
  });

  it('should return Infinity for n > 170', () => {
    expect(factorial(171)).toBe(Infinity);
  });
});

describe('degreesToRadians', () => {
  it('should convert 0 degrees', () => {
    expect(degreesToRadians(0)).toBe(0);
  });

  it('should convert 180 degrees to pi', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
  });

  it('should convert 360 degrees to 2*pi', () => {
    expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
  });
});

describe('radiansToDegrees', () => {
  it('should convert 0 radians', () => {
    expect(radiansToDegrees(0)).toBe(0);
  });

  it('should convert pi to 180 degrees', () => {
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });
});

describe('sinDeg', () => {
  it('should return 0 for sin(0)', () => {
    expect(sinDeg(0)).toBe(0);
  });

  it('should return 1 for sin(90)', () => {
    expect(sinDeg(90)).toBe(1);
  });

  it('should return 0 for sin(180)', () => {
    expect(sinDeg(180)).toBe(0);
  });

  it('should return -1 for sin(270)', () => {
    expect(sinDeg(270)).toBe(-1);
  });

  it('should handle sin(45)', () => {
    expect(sinDeg(45)).toBeCloseTo(Math.SQRT2 / 2);
  });

  it('should handle negative angles', () => {
    expect(sinDeg(-90)).toBe(-1);
  });
});

describe('cosDeg', () => {
  it('should return 1 for cos(0)', () => {
    expect(cosDeg(0)).toBe(1);
  });

  it('should return 0 for cos(90)', () => {
    expect(cosDeg(90)).toBe(0);
  });

  it('should return -1 for cos(180)', () => {
    expect(cosDeg(180)).toBe(-1);
  });

  it('should return 0 for cos(270)', () => {
    expect(cosDeg(270)).toBe(0);
  });
});

describe('tanDeg', () => {
  it('should return 0 for tan(0)', () => {
    expect(tanDeg(0)).toBe(0);
  });

  it('should return approximately 1 for tan(45)', () => {
    expect(tanDeg(45)).toBeCloseTo(1);
  });

  it('should return NaN for tan(90)', () => {
    expect(tanDeg(90)).toBeNaN();
  });

  it('should return 0 for tan(180)', () => {
    expect(tanDeg(180)).toBe(0);
  });

  it('should return NaN for tan(270)', () => {
    expect(tanDeg(270)).toBeNaN();
  });
});
