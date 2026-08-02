/**
 * Amounts travel from the API in cents, so Bs. 20 arrives as 2000.
 * Converting in one place keeps the division out of the components.
 */
export const currency = (amountInCents: number) =>
  `Bs ${(amountInCents / 100).toFixed(2)}`;

/**
 * Class for anything metered: readings, m³, amounts. Monospaced tabular digits
 * line up column to column, so balances can be compared by scanning a list.
 */
export const NUMERIC = 'font-mono tabular-nums';
