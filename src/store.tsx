import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the structure for a house type within the unit mix
export interface ProjectUnitMix {
  id: string; // Unique identifier for the unit type in this project
  name: string; // e.g., "2-bed semi", "4-bed detached"
  beds: number;
  footprintM2: number;
  buildCostPerSqm: number;
  salesValuePerSqm: number;
  count: number; // Number of units of this type
  // Add other relevant properties like GDV, Build Cost, Fees, etc. as needed for calculations per unit type
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  boundary?: Array<{ lat: number; lng: number }>;
  siteArea?: number; // in square meters
  efficiency?: number; // percentage
  houseType?: 'detached' | 'semi-detached' | 'terraced' | 'apartment';
  estimatedUnits?: number;
  floorAreaPerUnit?: number; // in sqm
  gdvPerUnit?: number; // in GBP
  buildCostPerSqm?: number;
  unitMix?: ProjectUnitMix[]; // Array to hold different house types and their counts
  finance?: {
    feesPct: number;
    contPct: number;
    financeRatePct: number;
    financeMonths: number;
    targetProfitPct: number;
    landAcqCosts: number;
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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
  unitMix: [ // Default house types
    { id: 'default-2-bed-semi', name: '2-Bed Semi', beds: 2, footprintM2: 90, buildCostPerSqm: 1500, salesValuePerSqm: 3000, count: 1 },
    { id: 'default-3-bed-semi', name: '3-Bed Semi', beds: 3, footprintM2: 110, buildCostPerSqm: 1600, salesValuePerSqm: 3200, count: 1 },
    { id: 'default-3-bed-detached', name: '3-Bed Detached', beds: 3, footprintM2: 130, buildCostPerSqm: 1700, salesValuePerSqm: 3400, count: 1 },
    { id: 'default-4-bed-detached', name: '4-Bed Detached', beds: 4, footprintM2: 160, buildCostPerSqm: 1800, salesValuePerSqm: 3600, count: 1 },
  ],
  finance: {
    feesPct: 5,
    contPct: 10,
    financeRatePct: 8.5,
    financeMonths: 18,
    targetProfitPct: 20,
    landAcqCosts: 25000,
  },
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<Project>(defaultProject);
  const [scenarios, setScenariosState] = useState<Scenario[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('landsnap.project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default unit mix is present if not saved, or merge if necessary
        setProjectState({ ...defaultProject, ...parsed, unitMix: parsed.unitMix || defaultProject.unitMix });
      } catch (e) {
        console.warn('Failed to load project from localStorage');
        setProjectState(defaultProject); // Fallback to default if parsing fails
      }
    } else {
      setProjectState(defaultProject); // Set default if nothing is saved
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

  return (
    <StoreContext.Provider value={{
      project,
      setProject,
      updateProject,
      scenarios,
      duplicateScenario,
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