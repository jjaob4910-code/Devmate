import { escalationIndex, reviewIndex, spread } from './curves';
import { getJurisdiction } from './jurisdictions';
import { irr, npv } from './metrics';
import type {
  CostGroup,
  CostLine,
  Facility,
  ModelResult,
  Project,
  SeriesLine,
  UnitType,
} from './types';

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const zeros = (n: number) => new Array<number>(n).fill(0);

function quantityFor(line: CostLine, unitTypes: UnitType[]): number {
  if (line.basis.kind !== 'rate') return 0;
  const q = line.basis.quantity;
  switch (q.source) {
    case 'manual':
      return q.qty;
    case 'units':
      return sum(unitTypes.map((u) => u.quantity));
    case 'area':
      return sum(unitTypes.map((u) => u.quantity * u.areaPerUnit));
    case 'unitType': {
      const u = unitTypes.find((x) => x.id === q.unitTypeId);
      if (!u) return 0;
      return q.measure === 'units' ? u.quantity : u.quantity * u.areaPerUnit;
    }
  }
}

/** Current-dollar total of a cost line, or null if it depends on other lines. */
function directTotal(line: CostLine, unitTypes: UnitType[]): number | null {
  switch (line.basis.kind) {
    case 'fixed':
      return line.basis.amount;
    case 'rate':
      return line.basis.rate * quantityFor(line, unitTypes);
    default:
      return null;
  }
}

const PERCENT_BASE_GROUPS = {
  construction: ['construction'],
  professional: ['professional'],
  constructionAndProfessional: ['construction', 'professional'],
} as const;

/**
 * Run the full monthly model. Pure and deterministic: same project, same result.
 */
export function runModel(project: Project): ModelResult {
  const months = Math.max(1, Math.floor(project.horizonMonths));
  const warnings: string[] = [];
  const lines: SeriesLine[] = [];
  const unitTypes = project.unitTypes;
  const unitById = new Map(unitTypes.map((u) => [u.id, u]));

  const idxCache = new Map<string, number[]>();
  const indexFor = (key: string) => {
    let v = idxCache.get(key);
    if (!v) {
      v = escalationIndex(project.escalation[key], months);
      idxCache.set(key, v);
    }
    return v;
  };

  const warnBeyond = (label: string, lastMonth: number) => {
    if (lastMonth >= months) warnings.push(`"${label}" runs past the ${months}-month horizon and is cut off.`);
  };

  // ---- Land --------------------------------------------------------------
  const land = project.land;
  if (land.price > 0 || land.stampDuty > 0) {
    const m = Math.max(0, Math.floor(land.settlementMonth));
    const monthly = zeros(months);
    if (m < months) monthly[m] = land.price + land.stampDuty;
    else warnings.push('Land settlement is after the model horizon.');
    lines.push({
      id: 'land',
      label: 'Land and stamp duty',
      kind: 'cost',
      group: 'land',
      current: land.price + land.stampDuty,
      escalated: sum(monthly),
      monthly,
    });
  }

  // ---- Revenue: sales ----------------------------------------------------
  const salesMonthly = zeros(months);
  for (const sl of project.saleLines) {
    const u = unitById.get(sl.unitTypeId);
    if (!u) continue;
    const current = u.quantity * u.salePrice;
    const base = spread(current, sl.start, sl.span, sl.curve, months);
    const idx = sl.escalate ? indexFor(u.id) : null;
    const monthly = base.map((v, m) => (idx ? v * idx[m] : v));
    warnBeyond(`Sales – ${u.name}`, sl.start + Math.max(1, sl.span) - 1);
    lines.push({
      id: sl.id,
      label: `Sales – ${u.name}`,
      kind: 'income',
      group: 'sales',
      current,
      escalated: sum(monthly),
      monthly,
    });
    monthly.forEach((v, m) => (salesMonthly[m] += v));
  }

  // ---- Revenue: rent -----------------------------------------------------
  const netRentMonthly = zeros(months);
  const outgoingsMonthly = zeros(months);
  for (const rl of project.rentLines) {
    const u = unitById.get(rl.unitTypeId);
    if (!u) continue;
    const annual = u.quantity * u.rentPerYear;
    const review = rl.escalate ? reviewIndex(project.escalation[u.id], rl.start, months) : null;
    const gross = zeros(months);
    const end = Math.min(months, rl.start + Math.max(0, Math.floor(rl.termMonths)));
    for (let m = Math.max(0, rl.start); m < end; m++) {
      gross[m] = (annual / 12) * (review ? review[m] : 1);
    }
    warnBeyond(`Rent – ${u.name}`, rl.start + rl.termMonths - 1);
    const net = gross.map((g) => g * (1 - rl.vacancyPct));
    const outgoings = gross.map((g) => g * rl.outgoingsPct);
    const rentCurrent = (annual * Math.max(0, rl.termMonths)) / 12;
    lines.push({
      id: rl.id,
      label: `Net rent – ${u.name}`,
      kind: 'income',
      group: 'rent',
      current: rentCurrent * (1 - rl.vacancyPct),
      escalated: sum(net),
      monthly: net,
    });
    if (rl.outgoingsPct > 0) {
      lines.push({
        id: `${rl.id}-out`,
        label: `Outgoings – ${u.name}`,
        kind: 'cost',
        group: 'outgoings',
        current: rentCurrent * rl.outgoingsPct,
        escalated: sum(outgoings),
        monthly: outgoings,
      });
      outgoings.forEach((v, m) => (outgoingsMonthly[m] += v));
    }
    net.forEach((v, m) => (netRentMonthly[m] += v));
  }

  // ---- Exit sale of a held asset ----------------------------------------
  const exitMonthly = zeros(months);
  const exit = project.exit;
  if (exit.capRate > 0 && exit.month >= 0) {
    if (exit.month >= months) {
      warnings.push('Exit month is after the model horizon, so no exit sale is included.');
    } else {
      // Annualised net rent in the exit month (after vacancy and outgoings).
      const annualNet = (netRentMonthly[exit.month] - outgoingsMonthly[exit.month]) * 12;
      const value = annualNet > 0 ? annualNet / exit.capRate : 0;
      exitMonthly[exit.month] = value * (1 - exit.sellingCostPct);
      lines.push({
        id: 'exit',
        label: 'Capitalised exit sale (net of selling costs)',
        kind: 'income',
        group: 'exit',
        current: exitMonthly[exit.month],
        escalated: exitMonthly[exit.month],
        monthly: exitMonthly,
      });
    }
  }

  // ---- Costs -------------------------------------------------------------
  const currentByGroup: Partial<Record<CostGroup, number>> = {};
  const costOrder = [...project.costLines];
  const totals = new Map<string, number>();

  // Pass 1: fixed and rate lines
  for (const cl of costOrder) {
    const t = directTotal(cl, unitTypes);
    if (t !== null) {
      totals.set(cl.id, t);
      currentByGroup[cl.group] = (currentByGroup[cl.group] ?? 0) + t;
    }
  }
  // Pass 2: percent lines whose base is construction only, then the rest.
  // A line never uses its own group as a base (avoids circular references).
  const resolvePercent = (cl: CostLine) => {
    if (cl.basis.kind !== 'percent') return;
    const groups = PERCENT_BASE_GROUPS[cl.basis.of].filter((g) => g !== cl.group);
    const base = sum(groups.map((g) => currentByGroup[g] ?? 0));
    const t = base * cl.basis.pct;
    totals.set(cl.id, t);
    currentByGroup[cl.group] = (currentByGroup[cl.group] ?? 0) + t;
  };
  costOrder.filter((c) => c.basis.kind === 'percent' && c.basis.of === 'construction').forEach(resolvePercent);
  costOrder.filter((c) => c.basis.kind === 'percent' && c.basis.of === 'professional').forEach(resolvePercent);
  costOrder.filter((c) => c.basis.kind === 'percent' && c.basis.of === 'constructionAndProfessional').forEach(resolvePercent);

  const costsMonthly = zeros(months);
  for (const cl of costOrder) {
    let monthly: number[];
    let current: number;
    if (cl.basis.kind === 'percentOfSales') {
      current = sum(salesMonthly) * cl.basis.pct;
      monthly = salesMonthly.map((v) => v * (cl.basis as { pct: number }).pct);
    } else {
      current = totals.get(cl.id) ?? 0;
      const base = spread(current, cl.start, cl.span, cl.curve, months);
      const idx = cl.escalate ? indexFor(cl.group) : null;
      monthly = base.map((v, m) => (idx ? v * idx[m] : v));
      warnBeyond(cl.name || 'Unnamed cost', cl.start + Math.max(1, cl.span) - 1);
    }
    lines.push({
      id: cl.id,
      label: cl.name || 'Unnamed cost',
      kind: 'cost',
      group: cl.group,
      current,
      escalated: sum(monthly),
      monthly,
    });
    monthly.forEach((v, m) => (costsMonthly[m] += v));
  }

  // ---- Unlevered cash flow ----------------------------------------------
  const income = zeros(months);
  const costs = zeros(months);
  for (const l of lines) {
    const target = l.kind === 'income' ? income : costs;
    l.monthly.forEach((v, m) => (target[m] += v));
  }
  const preFinance = income.map((v, m) => v - costs[m]);

  // ---- Finance waterfall -------------------------------------------------
  const fin = runFinance(project, preFinance, months, warnings);

  // ---- Metrics -----------------------------------------------------------
  const grossRevenue = sum(income);
  const totalCostsBeforeFinance = sum(costs);
  const interest = sum(fin.interest);
  const fees = sum(fin.fees);
  const totalCosts = totalCostsBeforeFinance + interest + fees;
  const profit = grossRevenue - totalCosts;

  let cum = 0;
  let wasNeg = false;
  let breakeven: number | null = null;
  for (let m = 0; m < months; m++) {
    cum += preFinance[m];
    if (cum < 0) wasNeg = true;
    if (wasNeg && cum >= 0 && breakeven === null) breakeven = m;
  }

  const equityIn = sum(fin.equityCash.map((v) => (v < 0 ? -v : 0)));
  const equityOut = sum(fin.equityCash.map((v) => (v > 0 ? v : 0)));

  if (interest > 0) {
    lines.push({
      id: 'finance-interest',
      label: 'Capitalised interest',
      kind: 'cost',
      group: 'other',
      current: interest,
      escalated: interest,
      monthly: fin.interest,
    });
  }
  if (fees > 0) {
    lines.push({
      id: 'finance-fees',
      label: 'Facility fees',
      kind: 'cost',
      group: 'other',
      current: fees,
      escalated: fees,
      monthly: fin.fees,
    });
  }

  return {
    months,
    lines,
    income,
    costs,
    preFinanceCashFlow: preFinance,
    equityCashFlow: fin.equityCash,
    debtBalance: fin.debtBalance,
    interestByMonth: fin.interest,
    warnings: [...warnings, ...fin.warnings],
    metrics: {
      grossRevenue,
      totalCostsBeforeFinance,
      interest,
      fees,
      totalCosts,
      profit,
      marginOnCost: totalCosts > 0 ? profit / totalCosts : null,
      marginOnRevenue: grossRevenue > 0 ? profit / grossRevenue : null,
      npv: npv(preFinance, project.discountRate),
      projectIrr: irr(preFinance),
      equityIrr: irr(fin.equityCash),
      peakDebt: Math.max(0, ...fin.debtBalance),
      peakEquity: fin.peakEquity,
      breakevenMonth: breakeven,
      equityMultiple: equityIn > 0 ? equityOut / equityIn : null,
    },
  };
}

interface FinanceResult {
  interest: number[];
  fees: number[];
  equityCash: number[];
  debtBalance: number[];
  peakEquity: number;
  warnings: string[];
}

/**
 * Funding waterfall. Shortfalls are funded by equity (up to its limit), then by
 * facilities in listed order that are open that month. Surpluses repay facilities in
 * listed order, then return equity capital, then distribute. Interest accrues on the
 * opening balance and is capitalised. At maturity the balance moves to the
 * refinancing facility if there is one, otherwise it is repaid from project cash and
 * then equity.
 */
function runFinance(
  project: Project,
  preFinance: number[],
  months: number,
  outWarnings: string[],
): FinanceResult {
  const warnings = outWarnings;
  const facilities: Facility[] = project.facilities.filter((f) => f.limit > 0);
  const bal = new Map<string, number>(facilities.map((f) => [f.id, 0]));
  const interest = zeros(months);
  const fees = zeros(months);
  const equityCash = zeros(months);
  const debtBalance = zeros(months);
  let equityOutstanding = 0;
  let peakEquity = 0;
  const equityLimit = Math.max(0, project.equity.limit);
  let unfundedTotal = 0;

  for (const f of facilities) {
    if (f.establishmentFeePct > 0 && f.startMonth >= 0 && f.startMonth < months) {
      fees[f.startMonth] += f.limit * f.establishmentFeePct;
    }
  }

  for (let m = 0; m < months; m++) {
    // 1. interest on opening balances, capitalised
    for (const f of facilities) {
      const b = bal.get(f.id) ?? 0;
      if (b > 0) {
        const i = (b * f.interestRate) / 12;
        bal.set(f.id, b + i);
        interest[m] += i;
      }
    }

    let need = -preFinance[m] + fees[m];

    // 2. maturities
    for (const f of facilities) {
      if (f.maturityMonth !== undefined && m === Math.floor(f.maturityMonth)) {
        const b = bal.get(f.id) ?? 0;
        if (b <= 0) continue;
        const target = f.refinancedById ? facilities.find((x) => x.id === f.refinancedById) : undefined;
        if (target) {
          bal.set(f.id, 0);
          const tb = (bal.get(target.id) ?? 0) + b;
          bal.set(target.id, tb);
          if (tb > target.limit + 0.005) {
            warnings.push(`"${target.name}" exceeds its limit after refinancing "${f.name}".`);
          }
        } else {
          bal.set(f.id, 0);
          need += b;
        }
      }
    }

    if (need > 0) {
      // 3a. equity first
      const eq = Math.min(need, Math.max(0, equityLimit - equityOutstanding));
      if (eq > 0) {
        equityOutstanding += eq;
        equityCash[m] -= eq;
        need -= eq;
      }
      // 3b. facilities
      for (const f of facilities) {
        if (need <= 0) break;
        const open =
          m >= f.startMonth && (f.maturityMonth === undefined || m < Math.floor(f.maturityMonth));
        if (!open) continue;
        const b = bal.get(f.id) ?? 0;
        const draw = Math.min(need, Math.max(0, f.limit - b));
        if (draw > 0) {
          bal.set(f.id, b + draw);
          need -= draw;
        }
      }
      // 3c. anything left is unfunded: inject as extra equity and flag it
      if (need > 0.005) {
        equityOutstanding += need;
        equityCash[m] -= need;
        unfundedTotal += need;
        need = 0;
      }
    } else if (need < 0) {
      let surplus = -need;
      for (const f of facilities) {
        if (surplus <= 0) break;
        const b = bal.get(f.id) ?? 0;
        const pay = Math.min(surplus, b);
        if (pay > 0) {
          bal.set(f.id, b - pay);
          surplus -= pay;
        }
      }
      const back = Math.min(surplus, equityOutstanding);
      if (back > 0) {
        equityOutstanding -= back;
        equityCash[m] += back;
        surplus -= back;
      }
      if (surplus > 0) equityCash[m] += surplus; // distribution of profit
    }

    peakEquity = Math.max(peakEquity, equityOutstanding);
    debtBalance[m] = facilities.reduce((t, f) => t + (bal.get(f.id) ?? 0), 0);
  }

  if (unfundedTotal > 0.5) {
    warnings.push(
      `Funding gap: ${Math.round(unfundedTotal).toLocaleString()} could not be funded within equity and facility limits, and has been treated as extra equity.`,
    );
  }
  const left = facilities.filter((f) => (bal.get(f.id) ?? 0) > 0.5);
  for (const f of left) warnings.push(`"${f.name}" still has a balance at the end of the model horizon.`);

  return { interest, fees, equityCash, debtBalance, peakEquity, warnings: [] };
}

export interface ResidualResult {
  landPrice: number | null;
  stampDuty: number;
  reason?: string;
}

/**
 * Solve the maximum land price that still achieves the target margin on cost.
 * Stamp duty is recomputed for each trial price when the jurisdiction has a schedule;
 * otherwise the project's manual stamp duty is held constant.
 */
export function residualLandValue(project: Project, targetMargin = project.targetMargin): ResidualResult {
  const j = getJurisdiction(project.jurisdictionId);
  const trial = (price: number): Project => ({
    ...project,
    land: {
      ...project.land,
      price,
      stampDuty: j.stampDuty ? j.stampDuty(price) : project.land.stampDuty,
    },
  });
  const gap = (price: number) => {
    const r = runModel(trial(price)).metrics;
    // profit − target × costs; decreasing in land price
    return r.profit - targetMargin * r.totalCosts;
  };

  const rev = runModel(trial(0)).metrics.grossRevenue;
  if (rev <= 0) return { landPrice: null, stampDuty: 0, reason: 'No revenue is entered yet.' };
  if (gap(0) < 0) {
    return { landPrice: null, stampDuty: 0, reason: 'The target margin is not achievable even at zero land cost.' };
  }
  let lo = 0;
  let hi = rev;
  if (gap(hi) > 0) return { landPrice: null, stampDuty: 0, reason: 'Could not bracket a solution.' };
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) > 0) lo = mid;
    else hi = mid;
    if (hi - lo < 0.01) break;
  }
  const price = (lo + hi) / 2;
  return { landPrice: price, stampDuty: j.stampDuty ? j.stampDuty(price) : project.land.stampDuty };
}
