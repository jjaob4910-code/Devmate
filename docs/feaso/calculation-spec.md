# Feaso calculation spec (v0.1)

Generic, project-agnostic description of what `src/feaso/engine` computes. No real project figures appear in this repo; tests use small invented cases.

## Conventions
- Monthly model, months are zero-based offsets from project start. Horizon up to 600 months.
- All amounts exclude GST (GST module is a later milestone).
- Amounts are entered in **today's dollars** and escalated to the month of payment or receipt.
- Rates are annual nominal; monthly rate = annual / 12 for discounting and interest.

## Primitives
| Primitive | Purpose |
|---|---|
| `UnitType` | Defined once: units, area, sale price, rent per year. Sales, rent, escalation and per-unit costs join on its id. |
| `CostLine` | Group, basis (lump sum, rate × quantity, % of a cost group, % of sales), start month, span, spend curve, escalate flag. |
| `SaleLine` | Unit type settles over a window; revenue timing = settlement. |
| `RentLine` | Rent from a start month for a term; vacancy, outgoings, annual reviews. |
| `Exit` | Optional capitalised sale of held net income. |
| `EscalationTable` | Annual rates per cost group or unit type; last rate carries forward. |
| `Facility`, `Equity` | Funding waterfall. |

## Timing
`spread(total, start, span, curve)` distributes a total across `span` months using the cumulative curve `C(t)`: month *i* receives `total × (C((i+1)/span) − C(i/span))`. Curves: even, S (`t − sin(2πt)/2π`), front-loaded, back-loaded. These are generated shapes.

## Escalation
- Costs and sale prices: index[0] = 1; index[m] = index[m−1] × (1 + r_year)^(1/12), where year = ⌊(m−1)/12⌋.
- Rent: step index; constant for 12 months from rent start, then steps by the annual rate of the project year containing each anniversary.

## Cost resolution order
1. Lump-sum and rate lines.
2. Percent lines based on construction, then on professional fees, then on construction + fees. A line never uses its own group as a base.
3. Percent-of-sales lines follow monthly gross sales.

## Funding waterfall (each month)
1. Interest accrues on opening balances and is capitalised.
2. Need = costs − income + fees.
3. Maturities: balance moves to the refinancing facility if set, otherwise it is added to need.
4. Shortfall: equity up to its limit, then facilities in listed order that are open. Any remainder is treated as extra equity and flagged as a funding gap.
5. Surplus: repay facilities in listed order, return equity capital, then distribute.

## Outputs
Profit, margin on cost (profit ÷ total costs incl. interest and fees), margin on revenue, NPV (unlevered, nominal), project IRR (unlevered), equity IRR, peak debt, peak equity, breakeven month, equity multiple, residual land value (bisection on land price for the target margin, with stamp duty recomputed per trial where a schedule exists).

## Known gaps (next milestones)
GST (margin scheme, withholding, credit timing), deposits and pre-sales, land payments in instalments, interest on equity, land tax, multi-stage projects, sensitivity grid, Monte Carlo, NZ-specific rules, state duty schedules other than VIC. Reference rates must be verified before reliance.
