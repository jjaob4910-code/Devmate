import { useMemo, useState } from 'react';
import { money } from './ui';

interface Props {
  net: number[];
  currency: string;
}

const W = 640;
const H = 220;
const PAD = { l: 8, r: 8, t: 14, b: 22 };

/** Monthly net cash flow (bars) with the cumulative position (dashed line). */
export default function Chart({ net, currency }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const cum = useMemo(() => {
    let c = 0;
    return net.map((v) => (c += v));
  }, [net]);

  const n = net.length;
  const maxAbs = Math.max(1, ...net.map(Math.abs), ...cum.map(Math.abs));
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const y0 = PAD.t + plotH / 2;
  const sy = (v: number) => y0 - (v / maxAbs) * (plotH / 2);
  const step = plotW / n;
  const barW = Math.max(1, Math.min(14, step - (step > 4 ? 2 : 0)));
  const x = (i: number) => PAD.l + step * i + step / 2;

  const hasData = net.some((v) => v !== 0);

  const years = useMemo(() => {
    const rows: { year: number; net: number; cum: number }[] = [];
    for (let y = 0; y * 12 < n; y++) {
      const slice = net.slice(y * 12, y * 12 + 12);
      rows.push({ year: y + 1, net: slice.reduce((a, b) => a + b, 0), cum: cum[Math.min(n - 1, y * 12 + 11)] });
    }
    return rows;
  }, [net, cum, n]);

  if (!hasData) {
    return (
      <div className="h-[220px] rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-sm text-white/30 text-center px-6">
        The cash flow appears here as you add land, costs and revenue.
      </div>
    );
  }

  const line = cum.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4 text-[11px] text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-white/80" /> Net cash flow, per month
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden>
              <line x1="0" y1="3" x2="18" y2="3" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            Cumulative
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="text-[11px] text-white/40 hover:text-white underline underline-offset-4 cursor-pointer"
        >
          {asTable ? 'View chart' : 'View as table'}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-[220px] overflow-auto rounded-xl border border-white/10">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 bg-[#0f0f10] text-white/40">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Year</th>
                <th className="text-right px-3 py-2 font-medium">Net</th>
                <th className="text-right px-3 py-2 font-medium">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {years.map((r) => (
                <tr key={r.year} className="border-t border-white/5 text-white/70">
                  <td className="px-3 py-1.5">{r.year}</td>
                  <td className="px-3 py-1.5 text-right">{money(r.net, currency)}</td>
                  <td className="px-3 py-1.5 text-right">{money(r.cum, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label="Monthly net cash flow and cumulative position"
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const px = ((e.clientX - r.left) / r.width) * W;
              setHover(Math.max(0, Math.min(n - 1, Math.floor((px - PAD.l) / step))));
            }}
          >
            <line x1={PAD.l} x2={W - PAD.r} y1={y0} y2={y0} stroke="white" strokeOpacity="0.12" />
            {net.map((v, i) => {
              if (v === 0) return null;
              const top = Math.min(sy(v), y0);
              const h = Math.abs(sy(v) - y0);
              return (
                <rect
                  key={i}
                  x={x(i) - barW / 2}
                  y={top}
                  width={barW}
                  height={Math.max(h, 0.5)}
                  rx={Math.min(3, barW / 2)}
                  fill="white"
                  fillOpacity={hover === i ? 1 : v > 0 ? 0.8 : 0.35}
                />
              );
            })}
            <path d={line} fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="4 3" />
            {hover !== null && (
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="white" strokeOpacity="0.25" />
            )}
            <text x={PAD.l} y={H - 6} fontSize="10" fill="white" fillOpacity="0.35" fontFamily="JetBrains Mono, monospace">
              Month 0
            </text>
            <text x={W - PAD.r} y={H - 6} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.35" fontFamily="JetBrains Mono, monospace">
              Month {n - 1}
            </text>
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute top-1 rounded-lg border border-white/10 bg-[#0f0f10]/95 px-3 py-2 text-[11px] font-mono text-white/80 shadow-xl"
              style={{ left: `${Math.min(70, Math.max(0, (x(hover) / W) * 100 - 10))}%` }}
            >
              <div className="text-white/40 mb-1">Month {hover}</div>
              <div>Net {money(net[hover], currency)}</div>
              <div>Cumulative {money(cum[hover], currency)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
