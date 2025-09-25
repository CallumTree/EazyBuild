
import { useViability } from '../store/viability';

export default function UnitMixEditor() {
  const { unitTypes, updateUnitCount, infraAllowancePct, setInfraAllowancePct, showFootprints, toggleFootprints, footprintScale, setFootprintScale } = useViability();

  return (
    <div className="p-4 bg-neutral-900 text-neutral-100 rounded-2xl space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showFootprints}
            onChange={() => toggleFootprints()}
          />
          Show footprints overlay
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Footprint spacing</span>
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.05}
            value={footprintScale}
            onChange={e => setFootprintScale(parseFloat((e.target as HTMLInputElement).value))}
          />
          <span className="text-sm">{footprintScale.toFixed(2)}×</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Infra allowance</span>
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.01}
            value={infraAllowancePct}
            onChange={e => setInfraAllowancePct(parseFloat((e.target as HTMLInputElement).value))}
          />
          <span className="text-sm">{Math.round(infraAllowancePct*100)}%</span>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left opacity-80">
            <tr>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">GIA (m²)</th>
              <th className="py-2 pr-4">£/m² Build</th>
              <th className="py-2 pr-4">Sale £/Unit</th>
              <th className="py-2 pr-4">Count</th>
            </tr>
          </thead>
          <tbody>
            {unitTypes.map(u => (
              <tr key={u.id} className="border-t border-neutral-800">
                <td className="py-2 pr-4">{u.label}</td>
                <td className="py-2 pr-4">{u.areaM2}</td>
                <td className="py-2 pr-4">£{u.buildCostPerM2}</td>
                <td className="py-2 pr-4">£{u.salePricePerUnit?.toLocaleString() ?? '-'}</td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    min={0}
                    className="w-20 px-2 py-1 rounded bg-neutral-800"
                    value={u.count}
                    onChange={(e) => updateUnitCount(u.id, parseInt((e.target as HTMLInputElement).value || '0', 10))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs opacity-70">Illustrative footprint layout — not a planning drawing.</p>
    </div>
  );
}
