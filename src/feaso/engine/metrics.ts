/** Net present value of monthly flows at an annual nominal rate (rate/12 per month). */
export function npv(flows: number[], annualRate: number): number {
  const r = annualRate / 12;
  let total = 0;
  for (let i = 0; i < flows.length; i++) total += flows[i] / Math.pow(1 + r, i);
  return total;
}

/**
 * IRR of monthly flows, returned as an annual nominal rate (monthly × 12).
 * Returns null when flows lack both signs or no root is found.
 */
export function irr(flows: number[]): number | null {
  let hasPos = false;
  let hasNeg = false;
  for (const f of flows) {
    if (f > 0) hasPos = true;
    else if (f < 0) hasNeg = true;
  }
  if (!hasPos || !hasNeg) return null;

  const f = (r: number) => {
    let t = 0;
    for (let i = 0; i < flows.length; i++) t += flows[i] / Math.pow(1 + r, i);
    return t;
  };

  let lo = -0.99;
  let hi = 10;
  let flo = f(lo);
  let fhi = f(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-9 || hi - lo < 1e-12) return mid * 12;
    if (flo * fm < 0) {
      hi = mid;
      fhi = fm;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return ((lo + hi) / 2) * 12;
}
