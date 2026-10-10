/**
 * Feaso calculation engine – input and result types.
 *
 * All amounts are in the project currency, excluding GST (GST handling is a later
 * milestone). Months are zero-based offsets from the project start month.
 */

export type CurveId = 'even' | 's' | 'front' | 'back';

export type CostGroup =
  | 'acquisition'
  | 'professional'
  | 'construction'
  | 'statutory'
  | 'contingency'
  | 'holding'
  | 'selling'
  | 'outgoings'
  | 'other';

export const COST_GROUPS: CostGroup[] = [
  'acquisition',
  'professional',
  'construction',
  'statutory',
  'contingency',
  'holding',
  'selling',
  'outgoings',
  'other',
];

/** A product type. Sales, rent, escalation and per-unit costs all join on `id`. */
export interface UnitType {
  id: string;
  name: string;
  quantity: number;
  /** Net area of one unit (m²). */
  areaPerUnit: number;
  /** Sale price of one unit, current dollars. */
  salePrice: number;
  /** Rent for one unit per year, current dollars. */
  rentPerYear: number;
}

/** Where a rate-based cost line gets its quantity. */
export type QuantitySource =
  | { source: 'manual'; qty: number }
  | { source: 'units' }
  | { source: 'area' }
  | { source: 'unitType'; unitTypeId: string; measure: 'units' | 'area' };

export type PercentBase =
  | 'construction'
  | 'professional'
  | 'constructionAndProfessional';

export type CostBasis =
  | { kind: 'fixed'; amount: number }
  | { kind: 'rate'; rate: number; quantity: QuantitySource }
  /** Percentage of another cost group's current-dollar total. */
  | { kind: 'percent'; pct: number; of: PercentBase }
  /** Percentage of gross sale proceeds, month by month (commissions, legals). */
  | { kind: 'percentOfSales'; pct: number };

export interface CostLine {
  id: string;
  name: string;
  group: CostGroup;
  basis: CostBasis;
  /** First month of spend. */
  start: number;
  /** Number of months the spend is spread across (min 1). */
  span: number;
  curve: CurveId;
  /** Apply the group's escalation row to this line. */
  escalate: boolean;
}

export interface SaleLine {
  id: string;
  unitTypeId: string;
  /** First settlement month. */
  start: number;
  span: number;
  curve: CurveId;
  escalate: boolean;
}

export interface RentLine {
  id: string;
  unitTypeId: string;
  start: number;
  termMonths: number;
  /** 0..1 */
  vacancyPct: number;
  /** Operating outgoings borne by the owner, 0..1 of gross rent. */
  outgoingsPct: number;
  /** Apply annual rent reviews using the unit type's escalation row. */
  escalate: boolean;
}

export interface Land {
  price: number;
  settlementMonth: number;
  /** Stamp duty / transfer tax paid at settlement. */
  stampDuty: number;
}

/** Hold-and-sell-at-exit value for rental projects. */
export interface Exit {
  month: number;
  /** Annual yield, e.g. 0.055. 0 disables the exit sale. */
  capRate: number;
  sellingCostPct: number;
}

/**
 * Annual escalation rates, keyed by a cost group or a unit type id.
 * Index 0 is the first 12 months; the last rate carries forward.
 */
export type EscalationTable = Record<string, number[]>;

export interface Facility {
  id: string;
  name: string;
  limit: number;
  /** Annual nominal rate, capitalised monthly. */
  interestRate: number;
  startMonth: number;
  /** Month the balance falls due; undefined means until the horizon. */
  maturityMonth?: number;
  /** Establishment fee as a fraction of the limit, paid in the start month. */
  establishmentFeePct: number;
  /** Facility that takes over the outstanding balance at maturity. */
  refinancedById?: string;
}

export interface Equity {
  /** Maximum equity capital outstanding. Equity funds shortfalls first. */
  limit: number;
}

export interface Project {
  name: string;
  jurisdictionId: string;
  horizonMonths: number;
  /** Annual nominal discount rate, e.g. 0.1. */
  discountRate: number;
  /** Target margin on cost used for the residual land value, e.g. 0.2. */
  targetMargin: number;
  unitTypes: UnitType[];
  land: Land;
  costLines: CostLine[];
  saleLines: SaleLine[];
  rentLines: RentLine[];
  exit: Exit;
  escalation: EscalationTable;
  equity: Equity;
  facilities: Facility[];
}

export interface SeriesLine {
  id: string;
  label: string;
  kind: 'income' | 'cost';
  group?: CostGroup | 'sales' | 'rent' | 'exit' | 'land';
  /** Sum in current (un-escalated) dollars. */
  current: number;
  /** Sum as it hits the cash flow. */
  escalated: number;
  monthly: number[];
}

export interface Metrics {
  grossRevenue: number;
  totalCostsBeforeFinance: number;
  interest: number;
  fees: number;
  totalCosts: number;
  profit: number;
  /** profit / total costs; null when costs are zero */
  marginOnCost: number | null;
  marginOnRevenue: number | null;
  npv: number;
  /** Annual nominal, unlevered; null when no sign change. */
  projectIrr: number | null;
  equityIrr: number | null;
  peakDebt: number;
  peakEquity: number;
  /** Month index of the first month cumulative project cash flow turns positive. */
  breakevenMonth: number | null;
  equityMultiple: number | null;
}

export interface ModelResult {
  months: number;
  lines: SeriesLine[];
  income: number[];
  costs: number[];
  /** Unlevered cash flow: income − costs, before any finance. */
  preFinanceCashFlow: number[];
  equityCashFlow: number[];
  debtBalance: number[];
  interestByMonth: number[];
  metrics: Metrics;
  warnings: string[];
}
