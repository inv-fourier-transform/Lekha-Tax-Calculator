/**
 * Indian number formatting utilities.
 * PRD §10.2: Use Indian numbering system (Rs. 1,50,000 not Rs. 150,000).
 */

/**
 * Format a number in Indian numbering system.
 * e.g. 150000 → "1,50,000"
 */
export function formatIndianNumber(num: number): string {
  if (num === 0) return '0';

  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const str = absNum.toString();

  if (str.length <= 3) {
    return (isNegative ? '-' : '') + str;
  }

  // Last 3 digits
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);

  // Group remaining digits in pairs (Indian system)
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2);
    result = chunk + ',' + result;
    remaining = remaining.slice(0, -2);
  }

  return (isNegative ? '-' : '') + result;
}

/**
 * Format a number as Indian currency: "Rs. 1,50,000"
 */
export function formatRupees(num: number): string {
  return `Rs. ${formatIndianNumber(num)}`;
}

/**
 * Parse a formatted Indian number string back to a number.
 * Strips commas, Rs., spaces, and ₹ symbols.
 */
export function parseIndianNumber(str: string): number {
  const cleaned = str.replace(/[₹Rs.,\s]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
