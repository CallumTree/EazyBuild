
import { useViability } from '../store/viability';
import { totalSalesValue, totalBuildCost, margins } from '../lib/calc';

export default function TotalsHeader() {
  const { unitTypes, polygonAreaM2 } = useViability();
  const { sales, build, profit, marginPct } = margins(unitTypes);
  
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-4">Site Viability Assessment</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-neutral-400">Site Area</div>
          <div className="text-lg font-semibold">{Math.round(polygonAreaM2).toLocaleString()} m²</div>
        </div>
        <div>
          <div className="text-sm text-neutral-400">Total GDV</div>
          <div className="text-lg font-semibold text-emerald-400">£{sales.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-400">Build Cost</div>
          <div className="text-lg font-semibold text-orange-400">£{build.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-400">Margin</div>
          <div className="text-lg font-semibold text-blue-400">{(marginPct * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
