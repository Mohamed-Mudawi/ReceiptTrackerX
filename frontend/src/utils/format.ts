const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return currencyFormatter.format(n);
}

export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFormatter.format(d);
}

/**
 * "transactionDate" -> "Transaction Date"
 * "merchant_name"   -> "Merchant Name"
 */
export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const CURRENCY_KEYS = new Set([
  'total',
  'subtotal',
  'tax',
  'tip',
  'amount',
  'spent',
  'balance',
]);

export function looksLikeCurrency(key: string): boolean {
  const lowered = key.toLowerCase();
  for (const needle of CURRENCY_KEYS) {
    if (lowered.includes(needle)) return true;
  }
  return false;
}
