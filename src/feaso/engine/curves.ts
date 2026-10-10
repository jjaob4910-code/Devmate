import type { CurveId, EscalationTable } from './types';

/**
 * Cumulative share of total spend completed at time t in [0, 1].
 * These are generated shapes, not copies of any other product's tables.
 */
export function cumulative(curve: CurveId, t: number): number {
  const x = Math.min(1, Math.max(0, t));
  switch (curve) {
    case 'even':
      return x;
    case 's':
      // integral of (1 - cos 2πt): slow start, fast middle, slow finish
      return x - Math.sin(2 * Math.PI * x) / (2 * Math.PI);
    case 'front':
      return 1 - (1 - x) * (1 - x);
    case 'back':
      return x * x;
  }
}

/** Spread `total` over `span` months starting at `start`, summing exactly to total. */
export function spread(
  total: number,
  start: number,
  span: number,
  curve: CurveId,
  months: number,
): number[] {
  const out = new Array<number>(months).fill(0);
  const n = Math.max(1, Math.floor(span));
  const s = Math.max(0, Math.floor(start));
  for (let i = 0; i < n; i++) {
    const m = s + i;
    if (m >= months) break;
    out[m] = total * (cumulative(curve, (i + 1) / n) - cumulative(curve, i / n));
  }
  return out;
}

/**
 * Escalation index per month for a row of annual rates, compounded monthly:
 * index[0] = 1; each month multiplies by (1 + annual rate for that project year)^(1/12).
 */
export function escalationIndex(rates: number[] | undefined, months: number): number[] {
  const idx = new Array<number>(months).fill(1);
  if (!rates || rates.length === 0) return idx;
  for (let m = 1; m < months; m++) {
    const year = Math.floor((m - 1) / 12);
    const r = rates[Math.min(year, rates.length - 1)] ?? 0;
    idx[m] = idx[m - 1] * Math.pow(1 + r, 1 / 12);
  }
  return idx;
}

/**
 * Step index for annual rent reviews: constant for 12 months from `start`, then
 * steps by the annual rate of the project year in which the review falls.
 */
export function reviewIndex(
  rates: number[] | undefined,
  start: number,
  months: number,
): number[] {
  const idx = new Array<number>(months).fill(1);
  if (!rates || rates.length === 0) return idx;
  let current = 1;
  for (let m = 0; m < months; m++) {
    if (m > start && (m - start) % 12 === 0) {
      const year = Math.floor(m / 12);
      current *= 1 + (rates[Math.min(year, rates.length - 1)] ?? 0);
    }
    idx[m] = current;
  }
  return idx;
}

export function rowFor(table: EscalationTable, key: string): number[] | undefined {
  return table[key];
}
