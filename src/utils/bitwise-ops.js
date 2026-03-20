/**
 * Bitwise operations on 32-bit integers.
 * All operations mask results to the specified bit width.
 */

function mask(value, bitWidth = 32) {
  const max = Math.pow(2, bitWidth);
  return ((value % max) + max) % max;
}

function toSigned(value, bitWidth = 32) {
  const max = Math.pow(2, bitWidth);
  const signBit = Math.pow(2, bitWidth - 1);
  const masked = mask(value, bitWidth);
  return masked >= signBit ? masked - max : masked;
}

export function bitwiseAnd(a, b, bitWidth = 32) {
  return toSigned(a & b, bitWidth);
}

export function bitwiseOr(a, b, bitWidth = 32) {
  return toSigned(a | b, bitWidth);
}

export function bitwiseXor(a, b, bitWidth = 32) {
  return toSigned(a ^ b, bitWidth);
}

export function bitwiseNot(a, bitWidth = 32) {
  const max = Math.pow(2, bitWidth) - 1;
  return toSigned(~a & max, bitWidth);
}

export function leftShift(a, n, bitWidth = 32) {
  return toSigned(mask(a, bitWidth) << n, bitWidth);
}

export function rightShift(a, n) {
  return a >> n;
}
