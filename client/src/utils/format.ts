/** Amounts as shown to the user, always with the currency in front */
export const currency = (amount: number) => `Bs ${amount.toFixed(2)}`;

/**
 * Class for anything metered: readings, m³, amounts. Monospaced tabular digits
 * line up column to column, so balances can be compared by scanning a list.
 */
export const NUMERIC = 'font-mono tabular-nums';
