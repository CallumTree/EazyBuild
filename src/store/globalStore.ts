
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import * as turf from '@turf/turf';

// Zod schemas
export const HouseTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  beds: z.number().min(1),
  giaSqft: z.number().min(1),
  buildCostPerSqft: z.number().min(0),
  salePricePerSqft: z.number().min(0),
  isDefault: z.boolean().default(false),
});

export const UnitMixSchema = z.object({
  houseTypeId: z.string(),
  count: z.number().min(0),
});

export const CompSchema = z.object({
  id: z.string(),
  address: z.string().min(1),
  postcode: z.string(),
  beds: z.number().min(1),
  propertyType: z.enum(['detached', 'semi', 'terraced', 'flat', 'bungalow', 'other']),
  date: z.string(),
  priceGBP: z.number().min(1),
  giaSqft: z.number().min(1),
  pricePerSqft: z.number(),
  notes: z.string().optional(),
});

export const ProjectSchema = z.object({
  meta: z.object({
    id: z.string(),
    name: z.string().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  survey: z.object({
    polygonGeoJSON: z.any().optional(),
    boundary: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
    })).optional(),
    siteAreaM2: z.number().default(0),
    efficiency: z.number().min(0).max(100).default(65),
  }),
  layout: z.object({
    unitMix: z.array(UnitMixSchema).default([]),
    houseTypes: z.array(HouseTypeSchema).default([]),
  }),
  finance: z.object({
    feesPct: z.number().min(0).default(5),
    contPct: z.number().min(0).default(10),
    targetProfitPct: z.number().min(0).default(20),
    landAcqCosts: z.number().min(0).default(25000),
    financeRatePct: z.number().min(0).default(8.5),
    financeMonths: z.number().min(1).default(18),
  }),
  market: z.object({
    comps: z.array(CompSchema).default([]),
    derivedPricePerSqft: z.number().optional(),
    useMarketPricing: z.boolean().default(false),
  }),
});

export type Project = z.infer<typeof ProjectSchema>;
export type HouseType = z.infer<typeof HouseTypeSchema>;
export type UnitMix = z.infer<typeof UnitMixSchema>;
export type Comp = z.infer<typeof CompSchema>;

export interface ComputedTotals {
  gdv: number;
  buildCost: number;
  fees: number;
  contingency: number;
  financeBase: number;
  financeCost: number;
  targetProfit: number;
  totalCosts: number;
  residual: number;
  profitPct: number;
  costToGdvPct: number;
  isViable: boolean;
  viabilityStatus: 'viable' | 'at-risk' | 'unviable';
}

// Default house types
const defaultHouseTypes: HouseType[] = [
  {
    id: 'default-2-bed-semi',
    name: '2-Bed Semi',
    beds: 2,
    giaSqft: 970,
    buildCostPerSqft: 140,
    salePricePerSqft: 280,
    isDefault: true,
  },
  {
    id: 'default-3-bed-semi',
    name: '3-Bed Semi',
    beds: 3,
    giaSqft: 1184,
    buildCostPerSqft: 150,
    salePricePerSqft: 300,
    isDefault: true,
  },
  {
    id: 'default-3-bed-detached',
    name: '3-Bed Detached',
    beds: 3,
    giaSqft: 1400,
    buildCostPerSqft: 160,
    salePricePerSqft: 320,
    isDefault: true,
  },
  {
    id: 'default-4-bed-detached',
    name: '4-Bed Detached',
    beds: 4,
    giaSqft: 1720,
    buildCostPerSqft: 170,
    salePricePerSqft: 340,
    isDefault: true,
  },
];

// Compute totals function
export function computeTotals(project: Project): ComputedTotals {
  const { layout, finance, market } = project;
  
  let gdv = 0;
  let buildCost = 0;

  // Calculate GDV and build costs from unit mix
  layout.unitMix.forEach(({ houseTypeId, count }) => {
    const houseType = layout.houseTypes.find(ht => ht.id === houseTypeId);
    if (!houseType || count === 0) return;

    const pricePerSqft = market.useMarketPricing && market.derivedPricePerSqft 
      ? market.derivedPricePerSqft 
      : houseType.salePricePerSqft;

    const unitGdv = houseType.giaSqft * pricePerSqft;
    const unitBuildCost = houseType.giaSqft * houseType.buildCostPerSqft;

    gdv += unitGdv * count;
    buildCost += unitBuildCost * count;
  });

  const fees = buildCost * (finance.feesPct / 100);
  const contingency = buildCost * (finance.contPct / 100);
  const financeBase = buildCost + fees + contingency + finance.landAcqCosts;
  const financeCost = financeBase * (finance.financeRatePct / 100) * (finance.financeMonths / 12) * 0.5;
  const targetProfit = gdv * (finance.targetProfitPct / 100);
  const totalCosts = buildCost + fees + contingency + financeCost + finance.landAcqCosts;
  const residual = gdv - totalCosts - targetProfit;
  const actualProfit = gdv - totalCosts;
  const profitPct = gdv > 0 ? (actualProfit / gdv) * 100 : 0;
  const costToGdvPct = gdv > 0 ? (totalCosts / gdv) * 100 : 0;

  const isViable = residual >= 0 && profitPct >= finance.targetProfitPct;
  
  let viabilityStatus: 'viable' | 'at-risk' | 'unviable' = 'unviable';
  if (residual >= 0 && profitPct >= finance.targetProfitPct) {
    viabilityStatus = 'viable';
  } else if (residual >= 0 && profitPct >= (finance.targetProfitPct - 10)) {
    viabilityStatus = 'at-risk';
  }

  return {
    gdv,
    buildCost,
    fees,
    contingency,
    financeBase,
    financeCost,
    targetProfit,
    totalCosts,
    residual,
    profitPct,
    costToGdvPct,
    isViable,
    viabilityStatus,
  };
}

interface GlobalStore {
  project: Project;
  computedTotals: ComputedTotals;
  
  // Actions
  updateProjectMeta: (meta: Partial<Project['meta']>) => void;
  updateSurvey: (survey: Partial<Project['survey']>) => void;
  updateLayout: (layout: Partial<Project['layout']>) => void;
  updateFinance: (finance: Partial<Project['finance']>) => void;
  updateMarket: (market: Partial<Project['market']>) => void;
  
  // Boundary specific
  updateBoundary: (boundary: Array<{ lat: number; lng: number }>) => void;
  updateSiteArea: (areaM2: number) => void;
  
  // House types
  addHouseType: (houseType: Omit<HouseType, 'id'>) => void;
  updateHouseType: (id: string, updates: Partial<HouseType>) => void;
  deleteHouseType: (id: string) => void;
  
  // Unit mix
  addToUnitMix: (houseTypeId: string, count?: number) => void;
  updateUnitMixCount: (houseTypeId: string, count: number) => void;
  removeFromUnitMix: (houseTypeId: string) => void;
  
  // Comps
  addComp: (comp: Omit<Comp, 'id' | 'pricePerSqft'>) => void;
  updateComp: (id: string, updates: Partial<Comp>) => void;
  deleteComp: (id: string) => void;
  
  // Internal
  recomputeTotals: () => void;
  resetProject: () => void;
}

const createDefaultProject = (): Project => ({
  meta: {
    id: crypto.randomUUID(),
    name: 'New Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  survey: {
    siteAreaM2: 0,
    efficiency: 65,
  },
  layout: {
    unitMix: [],
    houseTypes: [...defaultHouseTypes],
  },
  finance: {
    feesPct: 5,
    contPct: 10,
    targetProfitPct: 20,
    landAcqCosts: 25000,
    financeRatePct: 8.5,
    financeMonths: 18,
  },
  market: {
    comps: [],
    useMarketPricing: false,
  },
});

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => {
      let recomputeTimer: NodeJS.Timeout | null = null;
      
      const debouncedRecompute = () => {
        if (recomputeTimer) clearTimeout(recomputeTimer);
        recomputeTimer = setTimeout(() => {
          const { project } = get();
          const computedTotals = computeTotals(project);
          set({ computedTotals });
        }, 200);
      };

      const updateAndRecompute = (updater: (state: GlobalStore) => GlobalStore) => {
        set((state) => {
          const newState = updater(state);
          newState.project.meta.updatedAt = new Date().toISOString();
          return newState;
        });
        debouncedRecompute();
      };

      const initialProject = createDefaultProject();
      const initialTotals = computeTotals(initialProject);

      return {
        project: initialProject,
        computedTotals: initialTotals,

        updateProjectMeta: (meta) => updateAndRecompute((state) => ({
          ...state,
          project: { ...state.project, meta: { ...state.project.meta, ...meta } }
        })),

        updateSurvey: (survey) => updateAndRecompute((state) => ({
          ...state,
          project: { ...state.project, survey: { ...state.project.survey, ...survey } }
        })),

        updateLayout: (layout) => updateAndRecompute((state) => ({
          ...state,
          project: { ...state.project, layout: { ...state.project.layout, ...layout } }
        })),

        updateFinance: (finance) => updateAndRecompute((state) => ({
          ...state,
          project: { ...state.project, finance: { ...state.project.finance, ...finance } }
        })),

        updateMarket: (market) => updateAndRecompute((state) => ({
          ...state,
          project: { ...state.project, market: { ...state.project.market, ...market } }
        })),

        updateBoundary: (boundary) => {
          let siteAreaM2 = 0;
          if (boundary.length >= 3) {
            try {
              const coords = boundary.map(p => [p.lng, p.lat]);
              coords.push(coords[0]); // Close polygon
              const polygon = turf.polygon([coords]);
              siteAreaM2 = turf.area(polygon);
            } catch (error) {
              console.error('Error calculating area:', error);
            }
          }
          
          updateAndRecompute((state) => ({
            ...state,
            project: {
              ...state.project,
              survey: { ...state.project.survey, boundary, siteAreaM2 }
            }
          }));
        },

        updateSiteArea: (areaM2) => updateAndRecompute((state) => ({
          ...state,
          project: { ...state.project, survey: { ...state.project.survey, siteAreaM2: areaM2 } }
        })),

        addHouseType: (houseTypeData) => updateAndRecompute((state) => {
          const newHouseType: HouseType = { ...houseTypeData, id: crypto.randomUUID() };
          return {
            ...state,
            project: {
              ...state.project,
              layout: {
                ...state.project.layout,
                houseTypes: [...state.project.layout.houseTypes, newHouseType]
              }
            }
          };
        }),

        updateHouseType: (id, updates) => updateAndRecompute((state) => ({
          ...state,
          project: {
            ...state.project,
            layout: {
              ...state.project.layout,
              houseTypes: state.project.layout.houseTypes.map(ht =>
                ht.id === id ? { ...ht, ...updates } : ht
              )
            }
          }
        })),

        deleteHouseType: (id) => updateAndRecompute((state) => ({
          ...state,
          project: {
            ...state.project,
            layout: {
              ...state.project.layout,
              houseTypes: state.project.layout.houseTypes.filter(ht => ht.id !== id),
              unitMix: state.project.layout.unitMix.filter(um => um.houseTypeId !== id)
            }
          }
        })),

        addToUnitMix: (houseTypeId, count = 1) => updateAndRecompute((state) => {
          const existing = state.project.layout.unitMix.find(um => um.houseTypeId === houseTypeId);
          if (existing) {
            return {
              ...state,
              project: {
                ...state.project,
                layout: {
                  ...state.project.layout,
                  unitMix: state.project.layout.unitMix.map(um =>
                    um.houseTypeId === houseTypeId ? { ...um, count: um.count + count } : um
                  )
                }
              }
            };
          } else {
            return {
              ...state,
              project: {
                ...state.project,
                layout: {
                  ...state.project.layout,
                  unitMix: [...state.project.layout.unitMix, { houseTypeId, count }]
                }
              }
            };
          }
        }),

        updateUnitMixCount: (houseTypeId, count) => updateAndRecompute((state) => ({
          ...state,
          project: {
            ...state.project,
            layout: {
              ...state.project.layout,
              unitMix: count === 0
                ? state.project.layout.unitMix.filter(um => um.houseTypeId !== houseTypeId)
                : state.project.layout.unitMix.some(um => um.houseTypeId === houseTypeId)
                  ? state.project.layout.unitMix.map(um =>
                      um.houseTypeId === houseTypeId ? { ...um, count } : um
                    )
                  : [...state.project.layout.unitMix, { houseTypeId, count }]
            }
          }
        })),

        removeFromUnitMix: (houseTypeId) => updateAndRecompute((state) => ({
          ...state,
          project: {
            ...state.project,
            layout: {
              ...state.project.layout,
              unitMix: state.project.layout.unitMix.filter(um => um.houseTypeId !== houseTypeId)
            }
          }
        })),

        addComp: (compData) => updateAndRecompute((state) => {
          const newComp: Comp = {
            ...compData,
            id: crypto.randomUUID(),
            pricePerSqft: Math.round(compData.priceGBP / compData.giaSqft)
          };
          
          const newComps = [...state.project.market.comps, newComp];
          const avgPricePerSqft = newComps.reduce((sum, comp) => sum + comp.pricePerSqft, 0) / newComps.length;
          
          return {
            ...state,
            project: {
              ...state.project,
              market: {
                ...state.project.market,
                comps: newComps,
                derivedPricePerSqft: Math.round(avgPricePerSqft)
              }
            }
          };
        }),

        updateComp: (id, updates) => updateAndRecompute((state) => {
          const updatedComps = state.project.market.comps.map(comp => {
            if (comp.id === id) {
              const updated = { ...comp, ...updates };
              if (updates.priceGBP !== undefined || updates.giaSqft !== undefined) {
                updated.pricePerSqft = Math.round(updated.priceGBP / updated.giaSqft);
              }
              return updated;
            }
            return comp;
          });
          
          const avgPricePerSqft = updatedComps.length > 0
            ? updatedComps.reduce((sum, comp) => sum + comp.pricePerSqft, 0) / updatedComps.length
            : undefined;
          
          return {
            ...state,
            project: {
              ...state.project,
              market: {
                ...state.project.market,
                comps: updatedComps,
                derivedPricePerSqft: avgPricePerSqft ? Math.round(avgPricePerSqft) : undefined
              }
            }
          };
        }),

        deleteComp: (id) => updateAndRecompute((state) => {
          const filteredComps = state.project.market.comps.filter(comp => comp.id !== id);
          const avgPricePerSqft = filteredComps.length > 0
            ? filteredComps.reduce((sum, comp) => sum + comp.pricePerSqft, 0) / filteredComps.length
            : undefined;
          
          return {
            ...state,
            project: {
              ...state.project,
              market: {
                ...state.project.market,
                comps: filteredComps,
                derivedPricePerSqft: avgPricePerSqft ? Math.round(avgPricePerSqft) : undefined
              }
            }
          };
        }),

        recomputeTotals: () => {
          const { project } = get();
          const computedTotals = computeTotals(project);
          set({ computedTotals });
        },

        resetProject: () => {
          const newProject = createDefaultProject();
          const computedTotals = computeTotals(newProject);
          set({ project: newProject, computedTotals });
        },
      };
    },
    {
      name: 'landsnap-global-store',
      version: 1,
    }
  )
);
