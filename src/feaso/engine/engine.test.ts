import { describe, expect, it } from 'vitest';
import { cumulative, escalationIndex, reviewIndex, spread } from './curves';
import { irr, npv } from './metrics';
import { vicTransferDuty } from './jurisdictions';
import { emptyProject, residualLandValue, runModel } from './index';
import type { Project } from './types';

/** Small invented project: 4 units, one build, one sale window. No finance. */
function base(): Project {
  const p = emptyProject();
  p.jurisdictionId = 'au-other';
  p.horizonMonths = 24;
  p.unitTypes = [
    { id: 'u1', name: 'Type A', quantity: 4, areaPerUnit: 50, salePrice: 1_500_000, rentPerYear: 0 },
  ];
  p.land = { price: 1_000_000, settlementMonth: 0, stampDuty: 0 };
  p.costLines = [
    {
      id: 'c1',
      name: 'Build',
      group: 'construction',
      basis: { kind: 'fixed', amount: 2_000_000 },
      start: 1,
      span: 10,
      curve: 'even',
      escalate: false,
    },
  ];
  p.saleLines = [{ id: 's1', unitTypeId: 'u1', start: 12, span: 2, curve: 'even', escalate: false }];
  p.equity = { limit: 100_000_000 };
  return p;
}

describe('curves', () => {
  it.each(['even', 's', 'front', 'back'] as const)('%s runs 0 → 1', (c) => {
    expect(cumulative(c, 0)).toBeCloseTo(0, 10);
    expect(cumulative(c, 1)).toBeCloseTo(1, 10);
  });
  it('spread sums exactly to the total and respects start/span', () => {
    const out = spread(1200, 3, 6, 's', 24);
    expect(out.reduce((a, b) => a + b, 0)).toBeCloseTo(1200, 8);
    expect(out.slice(0, 3).every((v) => v === 0)).toBe(true);
    expect(out.slice(9).every((v) => v === 0)).toBe(true);
  });
  it('an S-curve spends less at the ends than the middle', () => {
    const out = spread(1000, 0, 10, 's', 10);
    expect(out[0]).toBeLessThan(out[5]);
    expect(out[9]).toBeLessThan(out[5]);
  });
});

describe('escalation', () => {
  it('compounds monthly: year 0 rate gives its full annual rise after 12 months', () => {
    const idx = escalationIndex([0.03], 14);
    expect(idx[0]).toBe(1);
    expect(idx[12]).toBeCloseTo(1.03, 10);
  });
  it('carries the last rate forward', () => {
    const idx = escalationIndex([0.03, 0.05], 40);
    expect(idx[24]).toBeCloseTo(1.03 * 1.05, 10);
    expect(idx[36]).toBeCloseTo(1.03 * 1.05 * 1.05, 10);
  });
  it('rent review steps once a year from the start month', () => {
    const idx = reviewIndex([0.04], 2, 30);
    expect(idx[13]).toBe(1);
    expect(idx[14]).toBeCloseTo(1.04, 10);
    expect(idx[25]).toBeCloseTo(1.04, 10);
    expect(idx[26]).toBeCloseTo(1.04 * 1.04, 10);
  });
  it('escalated cost reaches the cash flow, not the current total', () => {
    const p = base();
    p.escalation = { construction: [0.12] };
    p.costLines[0].escalate = true;
    p.costLines[0].start = 12;
    p.costLines[0].span = 1;
    p.saleLines[0].start = 20;
    const r = runModel(p);
    const line = r.lines.find((l) => l.id === 'c1')!;
    expect(line.current).toBe(2_000_000);
    expect(line.escalated).toBeCloseTo(2_000_000 * 1.12, 4);
  });
});

describe('metrics', () => {
  it('npv and irr on a simple flow', () => {
    expect(npv([-100, 110], 0.12)).toBeCloseTo(-100 + 110 / 1.01, 8);
    expect(irr([-100, 110])).toBeCloseTo(1.2, 6); // 10% a month, ×12
    expect(irr([-100, -10])).toBeNull();
  });
  it('VIC duty matches bracket arithmetic', () => {
    expect(vicTransferDuty(1_000_000)).toBeCloseTo(55_000, 6);
    expect(vicTransferDuty(500_000)).toBeCloseTo(2_870 + 370_000 * 0.06, 6);
    expect(vicTransferDuty(0)).toBe(0);
  });
});

describe('model', () => {
  it('empty project produces zeros without throwing', () => {
    const r = runModel(emptyProject());
    expect(r.metrics.profit).toBe(0);
    expect(r.metrics.marginOnCost).toBeNull();
    expect(r.metrics.projectIrr).toBeNull();
  });

  it('computes profit and margin on a hand-checked case', () => {
    const r = runModel(base());
    expect(r.metrics.grossRevenue).toBeCloseTo(6_000_000, 4);
    expect(r.metrics.totalCosts).toBeCloseTo(3_000_000, 4);
    expect(r.metrics.profit).toBeCloseTo(3_000_000, 4);
    expect(r.metrics.marginOnCost).toBeCloseTo(1, 8);
    expect(r.metrics.peakEquity).toBeGreaterThan(0);
  });

  it('resolves percent-of-construction lines and keeps groups separate', () => {
    const p = base();
    p.costLines.push({
      id: 'c2',
      name: 'Fees',
      group: 'professional',
      basis: { kind: 'percent', pct: 0.1, of: 'construction' },
      start: 0,
      span: 11,
      curve: 'even',
      escalate: false,
    });
    p.costLines.push({
      id: 'c3',
      name: 'Contingency',
      group: 'contingency',
      basis: { kind: 'percent', pct: 0.05, of: 'constructionAndProfessional' },
      start: 1,
      span: 10,
      curve: 'even',
      escalate: false,
    });
    const r = runModel(p);
    expect(r.lines.find((l) => l.id === 'c2')!.current).toBeCloseTo(200_000, 6);
    expect(r.lines.find((l) => l.id === 'c3')!.current).toBeCloseTo(110_000, 6);
  });

  it('rate-based lines take quantity from unit types', () => {
    const p = base();
    p.costLines.push({
      id: 'c4',
      name: 'Per unit',
      group: 'statutory',
      basis: { kind: 'rate', rate: 1_000, quantity: { source: 'units' } },
      start: 0,
      span: 1,
      curve: 'even',
      escalate: false,
    });
    p.costLines.push({
      id: 'c5',
      name: 'Per m2',
      group: 'other',
      basis: { kind: 'rate', rate: 10, quantity: { source: 'area' } },
      start: 0,
      span: 1,
      curve: 'even',
      escalate: false,
    });
    const r = runModel(p);
    expect(r.lines.find((l) => l.id === 'c4')!.current).toBe(4_000);
    expect(r.lines.find((l) => l.id === 'c5')!.current).toBe(2_000);
  });

  it('percent-of-sales cost follows settlements', () => {
    const p = base();
    p.costLines.push({
      id: 'c6',
      name: 'Commission',
      group: 'selling',
      basis: { kind: 'percentOfSales', pct: 0.02 },
      start: 0,
      span: 1,
      curve: 'even',
      escalate: false,
    });
    const r = runModel(p);
    const l = r.lines.find((x) => x.id === 'c6')!;
    expect(l.escalated).toBeCloseTo(120_000, 6);
    expect(l.monthly[12]).toBeCloseTo(60_000, 6);
    expect(l.monthly[5]).toBe(0);
  });

  it('capitalises interest on a facility and repays from sales (hand-checked)', () => {
    const p = emptyProject();
    p.horizonMonths = 6;
    p.unitTypes = [{ id: 'u', name: 'U', quantity: 1, areaPerUnit: 0, salePrice: 2_000_000, rentPerYear: 0 }];
    p.costLines = [
      { id: 'c', name: 'Cost', group: 'other', basis: { kind: 'fixed', amount: 1_000_000 }, start: 0, span: 1, curve: 'even', escalate: false },
    ];
    p.saleLines = [{ id: 's', unitTypeId: 'u', start: 2, span: 1, curve: 'even', escalate: false }];
    p.facilities = [
      { id: 'f', name: 'Loan', limit: 5_000_000, interestRate: 0.12, startMonth: 0, establishmentFeePct: 0 },
    ];
    const r = runModel(p);
    // m0 draw 1,000,000; m1 +10,000; m2 +10,100 then repaid from 2,000,000
    expect(r.metrics.interest).toBeCloseTo(20_100, 6);
    expect(r.debtBalance[1]).toBeCloseTo(1_010_000, 6);
    expect(r.debtBalance[2]).toBeCloseTo(0, 6);
    expect(r.metrics.peakDebt).toBeCloseTo(1_020_100 - 10_100, 6 /* peak before repay month */);
    expect(r.metrics.profit).toBeCloseTo(1_000_000 - 20_100, 6);
    expect(r.equityCashFlow[2]).toBeCloseTo(2_000_000 - 1_020_100, 6);
  });

  it('flags a funding gap when limits are too small', () => {
    const p = base();
    p.equity = { limit: 100_000 };
    const r = runModel(p);
    expect(r.warnings.some((w) => w.includes('Funding gap'))).toBe(true);
  });

  it('moves a matured balance to its refinancing facility', () => {
    const p = emptyProject();
    p.horizonMonths = 8;
    p.unitTypes = [{ id: 'u', name: 'U', quantity: 1, areaPerUnit: 0, salePrice: 5_000_000, rentPerYear: 0 }];
    p.costLines = [
      { id: 'c', name: 'Cost', group: 'other', basis: { kind: 'fixed', amount: 1_000_000 }, start: 0, span: 1, curve: 'even', escalate: false },
    ];
    p.saleLines = [{ id: 's', unitTypeId: 'u', start: 7, span: 1, curve: 'even', escalate: false }];
    p.facilities = [
      { id: 'a', name: 'Construction', limit: 2_000_000, interestRate: 0, startMonth: 0, maturityMonth: 3, refinancedById: 'b', establishmentFeePct: 0 },
      { id: 'b', name: 'Term', limit: 2_000_000, interestRate: 0, startMonth: 3, establishmentFeePct: 0 },
    ];
    const r = runModel(p);
    expect(r.debtBalance[2]).toBeCloseTo(1_000_000, 6);
    expect(r.debtBalance[3]).toBeCloseTo(1_000_000, 6);
    expect(r.debtBalance[7]).toBeCloseTo(0, 6);
    expect(r.warnings).toEqual([]);
  });

  it('charges establishment fees in the start month', () => {
    const p = base();
    p.facilities = [{ id: 'f', name: 'L', limit: 1_000_000, interestRate: 0, startMonth: 2, establishmentFeePct: 0.01 }];
    const r = runModel(p);
    expect(r.metrics.fees).toBeCloseTo(10_000, 6);
  });

  it('rent with vacancy, outgoings and a capitalised exit', () => {
    const p = emptyProject();
    p.horizonMonths = 24;
    p.unitTypes = [{ id: 'u', name: 'U', quantity: 10, areaPerUnit: 0, salePrice: 0, rentPerYear: 12_000 }];
    p.rentLines = [{ id: 'r', unitTypeId: 'u', start: 0, termMonths: 24, vacancyPct: 0.05, outgoingsPct: 0.2, escalate: false }];
    p.exit = { month: 23, capRate: 0.05, sellingCostPct: 0.02 };
    const r = runModel(p);
    // gross 120,000 a year; net rent 114,000; outgoings 24,000 → net operating 90,000 a year
    const rent = r.lines.find((l) => l.id === 'r')!;
    expect(rent.escalated).toBeCloseTo(114_000 * 2, 6);
    const exit = r.lines.find((l) => l.id === 'exit')!;
    expect(exit.escalated).toBeCloseTo((90_000 / 0.05) * 0.98, 4);
  });

  it('warns when a line runs past the horizon', () => {
    const p = base();
    p.costLines[0].span = 100;
    expect(runModel(p).warnings.some((w) => w.includes('horizon'))).toBe(true);
  });
});

describe('residual land value', () => {
  it('hits the target margin (hand-solved: 3,000,000)', () => {
    const p = emptyProject();
    p.jurisdictionId = 'au-other';
    p.horizonMonths = 12;
    p.equity = { limit: 1e12 };
    p.unitTypes = [{ id: 'u', name: 'U', quantity: 1, areaPerUnit: 0, salePrice: 10_000_000, rentPerYear: 0 }];
    p.costLines = [
      { id: 'c', name: 'Build', group: 'construction', basis: { kind: 'fixed', amount: 5_000_000 }, start: 0, span: 6, curve: 'even', escalate: false },
    ];
    p.saleLines = [{ id: 's', unitTypeId: 'u', start: 8, span: 1, curve: 'even', escalate: false }];
    p.land = { price: 123, settlementMonth: 0, stampDuty: 0 };
    const res = residualLandValue(p, 0.25);
    expect(res.landPrice).not.toBeNull();
    expect(res.landPrice!).toBeCloseTo(3_000_000, 0);
  });

  it('reports when the target cannot be met', () => {
    const p = base();
    const res = residualLandValue(p, 50);
    expect(res.landPrice).toBeNull();
    expect(res.reason).toBeTruthy();
  });

  it('includes jurisdiction stamp duty in the solve', () => {
    const p = emptyProject();
    p.jurisdictionId = 'au-vic';
    p.horizonMonths = 12;
    p.equity = { limit: 1e12 };
    p.unitTypes = [{ id: 'u', name: 'U', quantity: 1, areaPerUnit: 0, salePrice: 10_000_000, rentPerYear: 0 }];
    p.saleLines = [{ id: 's', unitTypeId: 'u', start: 6, span: 1, curve: 'even', escalate: false }];
    const res = residualLandValue(p, 0.2);
    // 10M − L − duty(L) = 0.2 × (L + duty(L))  → (L + duty) = 10M/1.2
    expect(res.landPrice! + res.stampDuty).toBeCloseTo(10_000_000 / 1.2, 0);
  });
});
