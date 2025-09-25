
import { useViability } from '../store/viability';

export default function SiteAreaBadge() {
  const { polygonAreaM2 } = useViability();

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3">
      <div className="text-sm text-neutral-400 mb-1">Site Area</div>
      <div className="text-xl font-semibold text-white">
        {Math.round(polygonAreaM2).toLocaleString()} m²
      </div>
    </div>
  );
}
