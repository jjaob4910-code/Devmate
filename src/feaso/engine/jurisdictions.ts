/**
 * Jurisdiction reference data. Rates change; every figure here must be verified
 * against the current revenue-office schedule before being relied on.
 */
export interface Jurisdiction {
  id: string;
  label: string;
  country: 'AU' | 'NZ';
  currency: 'AUD' | 'NZD';
  gstRate: number;
  /** Returns stamp duty for a land purchase, or null when it must be entered manually. */
  stampDuty: ((price: number) => number) | null;
  stampDutyNote: string;
}

/** Victorian general (non-concessional) land transfer duty brackets. Verify before use. */
export function vicTransferDuty(price: number): number {
  if (price <= 0) return 0;
  if (price <= 25_000) return price * 0.014;
  if (price <= 130_000) return 350 + (price - 25_000) * 0.024;
  if (price <= 960_000) return 2_870 + (price - 130_000) * 0.06;
  if (price <= 2_000_000) return price * 0.055;
  return 110_000 + (price - 2_000_000) * 0.065;
}

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'au-vic',
    label: 'Australia – Victoria',
    country: 'AU',
    currency: 'AUD',
    gstRate: 0.1,
    stampDuty: vicTransferDuty,
    stampDutyNote: 'General rate brackets; concessions, surcharges and off-the-plan rules not modelled. Verify.',
  },
  {
    id: 'au-other',
    label: 'Australia – other state (manual duty)',
    country: 'AU',
    currency: 'AUD',
    gstRate: 0.1,
    stampDuty: null,
    stampDutyNote: 'Enter stamp duty manually for this state.',
  },
  {
    id: 'nz',
    label: 'New Zealand',
    country: 'NZ',
    currency: 'NZD',
    gstRate: 0.15,
    stampDuty: () => 0,
    stampDutyNote: 'New Zealand has no stamp duty on land transfers.',
  },
];

export function getJurisdiction(id: string): Jurisdiction {
  return JURISDICTIONS.find((j) => j.id === id) ?? JURISDICTIONS[0];
}
