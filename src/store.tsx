import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface HouseType {
  id: string;
  name: string;
  beds?: number; // Optional as bungalows might not have beds in the same sense
  floorAreaSqm: number;
  buildCostPerSqm: number;
  saleValuePerSqm: number;
  floors?: number; // Added for clarity, especially for bungalows
  category?: 'house' | 'bungalow'; // Added category
  isDefault?: boolean;
  isCustom?: boolean; // To distinguish between default and user-added
}

export interface UnitMix {
  houseTypeId: string;
  count: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  boundary?: Array<{ lat: number; lng: number }>;
  siteArea?: number;
  efficiency?: number;
  estimatedUnits?: number;
  floorAreaPerUnit?: number;
  gdvPerUnit?: number;
  buildCostPerSqm?: number;
  unitMix?: UnitMix[];
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

// Default scenario definition (assuming it exists elsewhere or needs to be defined)
// For the purpose of this example, let's define a minimal defaultScenario
const defaultScenario: Scenario = {
  id: 'default-scenario',
  name: 'Default Scenario',
  project: {
    id: 'default-project',
    name: 'New Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unitMix: [],
    finance: {
      feesPct: '0',
      contPct: '0',
      financeRatePct: '0',
      financeMonths: '0',
      targetProfitPct: '0',
      landAcqCosts: '0',
    },
  },
  createdAt: new Date().toISOString(),
};

const defaultHouseTypes: HouseType[] = [
  {
    id: '2bed-semi',
    name: '2-Bed Semi',
    floorAreaSqm: 75,
    buildCostPerSqm: 2000,
    saleValuePerSqm: 2933, // £220k / 75m²
    floors: 2,
    isDefault: true,
  },
  {
    id: '3bed-semi',
    name: '3-Bed Semi',
    floorAreaSqm: 90,
    buildCostPerSqm: 2000,
    saleValuePerSqm: 2778, // £250k / 90m²
    floors: 2,
    isDefault: true,
  },
  {
    id: '3bed-det',
    name: '3-Bed Detached',
    floorAreaSqm: 93,
    buildCostPerSqm: 2100,
    saleValuePerSqm: 3065, // £285k / 93m²
    floors: 2,
    isDefault: true,
  },
  {
    id: '4bed-det',
    name: '4-Bed Detached',
    floorAreaSqm: 120,
    buildCostPerSqm: 2150,
    saleValuePerSqm: 3333, // £400k / 120m²
    floors: 2,
    isDefault: true,
  },
  {
    id: '2bed-bung',
    name: '2-Bed Bungalow',
    floorAreaSqm: 85,
    buildCostPerSqm: 2050,
    saleValuePerSqm: 3176, // £270k / 85m²
    floors: 1,
    category: 'bungalow' as const,
    isDefault: true,
  },
  {
    id: '3bed-bung',
    name: '3-Bed Bungalow',
    floorAreaSqm: 110,
    buildCostPerSqm: 2100,
    saleValuePerSqm: 3364, // £370k / 110m²
    floors: 1,
    category: 'bungalow' as const,
    isDefault: true,
  },
];

const defaultProject: Project = {
  id: 'default',
  name: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  siteArea: 0,
  efficiency: 0,
  estimatedUnits: 0,
  floorAreaPerUnit: 0,
  gdvPerUnit: 0,
  buildCostPerSqm: 0,
  unitMix: [],
  finance: {
    feesPct: '0',
    contPct: '0',
    financeRatePct: '0',
    financeMonths: '0',
    targetProfitPct: '0',
    landAcqCosts: '0',
  },
};

interface StoreContextType {
  project: Project;
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  scenarios: Scenario[];
  duplicateScenario: () => void;
  houseTypes: HouseType[];
  addCustomHouseType: (houseType: Omit<HouseType, 'id'>) => void;
  updateUnitMix: (unitMix: UnitMix[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<Project>(() => {
    const saved = localStorage.getItem('landsnap.project');
    if (saved) {
      try {
        return { ...defaultProject, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to load project from localStorage');
      }
    }
    return defaultProject;
  });

  const [scenarios, setScenariosState] = useState<Scenario[]>(() => {
    const savedScenarios = localStorage.getItem('landsnap.scenarios');
    if (savedScenarios) {
      try {
        return JSON.parse(savedScenarios);
      } catch (e) {
        console.warn('Failed to load scenarios from localStorage');
      }
    }
    return [defaultScenario];
  });

  const [houseTypes, setHouseTypesState] = useState<HouseType[]>(() => {
    const savedHouseTypes = localStorage.getItem('landsnap.houseTypes');
    if (savedHouseTypes) {
      try {
        const parsed = JSON.parse(savedHouseTypes);
        // Ensure default house types are always present and merged correctly
        const userTypes = parsed.filter((ht: HouseType) => !ht.isDefault && !ht.isCustom);
        return [...defaultHouseTypes, ...userTypes];
      } catch (e) {
        console.warn('Failed to load house types from localStorage');
      }
    }
    return defaultHouseTypes;
  });

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

  const addCustomHouseType = (houseType: Omit<HouseType, 'id'>) => {
    const newHouseType: HouseType = {
      ...houseType,
      id: crypto.randomUUID(),
      isCustom: true, // Mark as custom
    };
    const updatedHouseTypes = [...houseTypes, newHouseType];
    setHouseTypesState(updatedHouseTypes);
    // Only save custom/non-default types to localStorage
    const userTypesToSave = updatedHouseTypes.filter(ht => !ht.isDefault);
    localStorage.setItem('landsnap.houseTypes', JSON.stringify(userTypesToSave));
    return newHouseType;
  };

  const updateUnitMix = (unitMix: UnitMix[]) => {
    updateProject({ unitMix });
  };

  return (
    <StoreContext.Provider value={{
      project,
      setProject,
      updateProject,
      scenarios,
      duplicateScenario,
      houseTypes,
      addCustomHouseType,
      updateUnitMix,
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