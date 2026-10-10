import type { Project } from './types';

/** A blank project: every number is zero and every list is empty. */
export function emptyProject(): Project {
  return {
    name: '',
    jurisdictionId: 'au-vic',
    horizonMonths: 60,
    discountRate: 0,
    targetMargin: 0,
    unitTypes: [],
    land: { price: 0, settlementMonth: 0, stampDuty: 0 },
    costLines: [],
    saleLines: [],
    rentLines: [],
    exit: { month: 0, capRate: 0, sellingCostPct: 0 },
    escalation: {},
    equity: { limit: 0 },
    facilities: [],
  };
}
