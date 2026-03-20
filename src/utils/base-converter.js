/**
 * Convert a decimal integer to the given base.
 * Returns an uppercase string representation.
 * Handles negative numbers via two's complement for the given bit width.
 */
export function toBase(num, base, bitWidth = 32) {
  if (!Number.isInteger(num)) {
    num = Math.trunc(num);
  }

  if (num < 0) {
    // Two's complement: convert negative to unsigned representation
    const max = Math.pow(2, bitWidth);
    num = max + num;
  }

  // Mask to bit width (use modulo instead of bitwise & to avoid 32-bit truncation)
  const max = Math.pow(2, bitWidth);
  num = ((num % max) + max) % max;

  return num.toString(base).toUpperCase();
}

/**
 * Convert a string in the given base to a decimal integer.
 * Interprets as unsigned within the bit width, then converts
 * to signed if the high bit is set.
 */
export function fromBase(str, base, bitWidth = 32) {
  const unsigned = parseInt(str, base);
  if (isNaN(unsigned)) return NaN;

  // Check if high bit is set (negative in two's complement)
  const max = Math.pow(2, bitWidth);
  const signBit = Math.pow(2, bitWidth - 1);

  const masked = unsigned & (max - 1);
  if (masked >= signBit) {
    return masked - max;
  }
  return masked;
}

/**
 * Format a number in binary with space-separated nibbles.
 * e.g., 255 → "0000 0000 0000 0000 0000 0000 1111 1111"
 */
export function formatBinary(num, bitWidth = 32) {
  const raw = toBase(num, 2, bitWidth).padStart(bitWidth, '0');
  // Split into nibbles (groups of 4)
  return raw.match(/.{1,4}/g).join(' ');
}

/**
 * Format a hex number with space-separated pairs.
 * e.g., 255 → "0000 00FF"
 */
export function formatHex(num, bitWidth = 32) {
  const hexDigits = bitWidth / 4;
  return toBase(num, 16, bitWidth).padStart(hexDigits, '0');
}

/**
 * Get the valid digit characters for a given base.
 */
export function getValidDigits(base) {
  const digits = '0123456789ABCDEF';
  return digits.slice(0, base);
}

/**
 * Check if a character is valid for the given base.
 */
export function isValidDigit(char, base) {
  return getValidDigits(base).includes(char.toUpperCase());
}
