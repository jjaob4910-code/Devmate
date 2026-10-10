import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { emptyProject, getJurisdiction, residualLandValue, runModel, type Project } from './engine';
import Chart from './Chart';
import {
  CostsSection,
  EscalationSection,
  FinanceSection,
  GROUP_LABEL,
  LandSection,
  ProjectSection,
  RevenueSection,
  UnitMixSection,
} from './editors';
import { GhostButton, money, pct } from './ui';

const STORAGE_KEY = 'feaso_draft_v1';

function loadDraft(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyProject(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupt: start blank */
  }
  return emptyProject();
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <span className="block text-[10px] uppercase tracking-widest font-mono font-bold text-white/40 mb-1.5">{label}</span>
      <span className="block text-xl font-display font-medium text-white tracking-tight">{value}</span>
      {sub && <span className="block text-[11px] text-white/35 mt-1">{sub}</span>}
    </div>
  );
}

export default function FeasoApp() {
  const [project, setProject] = useState<Project>(loadDraft);
  const [solveRlv, setSolveRlv] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* ignore */
    }
  }, [project]);

  const update = useCallback((fn: (p: Project) => Project) => {
    setProject((p) => {
      const next = fn(p);
      // Stamp duty follows the price automatically where the jurisdiction has a schedule.
      const j = getJurisdiction(next.jurisdictionId);
      if (j.stampDuty) {
        const duty = j.stampDuty(next.land.price);
        if (duty !== next.land.stampDuty) return { ...next, land: { ...next.land, stampDuty: duty } };
      }
      return next;
    });
    setSolveRlv(false);
  }, []);

  const result = useMemo(() => runModel(project), [project]);
  const j = getJurisdiction(project.jurisdictionId);
  const currency = j.currency;
  const m = result.metrics;

  const spend = useMemo(() => {
    const out: Record<string, number[]> = {};
    for (const l of result.lines) out[l.id] = l.monthly;
    return out;
  }, [result]);

  const rlv = useMemo(() => (solveRlv ? residualLandValue(project) : null), [solveRlv, project]);

  const groupRows = useMemo(() => {
    const map = new Map<string, { label: string; current: number; escalated: number }>();
    for (const l of result.lines) {
      if (l.kind !== 'cost') continue;
      const key = l.group ?? 'other';
      const label = key === 'land' ? 'Land and stamp duty' : (GROUP_LABEL as Record<string, string>)[key] ?? key;
      const row = map.get(key) ?? { label, current: 0, escalated: 0 };
      row.current += l.current;
      row.escalated += l.escalated;
      map.set(key, row);
    }
    return [...map.values()].filter((r) => r.escalated !== 0);
  }, [result]);

  const reset = () => {
    if (window.confirm('Clear every input and start again?')) {
      setProject(emptyProject());
      setSolveRlv(false);
    }
  };

  const editorProps = { project, update, currency, spend };

  return (
    <main className="relative pt-28 pb-24 min-h-screen bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10 max-w-3xl">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold block mb-3">Feaso by Devmate · Early access</span>
          <h1 className="text-4xl sm:text-6xl font-display font-medium tracking-tight text-gradient mb-4">Development feasibility, built in the browser.</h1>
          <p className="text-white/50 text-base sm:text-lg">
            Model unit types, timing, escalation and funding month by month. Every input starts blank. Amounts exclude GST. Your draft stays in this browser only.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <ProjectSection {...editorProps} />
            <UnitMixSection {...editorProps} />
            <LandSection {...editorProps} />
            <CostsSection {...editorProps} />
            <RevenueSection {...editorProps} />
            <EscalationSection {...editorProps} />
            <FinanceSection {...editorProps} />
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="frosted-glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-medium text-white">Results</h2>
                <GhostButton onClick={reset} danger>
                  <RotateCcw className="w-3.5 h-3.5" /> Clear all
                </GhostButton>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <Kpi label="Net profit" value={money(m.profit, currency)} sub={`Revenue ${money(m.grossRevenue, currency)}`} />
                <Kpi label="Margin on cost" value={pct(m.marginOnCost)} sub={`On revenue ${pct(m.marginOnRevenue)}`} />
                <Kpi label="Project IRR" value={pct(m.projectIrr)} sub="Unlevered, nominal p.a." />
                <Kpi label="Equity IRR" value={pct(m.equityIrr)} sub={m.equityMultiple !== null ? `${m.equityMultiple.toFixed(2)}× equity multiple` : undefined} />
                <Kpi label="NPV" value={money(m.npv, currency)} sub={project.discountRate ? `At ${pct(project.discountRate)}` : 'Set a discount rate'} />
                <Kpi label="Peak debt" value={money(m.peakDebt, currency)} sub={`Peak equity ${money(m.peakEquity, currency)}`} />
              </div>

              <Chart net={result.preFinanceCashFlow} currency={currency} />
            </div>

            <div className="frosted-glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/80">Residual land value</h3>
                <GhostButton onClick={() => setSolveRlv(true)}>Solve</GhostButton>
              </div>
              {!rlv ? (
                <p className="text-xs text-white/40">
                  Finds the highest land price that still reaches your target margin ({project.targetMargin ? pct(project.targetMargin) : 'not set'}).
                </p>
              ) : rlv.landPrice === null ? (
                <p className="text-xs text-white/60">{rlv.reason}</p>
              ) : (
                <div>
                  <span className="block text-2xl font-display font-medium text-white">{money(rlv.landPrice, currency)}</span>
                  <span className="block text-[11px] text-white/40 mt-1">plus {money(rlv.stampDuty, currency)} duty · for a {pct(project.targetMargin)} margin on cost</span>
                </div>
              )}
            </div>

            {groupRows.length > 0 && (
              <div className="frosted-glass-card p-6">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Costs by group</h3>
                <table className="w-full text-xs font-mono">
                  <thead className="text-white/35">
                    <tr>
                      <th className="text-left font-medium pb-2">Group</th>
                      <th className="text-right font-medium pb-2">Today's $</th>
                      <th className="text-right font-medium pb-2">Escalated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((r) => (
                      <tr key={r.label} className="border-t border-white/5 text-white/70">
                        <td className="py-1.5 pr-2 font-sans">{r.label}</td>
                        <td className="py-1.5 text-right">{money(r.current, currency)}</td>
                        <td className="py-1.5 text-right">{money(r.escalated, currency)}</td>
                      </tr>
                    ))}
                    {(m.interest + m.fees) > 0 && (
                      <tr className="border-t border-white/5 text-white/70">
                        <td className="py-1.5 font-sans">Interest and fees</td>
                        <td className="py-1.5 text-right">{money(m.interest + m.fees, currency)}</td>
                        <td className="py-1.5 text-right">{money(m.interest + m.fees, currency)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-white/15 text-white">
                      <td className="py-2 font-sans font-medium">Total costs</td>
                      <td className="py-2 text-right" />
                      <td className="py-2 text-right">{money(m.totalCosts, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
                <div className="flex items-center gap-2 mb-2 text-white/80 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Check these
                </div>
                <ul className="space-y-1.5 text-xs text-white/60 list-disc pl-4">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-white/30 px-1">
              Early-access tool for planning only. It is not financial, tax or legal advice. GST, income tax and duty concessions are not yet modelled; verify all reference rates.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
