import { useEffect, useState, type ReactNode } from 'react';

export const uid = () => Math.random().toString(36).slice(2, 9);

const inputBase =
  'w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder-white/25 ' +
  'focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="block text-[10px] uppercase tracking-widest font-mono font-bold text-white/40 mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-white/30 mt-1">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input className={inputBase} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}

/** Numeric input that shows blank for 0 and keeps partial typing like "0." intact. */
export function NumInput({
  value,
  onChange,
  placeholder = '0',
  allowNegative = false,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  allowNegative?: boolean;
}) {
  const [text, setText] = useState(value ? String(value) : '');
  useEffect(() => {
    if ((parseFloat(text) || 0) !== value) setText(value ? String(value) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
  return (
    <input
      className={`${inputBase} font-mono`}
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const t = e.target.value;
        if (!pattern.test(t)) return;
        setText(t);
        onChange(parseFloat(t) || 0);
      }}
    />
  );
}

/** Percent input: displays 5 for 0.05. */
export function PctInput({
  value,
  onChange,
  placeholder = '0',
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <NumInput
        value={Number((value * 100).toFixed(6))}
        onChange={(n) => onChange(n / 100)}
        placeholder={placeholder}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none">%</span>
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | '';
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      className={`${inputBase} appearance-none cursor-pointer`}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {placeholder && (
        <option value="" className="bg-[#0f0f10]">
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0f0f10]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
    >
      <span
        className={`relative w-8 h-[18px] rounded-full border transition-colors ${
          checked ? 'bg-white border-white' : 'bg-white/5 border-white/15'
        }`}
      >
        <span
          className={`absolute top-[2px] w-3 h-3 rounded-full transition-all ${
            checked ? 'left-[16px] bg-black' : 'left-[2px] bg-white/50'
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export function Section({
  step,
  title,
  description,
  action,
  children,
}: {
  step: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="frosted-glass-card p-6 sm:p-8">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold block mb-1.5">
            {step}
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium tracking-tight text-white">{title}</h2>
          {description && <p className="text-sm text-white/45 mt-1.5 max-w-xl">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-6 text-sm text-white/40 text-center">
      {children}
    </div>
  );
}

export function GhostButton({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer active:scale-95 ${
        danger
          ? 'border-white/10 text-white/40 hover:text-white hover:border-white/30'
          : 'border-white/15 text-white/70 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

export function money(n: number, currency = 'AUD'): string {
  if (!Number.isFinite(n)) return '–';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function pct(n: number | null, digits = 1): string {
  if (n === null || !Number.isFinite(n)) return '–';
  return `${(n * 100).toFixed(digits)}%`;
}
