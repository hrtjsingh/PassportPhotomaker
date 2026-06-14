export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseDigitsInput(
  value: string,
  min: number,
  max: number
): number | null {
  const digits = digitsOnly(value);
  if (digits === '') return null;
  return clampInt(parseInt(digits, 10), min, max);
}
