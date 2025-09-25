
import { useViability } from '../store/viability';
import { netDevelopableArea, totalGIA, margins } from '../lib/calc';

export default function TotalsHeader() {
  const { polygonAreaM2, infraAllowancePct, unitTypes } = useViability();
  const netM2 = netDevelopableArea(polygonAreaM2, infraAllowancePct);
  const gia = totalGIA(unitTypes);
  const { build, sales, profit, marginPct } = margins(unitTypes);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-neutral-900 text-neutral-100 rounded-2xl">
      <Stat label="Site Area" value={`${fmt0(polygonAreaM2)} m²`} />
      <Stat label="Net Developable" value={`${fmt0(netM2)} m²`} />
      <Stat label="Total GIA" value={`${fmt0(gia)} m²`} />
      <Stat label="Build Cost" value={`£${fmtMoney(build)}`} />
      <Stat label="GDV / Margin" value={`£${fmtMoney(sales)} • ${(marginPct*100).toFixed(1)}%`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 bg-neutral-800">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function fmt0(n: number) {
  return isFinite(n) ? Math.round(n).toString() : '0';
}

function fmtMoney(n: number) {
  if (!isFinite(n) || n === 0) return '0';
  return n >= 1_000_000 
    ? `${(n/1_000_000).toFixed(2)}m` 
    : n >= 1_000 
    ? `${(n/1_000).toFixed(1)}k` 
    : n.toFixed(0);
}
