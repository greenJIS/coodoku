/** Bit `d` (1-9) set means digit `d` is possible. Bit 0 is unused. */
export const ALL_DIGITS = 0x3fe;

export function bit(digit: number): number {
  return 1 << digit;
}

export function hasDigit(mask: number, digit: number): boolean {
  return (mask & (1 << digit)) !== 0;
}

export function popcount(mask: number): number {
  let count = 0;
  let rest = mask;
  while (rest !== 0) {
    rest &= rest - 1;
    count++;
  }
  return count;
}

export function digitsOf(mask: number): number[] {
  const digits: number[] = [];
  for (let digit = 1; digit <= 9; digit++) {
    if (hasDigit(mask, digit)) digits.push(digit);
  }
  return digits;
}
