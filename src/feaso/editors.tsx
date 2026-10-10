import { Plus, X } from 'lucide-react';
import {
  COST_GROUPS,
  JURISDICTIONS,
  getJurisdiction,
  type CostGroup,
  type CostLine,
  type CurveId,
  type Facility,
  type Project,
  type QuantitySource,
  type RentLine,
  type SaleLine,
  type UnitType,
} from './engine';
import { EmptyState, Field, GhostButton, NumInput, PctInput, Section, Select, TextInput, Toggle, money, uid } from './ui';

type Patch = (fn: (p: Project) => Project) => void;
interface Props {
  project: Project;
  update: Patch;
  currency: string;
  /** Monthly escalated spend per line id, for the mini timeline. */
  spend: Record<string, number[]>;
}

export const GROUP_LABEL: Record<CostGroup, string> = {
  acquisition: 'Acquisition costs',
  professional: 'Professional fees',
  construction: 'Construction',
  statutory: 'Statutory fees',
  contingency: 'Contingency',
  holding: 'Land holding',
  selling: 'Selling costs',
  outgoings: 'Outgoings',
  other: 'Other',
};

const CURVES: { value: CurveId; label: string }[] = [
  { value: 'even', label: 'Even' },
  { value: 's', label: 'S-curve' },
  { value: 'front', label: 'Front-loaded' },
  { value: 'back', label: 'Back-loaded' },
];

const RemoveButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="p-1.5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
  >
    <X className="w-4 h-4" />
  </button>
);

const AddButton = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <GhostButton onClick={onClick}>
    <Plus className="w-3.5 h-3.5" />
    {children}
  </GhostButton>
);

function Card({ children, onRemove, removeLabel }: { children: React.ReactNode; onRemove: () => void; removeLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:p-5 relative">
      <div className="absolute top-3 right-3">
        <RemoveButton onClick={onRemove} label={removeLabel} />
      </div>
      {children}
    </div>
  );
}

function Spark({ values }: { values: number[] | undefined }) {
  if (!values || !values.some((v) => v !== 0)) return <div className="h-8" />;
  const first = values.findIndex((v) => v !== 0);
  const last = values.length - 1 - [...values].reverse().findIndex((v) => v !== 0);
  const slice = values.slice(first, last + 1);
  const max = Math.max(...slice.map(Math.abs), 1);
  return (
    <svg viewBox={`0 0 ${slice.length * 4} 32`} preserveAspectRatio="none" className="w-full h-8" aria-hidden>
      {slice.map((v, i) => (
        <rect key={i} x={i * 4 + 0.5} width={3} y={32 - (Math.abs(v) / max) * 30} height={(Math.abs(v) / max) * 30} rx={1} fill="white" fillOpacity={0.5} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------- Project
export function ProjectSection({ project, update }: Props) {
  const j = getJurisdiction(project.jurisdictionId);
  return (
    <Section step="Step 01" title="Project" description="Name the project, choose where it is, and set the model length and return targets.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Project name">
          <TextInput value={project.name} placeholder="e.g. Site name" onChange={(v) => update((p) => ({ ...p, name: v }))} />
        </Field>
        <Field label="Jurisdiction" hint={j.stampDutyNote}>
          <Select
            value={project.jurisdictionId}
            options={JURISDICTIONS.map((x) => ({ value: x.id, label: x.label }))}
            onChange={(v) => update((p) => ({ ...p, jurisdictionId: v }))}
          />
        </Field>
        <Field label="Model length (months)" hint="Up to 600. Month 0 is the project start.">
          <NumInput value={project.horizonMonths} onChange={(v) => update((p) => ({ ...p, horizonMonths: Math.min(600, Math.max(0, Math.floor(v))) }))} placeholder="e.g. 36" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Discount rate (p.a.)">
            <PctInput value={project.discountRate} onChange={(v) => update((p) => ({ ...p, discountRate: v }))} />
          </Field>
          <Field label="Target margin on cost">
            <PctInput value={project.targetMargin} onChange={(v) => update((p) => ({ ...p, targetMargin: v }))} />
          </Field>
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- Unit mix
export function UnitMixSection({ project, update, currency }: Props) {
  const set = (id: string, patch: Partial<UnitType>) =>
    update((p) => ({ ...p, unitTypes: p.unitTypes.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  const remove = (id: string) =>
    update((p) => ({
      ...p,
      unitTypes: p.unitTypes.filter((u) => u.id !== id),
      saleLines: p.saleLines.filter((s) => s.unitTypeId !== id),
      rentLines: p.rentLines.filter((r) => r.unitTypeId !== id),
    }));
  const add = () =>
    update((p) => ({
      ...p,
      unitTypes: [...p.unitTypes, { id: uid(), name: '', quantity: 0, areaPerUnit: 0, salePrice: 0, rentPerYear: 0 }],
    }));
  const totalUnits = project.unitTypes.reduce((a, u) => a + u.quantity, 0);
  const totalArea = project.unitTypes.reduce((a, u) => a + u.quantity * u.areaPerUnit, 0);

  return (
    <Section
      step="Step 02"
      title="Unit mix"
      description="Define each product type once. Sales, rent, escalation and per-unit costs all refer back to it."
      action={<AddButton onClick={add}>Add unit type</AddButton>}
    >
      {project.unitTypes.length === 0 ? (
        <EmptyState>No unit types yet. Add one to start building revenue.</EmptyState>
      ) : (
        <div className="space-y-3">
          {project.unitTypes.map((u) => (
            <Card key={u.id} onRemove={() => remove(u.id)} removeLabel="Remove unit type">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pr-8">
                <div className="col-span-2 lg:col-span-1">
                  <Field label="Name">
                    <TextInput value={u.name} placeholder="Type" onChange={(v) => set(u.id, { name: v })} />
                  </Field>
                </div>
                <Field label="Units">
                  <NumInput value={u.quantity} onChange={(v) => set(u.id, { quantity: v })} />
                </Field>
                <Field label="Area / unit (m²)">
                  <NumInput value={u.areaPerUnit} onChange={(v) => set(u.id, { areaPerUnit: v })} />
                </Field>
                <Field label="Sale price / unit">
                  <NumInput value={u.salePrice} onChange={(v) => set(u.id, { salePrice: v })} />
                </Field>
                <Field label="Rent / unit / year">
                  <NumInput value={u.rentPerYear} onChange={(v) => set(u.id, { rentPerYear: v })} />
                </Field>
              </div>
            </Card>
          ))}
          <p className="text-xs text-white/35 font-mono pt-1">
            {totalUnits.toLocaleString()} units · {totalArea.toLocaleString()} m² total
            {currency ? '' : ''}
          </p>
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------- Land
export function LandSection({ project, update, currency }: Props) {
  const j = getJurisdiction(project.jurisdictionId);
  const auto = j.stampDuty ? j.stampDuty(project.land.price) : null;
  return (
    <Section step="Step 03" title="Land" description="Purchase price, settlement timing and transfer duty.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Purchase price">
          <NumInput value={project.land.price} onChange={(v) => update((p) => ({ ...p, land: { ...p.land, price: v } }))} />
        </Field>
        <Field label="Settlement month">
          <NumInput value={project.land.settlementMonth} onChange={(v) => update((p) => ({ ...p, land: { ...p.land, settlementMonth: Math.floor(v) } }))} />
        </Field>
        <Field label="Stamp duty" hint={auto !== null ? 'Calculated from price. Verify against the revenue office.' : undefined}>
          {auto !== null ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-mono text-white/70">{money(auto, currency)}</div>
          ) : (
            <NumInput value={project.land.stampDuty} onChange={(v) => update((p) => ({ ...p, land: { ...p.land, stampDuty: v } }))} />
          )}
        </Field>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------- Costs
function CostCard({ line, project, update, spend }: { line: CostLine; project: Project; update: Patch; spend: Props['spend'] }) {
  const set = (patch: Partial<CostLine>) =>
    update((p) => ({ ...p, costLines: p.costLines.map((c) => (c.id === line.id ? { ...c, ...patch } : c)) }));
  const b = line.basis;
  const qs: QuantitySource = b.kind === 'rate' ? b.quantity : { source: 'manual', qty: 0 };
  const qsKey =
    qs.source === 'unitType' ? (qs.measure === 'units' ? 'ut-units' : 'ut-area') : qs.source;
  const setQs = (key: string) => {
    if (b.kind !== 'rate') return;
    const firstUt = project.unitTypes[0]?.id ?? '';
    const next: QuantitySource =
      key === 'manual' ? { source: 'manual', qty: 0 } :
      key === 'units' ? { source: 'units' } :
      key === 'area' ? { source: 'area' } :
      { source: 'unitType', unitTypeId: firstUt, measure: key === 'ut-units' ? 'units' : 'area' };
    set({ basis: { ...b, quantity: next } });
  };
  return (
    <Card onRemove={() => update((p) => ({ ...p, costLines: p.costLines.filter((c) => c.id !== line.id) }))} removeLabel="Remove cost line">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pr-8">
        <div className="col-span-2">
          <Field label="Description">
            <TextInput value={line.name} placeholder="Cost item" onChange={(v) => set({ name: v })} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Group">
            <Select value={line.group} options={COST_GROUPS.map((g) => ({ value: g, label: GROUP_LABEL[g] }))} onChange={(v) => set({ group: v })} />
          </Field>
        </div>

        <Field label="Amount type">
          <Select
            value={b.kind}
            options={[
              { value: 'fixed', label: 'Lump sum' },
              { value: 'rate', label: 'Rate × quantity' },
              { value: 'percent', label: '% of a cost group' },
              { value: 'percentOfSales', label: '% of sales' },
            ]}
            onChange={(k) =>
              set({
                basis:
                  k === 'fixed' ? { kind: 'fixed', amount: 0 } :
                  k === 'rate' ? { kind: 'rate', rate: 0, quantity: { source: 'units' } } :
                  k === 'percent' ? { kind: 'percent', pct: 0, of: 'construction' } :
                  { kind: 'percentOfSales', pct: 0 },
              })
            }
          />
        </Field>

        {b.kind === 'fixed' && (
          <Field label="Amount">
            <NumInput value={b.amount} onChange={(v) => set({ basis: { kind: 'fixed', amount: v } })} />
          </Field>
        )}
        {b.kind === 'rate' && (
          <>
            <Field label="Rate">
              <NumInput value={b.rate} onChange={(v) => set({ basis: { ...b, rate: v } })} />
            </Field>
            <Field label="Quantity">
              <Select
                value={qsKey}
                options={[
                  { value: 'units', label: 'All units' },
                  { value: 'area', label: 'All area (m²)' },
                  { value: 'ut-units', label: 'One type – units' },
                  { value: 'ut-area', label: 'One type – area' },
                  { value: 'manual', label: 'Manual' },
                ]}
                onChange={setQs}
              />
            </Field>
            {(qs.source === 'unitType') && (
              <Field label="Unit type">
                <Select
                  value={qs.unitTypeId}
                  placeholder="Choose"
                  options={project.unitTypes.map((u) => ({ value: u.id, label: u.name || 'Unnamed' }))}
                  onChange={(v) => set({ basis: { ...b, quantity: { ...qs, unitTypeId: v } } })}
                />
              </Field>
            )}
            {qs.source === 'manual' && (
              <Field label="Quantity">
                <NumInput value={qs.qty} onChange={(v) => set({ basis: { ...b, quantity: { source: 'manual', qty: v } } })} />
              </Field>
            )}
          </>
        )}
        {b.kind === 'percent' && (
          <>
            <Field label="Percentage">
              <PctInput value={b.pct} onChange={(v) => set({ basis: { ...b, pct: v } })} />
            </Field>
            <Field label="Of">
              <Select
                value={b.of}
                options={[
                  { value: 'construction', label: 'Construction' },
                  { value: 'professional', label: 'Professional fees' },
                  { value: 'constructionAndProfessional', label: 'Construction + fees' },
                ]}
                onChange={(v) => set({ basis: { ...b, of: v } })}
              />
            </Field>
          </>
        )}
        {b.kind === 'percentOfSales' && (
          <Field label="Percentage of sales">
            <PctInput value={b.pct} onChange={(v) => set({ basis: { ...b, pct: v } })} />
          </Field>
        )}
      </div>

      {b.kind !== 'percentOfSales' ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-3 items-end">
          <Field label="Start month">
            <NumInput value={line.start} onChange={(v) => set({ start: Math.floor(v) })} />
          </Field>
          <Field label="Span (months)">
            <NumInput value={line.span} placeholder="1" onChange={(v) => set({ span: Math.max(1, Math.floor(v)) })} />
          </Field>
          <Field label="Spend pattern">
            <Select value={line.curve} options={CURVES} onChange={(v) => set({ curve: v })} />
          </Field>
          <div className="pb-2">
            <Toggle checked={line.escalate} onChange={(v) => set({ escalate: v })} label="Escalate" />
          </div>
          <div>
            <Spark values={spend[line.id]} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-white/35 mt-3">Charged as each sale settles, so it follows the sales timing.</p>
      )}
    </Card>
  );
}

export function CostsSection(props: Props) {
  const { project, update } = props;
  const add = () =>
    update((p) => ({
      ...p,
      costLines: [
        ...p.costLines,
        { id: uid(), name: '', group: 'construction', basis: { kind: 'fixed', amount: 0 }, start: 0, span: 1, curve: 'even', escalate: false },
      ],
    }));
  return (
    <Section
      step="Step 04"
      title="Costs"
      description="Each line has an amount, a start month, a span and a spend pattern. Turn escalation on to apply its group's rates."
      action={<AddButton onClick={add}>Add cost line</AddButton>}
    >
      {project.costLines.length === 0 ? (
        <EmptyState>No costs yet. Add construction, fees, statutory charges and anything else the project spends on.</EmptyState>
      ) : (
        <div className="space-y-3">
          {project.costLines.map((c) => (
            <CostCard key={c.id} line={c} project={project} update={update} spend={props.spend} />
          ))}
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------- Revenue
export function RevenueSection({ project, update }: Props) {
  const utOptions = project.unitTypes.map((u) => ({ value: u.id, label: u.name || 'Unnamed' }));
  const setSale = (id: string, patch: Partial<SaleLine>) =>
    update((p) => ({ ...p, saleLines: p.saleLines.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const setRent = (id: string, patch: Partial<RentLine>) =>
    update((p) => ({ ...p, rentLines: p.rentLines.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const noUnits = project.unitTypes.length === 0;
  return (
    <Section
      step="Step 05"
      title="Revenue"
      description="Sell units at settlement, hold them for rent, or both. An exit sale can capitalise held income."
    >
      {noUnits && <EmptyState>Add unit types in Step 02 first.</EmptyState>}

      {!noUnits && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Sales</h3>
              <AddButton onClick={() => update((p) => ({ ...p, saleLines: [...p.saleLines, { id: uid(), unitTypeId: p.unitTypes[0].id, start: 0, span: 1, curve: 'even', escalate: false }] }))}>
                Add sale
              </AddButton>
            </div>
            {project.saleLines.length === 0 ? (
              <EmptyState>No sales yet.</EmptyState>
            ) : (
              <div className="space-y-3">
                {project.saleLines.map((s) => (
                  <Card key={s.id} onRemove={() => update((p) => ({ ...p, saleLines: p.saleLines.filter((x) => x.id !== s.id) }))} removeLabel="Remove sale">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pr-8 items-end">
                      <Field label="Unit type">
                        <Select value={s.unitTypeId} options={utOptions} onChange={(v) => setSale(s.id, { unitTypeId: v })} />
                      </Field>
                      <Field label="First settlement (month)">
                        <NumInput value={s.start} onChange={(v) => setSale(s.id, { start: Math.floor(v) })} />
                      </Field>
                      <Field label="Settlement span (months)">
                        <NumInput value={s.span} placeholder="1" onChange={(v) => setSale(s.id, { span: Math.max(1, Math.floor(v)) })} />
                      </Field>
                      <Field label="Pattern">
                        <Select value={s.curve} options={CURVES} onChange={(v) => setSale(s.id, { curve: v })} />
                      </Field>
                      <div className="pb-2">
                        <Toggle checked={s.escalate} onChange={(v) => setSale(s.id, { escalate: v })} label="Escalate price" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Rental income</h3>
              <AddButton onClick={() => update((p) => ({ ...p, rentLines: [...p.rentLines, { id: uid(), unitTypeId: p.unitTypes[0].id, start: 0, termMonths: 12, vacancyPct: 0, outgoingsPct: 0, escalate: false }] }))}>
                Add rental
              </AddButton>
            </div>
            {project.rentLines.length === 0 ? (
              <EmptyState>No rental income yet.</EmptyState>
            ) : (
              <div className="space-y-3">
                {project.rentLines.map((r) => (
                  <Card key={r.id} onRemove={() => update((p) => ({ ...p, rentLines: p.rentLines.filter((x) => x.id !== r.id) }))} removeLabel="Remove rental">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pr-8 items-end">
                      <Field label="Unit type">
                        <Select value={r.unitTypeId} options={utOptions} onChange={(v) => setRent(r.id, { unitTypeId: v })} />
                      </Field>
                      <Field label="Rent start (month)">
                        <NumInput value={r.start} onChange={(v) => setRent(r.id, { start: Math.floor(v) })} />
                      </Field>
                      <Field label="Term (months)">
                        <NumInput value={r.termMonths} onChange={(v) => setRent(r.id, { termMonths: Math.floor(v) })} />
                      </Field>
                      <Field label="Vacancy">
                        <PctInput value={r.vacancyPct} onChange={(v) => setRent(r.id, { vacancyPct: v })} />
                      </Field>
                      <Field label="Outgoings">
                        <PctInput value={r.outgoingsPct} onChange={(v) => setRent(r.id, { outgoingsPct: v })} />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Toggle checked={r.escalate} onChange={(v) => setRent(r.id, { escalate: v })} label="Annual rent reviews (unit type escalation)" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-3">Exit sale of held income (optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Exit month">
                <NumInput value={project.exit.month} onChange={(v) => update((p) => ({ ...p, exit: { ...p.exit, month: Math.floor(v) } }))} />
              </Field>
              <Field label="Capitalisation rate" hint="Leave blank for no exit sale.">
                <PctInput value={project.exit.capRate} onChange={(v) => update((p) => ({ ...p, exit: { ...p.exit, capRate: v } }))} />
              </Field>
              <Field label="Selling costs">
                <PctInput value={project.exit.sellingCostPct} onChange={(v) => update((p) => ({ ...p, exit: { ...p.exit, sellingCostPct: v } }))} />
              </Field>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------- Escalation
export function EscalationSection({ project, update }: Props) {
  const years = Math.max(1, Math.min(50, Math.ceil(project.horizonMonths / 12)));
  const costKeys = [...new Set(project.costLines.filter((c) => c.escalate).map((c) => c.group))];
  const utIds = new Set([
    ...project.saleLines.filter((s) => s.escalate).map((s) => s.unitTypeId),
    ...project.rentLines.filter((r) => r.escalate).map((r) => r.unitTypeId),
  ]);
  const rows = [
    ...costKeys.map((g) => ({ key: g as string, label: GROUP_LABEL[g] })),
    ...project.unitTypes.filter((u) => utIds.has(u.id)).map((u) => ({ key: u.id, label: `${u.name || 'Unnamed'} (revenue)` })),
  ];
  const setRate = (key: string, i: number, v: number) =>
    update((p) => {
      const row = Array.from({ length: years }, (_, k) => p.escalation[key]?.[k] ?? 0);
      row[i] = v;
      return { ...p, escalation: { ...p.escalation, [key]: row } };
    });
  const setAll = (key: string, v: number) =>
    update((p) => ({ ...p, escalation: { ...p.escalation, [key]: Array.from({ length: years }, () => v) } }));

  return (
    <Section
      step="Step 06"
      title="Escalation"
      description="Annual rates, compounded monthly, for every cost group and unit type that has escalation switched on. Amounts are entered in today's dollars and escalated to the month they are paid or received."
    >
      {rows.length === 0 ? (
        <EmptyState>Switch on Escalate on a cost, sale or rental line and its rate row will appear here.</EmptyState>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.key} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <span className="text-sm font-medium text-white/80">{r.label}</span>
                <div className="flex items-center gap-2 w-40">
                  <PctInput value={0} placeholder="Set all" onChange={(v) => setAll(r.key, v)} />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {Array.from({ length: years }, (_, i) => (
                  <div key={i} className="w-20 shrink-0">
                    <span className="block text-[10px] font-mono text-white/30 mb-1">Yr {i + 1}</span>
                    <PctInput value={project.escalation[r.key]?.[i] ?? 0} onChange={(v) => setRate(r.key, i, v)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------- Finance
export function FinanceSection({ project, update }: Props) {
  const set = (id: string, patch: Partial<Facility>) =>
    update((p) => ({ ...p, facilities: p.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const add = () =>
    update((p) => ({
      ...p,
      facilities: [...p.facilities, { id: uid(), name: '', limit: 0, interestRate: 0, startMonth: 0, establishmentFeePct: 0 }],
    }));
  return (
    <Section
      step="Step 07"
      title="Funding"
      description="Equity funds shortfalls first, then facilities in the order listed. Interest is capitalised monthly. Surpluses repay debt, then return equity."
      action={<AddButton onClick={add}>Add facility</AddButton>}
    >
      <div className="mb-5 max-w-xs">
        <Field label="Equity limit" hint="Leave blank for none; any gap is flagged.">
          <NumInput value={project.equity.limit} onChange={(v) => update((p) => ({ ...p, equity: { limit: v } }))} />
        </Field>
      </div>
      {project.facilities.length === 0 ? (
        <EmptyState>No debt facilities. The project is funded by equity only.</EmptyState>
      ) : (
        <div className="space-y-3">
          {project.facilities.map((f) => (
            <Card key={f.id} onRemove={() => update((p) => ({ ...p, facilities: p.facilities.filter((x) => x.id !== f.id).map((x) => (x.refinancedById === f.id ? { ...x, refinancedById: undefined } : x)) }))} removeLabel="Remove facility">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pr-8">
                <div className="col-span-2 lg:col-span-1">
                  <Field label="Name">
                    <TextInput value={f.name} placeholder="Facility" onChange={(v) => set(f.id, { name: v })} />
                  </Field>
                </div>
                <Field label="Limit">
                  <NumInput value={f.limit} onChange={(v) => set(f.id, { limit: v })} />
                </Field>
                <Field label="Interest (p.a.)">
                  <PctInput value={f.interestRate} onChange={(v) => set(f.id, { interestRate: v })} />
                </Field>
                <Field label="Establishment fee">
                  <PctInput value={f.establishmentFeePct} onChange={(v) => set(f.id, { establishmentFeePct: v })} />
                </Field>
                <Field label="Available from (month)">
                  <NumInput value={f.startMonth} onChange={(v) => set(f.id, { startMonth: Math.floor(v) })} />
                </Field>
                <Field label="Matures (month)" hint="Blank = to end of model">
                  <NumInput value={f.maturityMonth ?? 0} onChange={(v) => set(f.id, { maturityMonth: v > 0 ? Math.floor(v) : undefined })} />
                </Field>
                <div className="col-span-2">
                  <Field label="Refinanced by">
                    <Select
                      value={f.refinancedById ?? ''}
                      placeholder="Repaid at maturity"
                      options={project.facilities.filter((x) => x.id !== f.id).map((x) => ({ value: x.id, label: x.name || 'Unnamed' }))}
                      onChange={(v) => set(f.id, { refinancedById: v || undefined })}
                    />
                  </Field>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
