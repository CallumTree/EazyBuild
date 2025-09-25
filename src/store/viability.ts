
import { create } from 'zustand';

export type UnitType = {
  id: string;
  label: string;
  areaM2: number;           // GIA per unit
  buildCostPerM2: number;   // £/m²
  salePricePerUnit?: number;
  salePricePerM2?: number;
  count: number;
  floors: number;           // 1 for bungalow, 2 for houses
};

export type LatLngLiteral = { lat: number; lng: number };

type State = {
  polygonAreaM2: number;
  polygonCoords: LatLngLiteral[];
  infraAllowancePct: number; // 0.25 = 25%
  unitTypes: UnitType[];
  showFootprints: boolean;
  footprintScale: number;    // 1.0 default spacing
};

type Actions = {
  setPolygonArea: (m2: number) => void;
  setPolygon: (pts: LatLngLiteral[]) => void;
  setInfraAllowancePct: (pct: number) => void;
  setUnitTypes: (u: UnitType[]) => void;
  updateUnitCount: (id: string, count: number) => void;
  toggleFootprints: (on?: boolean) => void;
  setFootprintScale: (s: number) => void;
};

const defaults: UnitType[] = [
  {
    id: '2bed-semi',
    label: '2-Bed Semi',
    areaM2: 75,
    buildCostPerM2: 2000,
    salePricePerUnit: 220_000,
    count: 0,
    floors: 2
  },
  {
    id: '3bed-semi',
    label: '3-Bed Semi',
    areaM2: 90,
    buildCostPerM2: 2000,
    salePricePerUnit: 250_000,
    count: 0,
    floors: 2
  },
  {
    id: '3bed-det',
    label: '3-Bed Detached',
    areaM2: 93,
    buildCostPerM2: 2100,
    salePricePerUnit: 285_000,
    count: 0,
    floors: 2
  },
  {
    id: '4bed-det',
    label: '4-Bed Detached',
    areaM2: 120,
    buildCostPerM2: 2150,
    salePricePerUnit: 400_000,
    count: 0,
    floors: 2
  },
  {
    id: '2bed-bung',
    label: '2-Bed Bungalow',
    areaM2: 85,
    buildCostPerM2: 2050,
    salePricePerUnit: 270_000,
    count: 0,
    floors: 1
  },
  {
    id: '3bed-bung',
    label: '3-Bed Bungalow',
    areaM2: 110,
    buildCostPerM2: 2100,
    salePricePerUnit: 370_000,
    count: 0,
    floors: 1
  },
];

export const useViability = create<State & Actions>((set) => ({
  polygonAreaM2: 0,
  polygonCoords: [],
  infraAllowancePct: 0.25,
  unitTypes: defaults,
  showFootprints: true,
  footprintScale: 1.0,

  setPolygonArea: (m2) => set({ polygonAreaM2: Math.max(0, m2) }),
  setPolygon: (pts) => set({ polygonCoords: pts }),
  setInfraAllowancePct: (pct) => set({ infraAllowancePct: Math.max(0, Math.min(0.9, pct)) }),
  setUnitTypes: (u) => set({ unitTypes: u }),
  updateUnitCount: (id, count) => set((s) => ({
    unitTypes: s.unitTypes.map(x => x.id === id ? { ...x, count: Math.max(0, Math.round(count)) } : x)
  })),
  toggleFootprints: (on) => set((s) => ({ showFootprints: on ?? !s.showFootprints })),
  setFootprintScale: (s) => set({ footprintScale: Math.max(0.6, Math.min(1.6, s)) }),
}));
