
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

interface StoreContextType {
  project: Project;
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  scenarios: Scenario[];
  duplicateScenario: () => void;
  houseTypes: HouseType[];
  addHouseType: (houseType: Omit<HouseType, 'id'>) => void;
  addToProjectMix: (houseTypeId: string) => void;
  updateProjectMixCount: (houseTypeId: string, count: number) => void;
  removeFromProjectMix: (houseTypeId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultHouseTypes: HouseType[] = [
  {
    id: 'default-2-bed-semi',
    name: '2-Bed Semi',
    beds: 2,
    floorAreaSqm: 90,
    buildCostPerSqm: 1500,
    saleValuePerSqm: 3000,
    isDefault: true,
  },
  {
    id: 'default-3-bed-semi',
    name: '3-Bed Semi',
    beds: 3,
    floorAreaSqm: 110,
    buildCostPerSqm: 1600,
    saleValuePerSqm: 3200,
    isDefault: true,
  },
  {
    id: 'default-3-bed-detached',
    name: '3-Bed Detached',
    beds: 3,
    floorAreaSqm: 130,
    buildCostPerSqm: 1700,
    saleValuePerSqm: 3400,
    isDefault: true,
  },
  {
    id: 'default-4-bed-detached',
    name: '4-Bed Detached',
    beds: 4,
    floorAreaSqm: 160,
    buildCostPerSqm: 1800,
    saleValuePerSqm: 3600,
    isDefault: true,
  },
];

const defaultProject: Project = {
  id: 'default',
  name: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  efficiency: 65,
  estimatedUnits: 4,
  floorAreaPerUnit: 120,
  gdvPerUnit: 350000,
  buildCostPerSqm: 1650,
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<Project>(defaultProject);
  const [scenarios, setScenariosState] = useState<Scenario[]>([]);
  const [houseTypes, setHouseTypesState] = useState<HouseType[]>(defaultHouseTypes);

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
        // Merge with defaults
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

  const addToProjectMix = (houseTypeId: string) => {
    const currentMix = project.unitMix || [];
    const existing = currentMix.find(mix => mix.houseTypeId === houseTypeId);
    
    if (existing) {
      updateProjectMixCount(houseTypeId, existing.count + 1);
    } else {
      const newMix = [...currentMix, { houseTypeId, count: 1 }];
      updateProject({ unitMix: newMix });
    }
  };

  const updateProjectMixCount = (houseTypeId: string, count: number) => {
    const currentMix = project.unitMix || [];
    const updated = currentMix.map(mix => 
      mix.houseTypeId === houseTypeId ? { ...mix, count } : mix
    );
    updateProject({ unitMix: updated });
  };

  const removeFromProjectMix = (houseTypeId: string) => {
    const currentMix = project.unitMix || [];
    const updated = currentMix.filter(mix => mix.houseTypeId !== houseTypeId);
    updateProject({ unitMix: updated });
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
      addToProjectMix,
      updateProjectMixCount,
      removeFromProjectMix,
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
