export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function degreesToRadians(deg) {
  return (deg * Math.PI) / 180;
}

export function radiansToDegrees(rad) {
  return (rad * 180) / Math.PI;
}

export function sinDeg(x) {
  // Handle exact values for common angles
  const mod = ((x % 360) + 360) % 360;
  if (mod === 0 || mod === 180) return 0;
  if (mod === 90) return 1;
  if (mod === 270) return -1;
  return Math.sin(degreesToRadians(x));
}

export function cosDeg(x) {
  const mod = ((x % 360) + 360) % 360;
  if (mod === 90 || mod === 270) return 0;
  if (mod === 0) return 1;
  if (mod === 180) return -1;
  return Math.cos(degreesToRadians(x));
}

export function tanDeg(x) {
  const mod = ((x % 360) + 360) % 360;
  if (mod === 90 || mod === 270) return NaN;
  if (mod === 0 || mod === 180) return 0;
  return Math.tan(degreesToRadians(x));
}
