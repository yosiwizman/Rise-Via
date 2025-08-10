/**
 * Safely converts a value to a number and formats it with toFixed
 * @param value - The value to convert and format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with specified decimal places
 */
export const safeToFixed = (value: string | number | undefined | null, decimals: number = 2): string => {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0)) || 0;
  return numValue.toFixed(decimals);
};
