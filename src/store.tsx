
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface HouseType {
  id: string;
  name: string;
  beds: number;
  floorAreaSqm: number;
  buildCostPerSqm: number;
  saleValuePerSqm: number;
  isDefault?: boolean;
}

export interface UnitMix {
  houseTypeId: string;
  count: number;
}

export interface Boundary {
  lat: number;
  lng: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Survey data
  boundary?: Boundary[];
  siteAreaSqm?: number;
  efficiency?: number;
  infraAllowancePct?: number;
  // Layout data
  unitMix?: UnitMix[];
  // Finance data
  finance?: {
    feesPct: string;
    contPct: string;
    financeRatePct: string;
    financeMonths: string;
    targetProfitPct: string;
    landAcqCosts: string;
  };
}

export interface Scenario {
  id: string;
  name: string;
  project: Project;
  createdAt: string;
}

// Computed values interface
export interface ComputedMetrics {
  netDevelopableAreaSqm: number;
  totalUnits: number;
  totalFloorAreaSqm: number;
  totalBuildCost: number;
  totalGDV: number;
  grossMargin: number;
  grossMarginPct: number;
}

interface StoreContextType {
  project: Project;
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  scenarios: Scenario[];
  duplicateScenario: () => void;
  houseTypes: HouseType[];
  addHouseType: (houseType: Omit<HouseType, 'id'>) => void;
  updateUnitMixCount: (houseTypeId: string, count: number) => void;
  removeFromUnitMix: (houseTypeId: string) => void;
  // Computed metrics
  computedMetrics: ComputedMetrics;
  // Survey actions
  updateBoundary: (boundary: Boundary[]) => void;
  updateSiteArea: (areaSqm: number) => void;
  updateEfficiency: (efficiency: number) => void;
  updateInfraAllowance: (pct: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultHouseTypes: HouseType[] = [
  {
    id: 'default-2-bed-bung',
    name: '2-Bed Bungalow',
    beds: 2,
    floorAreaSqm: 85,
    buildCostPerSqm: 2050,
    saleValuePerSqm: 3176,
    isDefault: true,
  },
  {
    id: 'default-3-bed-bung',
    name: '3-Bed Bungalow',
    beds: 3,
    floorAreaSqm: 110,
    buildCostPerSqm: 2100,
    saleValuePerSqm: 3364,
    isDefault: true,
  },
  {
    id: 'default-2-bed-semi',
    name: '2-Bed Semi',
    beds: 2,
    floorAreaSqm: 75,
    buildCostPerSqm: 2000,
    saleValuePerSqm: 2933,
    isDefault: true,
  },
  {
    id: 'default-3-bed-semi',
    name: '3-Bed Semi',
    beds: 3,
    floorAreaSqm: 90,
    buildCostPerSqm: 2000,
    saleValuePerSqm: 2778,
    isDefault: true,
  },
  {
    id: 'default-3-bed-detached',
    name: '3-Bed Detached',
    beds: 3,
    floorAreaSqm: 93,
    buildCostPerSqm: 2100,
    saleValuePerSqm: 3065,
    isDefault: true,
  },
  {
    id: 'default-4-bed-detached',
    name: '4-Bed Detached',
    beds: 4,
    floorAreaSqm: 120,
    buildCostPerSqm: 2150,
    saleValuePerSqm: 3333,
    isDefault: true,
  },
  {
    id: 'default-5-bed-detached',
    name: '5-Bed Detached',
    beds: 5,
    floorAreaSqm: 160,
    buildCostPerSqm: 2200,
    saleValuePerSqm: 3125,
    isDefault: true,
  },
];

const defaultProject: Project = {
  id: 'default',
  name: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  efficiency: 65,
  infraAllowancePct: 0.25,
  unitMix: [],
  finance: {
    feesPct: '5',
    contPct: '10',
    financeRatePct: '8.5',
    financeMonths: '18',
    targetProfitPct: '20',
    landAcqCosts: '25000',
  },
};

// Utility functions for calculations
function computeMetrics(project: Project, houseTypes: HouseType[]): ComputedMetrics {
  const siteAreaSqm = project.siteAreaSqm || 0;
  const efficiency = (project.efficiency || 65) / 100;
  const infraAllowancePct = project.infraAllowancePct || 0.25;
  
  // Net developable area
  const netDevelopableAreaSqm = siteAreaSqm * (1 - infraAllowancePct);
  
  // Unit mix calculations
  const unitMix = project.unitMix || [];
  const totalUnits = unitMix.reduce((sum, mix) => sum + mix.count, 0);
  
  let totalFloorAreaSqm = 0;
  let totalBuildCost = 0;
  let totalGDV = 0;
  
  unitMix.forEach(mix => {
    const houseType = houseTypes.find(ht => ht.id === mix.houseTypeId);
    if (houseType) {
      totalFloorAreaSqm += houseType.floorAreaSqm * mix.count;
      totalBuildCost += (houseType.floorAreaSqm * houseType.buildCostPerSqm) * mix.count;
      totalGDV += (houseType.floorAreaSqm * houseType.saleValuePerSqm) * mix.count;
    }
  });
  
  const grossMargin = totalGDV - totalBuildCost;
  const grossMarginPct = totalGDV > 0 ? (grossMargin / totalGDV) * 100 : 0;
  
  return {
    netDevelopableAreaSqm,
    totalUnits,
    totalFloorAreaSqm,
    totalBuildCost,
    totalGDV,
    grossMargin,
    grossMarginPct,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<Project>(defaultProject);
  const [scenarios, setScenariosState] = useState<Scenario[]>([]);
  const [houseTypes, setHouseTypesState] = useState<HouseType[]>(defaultHouseTypes);

  // Computed metrics
  const computedMetrics = computeMetrics(project, houseTypes);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('landsnap.project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjectState({ ...defaultProject, ...parsed });
      } catch (e) {
        console.warn('Failed to load project from localStorage');
        setProjectState(defaultProject);
      }
    }

    const savedScenarios = localStorage.getItem('landsnap.scenarios');
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios);
        setScenariosState(parsed);
      } catch (e) {
        console.warn('Failed to load scenarios from localStorage');
      }
    }

    const savedHouseTypes = localStorage.getItem('landsnap.houseTypes');
    if (savedHouseTypes) {
      try {
        const parsed = JSON.parse(savedHouseTypes);
        const userTypes = parsed.filter((ht: HouseType) => !ht.isDefault);
        setHouseTypesState([...defaultHouseTypes, ...userTypes]);
      } catch (e) {
        console.warn('Failed to load house types from localStorage');
      }
    }
  }, []);

  const setProject = (newProject: Project) => {
    const updated = { ...newProject, updatedAt: new Date().toISOString() };
    setProjectState(updated);
    localStorage.setItem('landsnap.project', JSON.stringify(updated));
  };

  const updateProject = (updates: Partial<Project>) => {
    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setProjectState(updated);
    localStorage.setItem('landsnap.project', JSON.stringify(updated));
  };

  const duplicateScenario = () => {
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name: `${project.name} - Copy`,
      project: { ...project, id: crypto.randomUUID() },
      createdAt: new Date().toISOString(),
    };
    const updatedScenarios = [...scenarios, newScenario];
    setScenariosState(updatedScenarios);
    localStorage.setItem('landsnap.scenarios', JSON.stringify(updatedScenarios));
  };

  const addHouseType = (houseType: Omit<HouseType, 'id'>) => {
    const newHouseType = { ...houseType, id: crypto.randomUUID() };
    const updated = [...houseTypes, newHouseType];
    setHouseTypesState(updated);
    const userTypes = updated.filter(ht => !ht.isDefault);
    localStorage.setItem('landsnap.houseTypes', JSON.stringify(userTypes));
  };

  const updateUnitMixCount = (houseTypeId: string, count: number) => {
    const currentMix = project.unitMix || [];
    
    if (count === 0) {
      // Remove from mix if count is 0
      const updated = currentMix.filter(mix => mix.houseTypeId !== houseTypeId);
      updateProject({ unitMix: updated });
    } else {
      // Update or add to mix
      const existing = currentMix.find(mix => mix.houseTypeId === houseTypeId);
      if (existing) {
        const updated = currentMix.map(mix => 
          mix.houseTypeId === houseTypeId ? { ...mix, count } : mix
        );
        updateProject({ unitMix: updated });
      } else {
        const updated = [...currentMix, { houseTypeId, count }];
        updateProject({ unitMix: updated });
      }
    }
  };

  const removeFromUnitMix = (houseTypeId: string) => {
    updateUnitMixCount(houseTypeId, 0);
  };

  // Survey-specific actions
  const updateBoundary = (boundary: Boundary[]) => {
    updateProject({ boundary });
  };

  const updateSiteArea = (areaSqm: number) => {
    updateProject({ siteAreaSqm: areaSqm });
  };

  const updateEfficiency = (efficiency: number) => {
    updateProject({ efficiency });
  };

  const updateInfraAllowance = (pct: number) => {
    updateProject({ infraAllowancePct: pct });
  };

  return (
    <StoreContext.Provider value={{
      project,
      setProject,
      updateProject,
      scenarios,
      duplicateScenario,
      houseTypes,
      addHouseType,
      updateUnitMixCount,
      removeFromUnitMix,
      computedMetrics,
      updateBoundary,
      updateSiteArea,
      updateEfficiency,
      updateInfraAllowance,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
