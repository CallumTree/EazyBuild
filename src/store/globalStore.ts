
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export interface HouseType {
  id: string;
  name: string;
  beds?: number;
  giaSqft?: number;
  giaM2?: number;
  buildPerSqft?: number;
  buildPerM2?: number;
  salePerSqft?: number;
  salePerM2?: number;
}

export interface Comp {
  id: string;
  address: string;
  postcode: string;
  beds: number;
  propertyType: string;
  date: string;
  priceGBP: number;
  giaSqft: number;
  pricePerSqft: number;
}

export interface Project {
  meta: {
    name: string;
  };
  survey: {
    polygonGeoJSON: any | null;
    siteAreaM2: number;
    efficiency: number;
  };
  library: {
    defaults: HouseType[];
    myTypes: HouseType[];
  };
  layout: {
    unitMix: Array<{ houseTypeId: string; count: number }>;
    houseTypes: HouseType[];
  };
  finance: {
    feesPct: number;
    contPct: number;
    targetProfitPct: number;
    landAcqCosts: number;
    financeRatePct: number;
    financeMonths: number;
  };
  market: {
    comps: Comp[];
    pricePerSqftDerived: number | null;
    useMarketPrice: boolean;
  };
}

interface GlobalStoreContextType {
  project: Project;
  updateProject: (updates: Partial<Project>) => void;
  setProject: (project: Project) => void;
}

const GlobalStoreContext = createContext<GlobalStoreContextType | undefined>(undefined);

const defaultHouseTypes: HouseType[] = [
  {
    id: 'default-2-bed-semi',
    name: '2-Bed Semi',
    beds: 2,
    giaM2: 90,
    buildPerM2: 1500,
    salePerM2: 3000,
  },
  {
    id: 'default-3-bed-semi',
    name: '3-Bed Semi',
    beds: 3,
    giaM2: 110,
    buildPerM2: 1600,
    salePerM2: 3200,
  },
  {
    id: 'default-3-bed-detached',
    name: '3-Bed Detached',
    beds: 3,
    giaM2: 130,
    buildPerM2: 1700,
    salePerM2: 3400,
  },
  {
    id: 'default-4-bed-detached',
    name: '4-Bed Detached',
    beds: 4,
    giaM2: 160,
    buildPerM2: 1800,
    salePerM2: 3600,
  },
];

const defaultProject: Project = {
  meta: {
    name: '',
  },
  survey: {
    polygonGeoJSON: null,
    siteAreaM2: 0,
    efficiency: 65,
  },
  library: {
    defaults: defaultHouseTypes,
    myTypes: [],
  },
  layout: {
    unitMix: [],
    houseTypes: defaultHouseTypes,
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
    pricePerSqftDerived: null,
    useMarketPrice: false,
  },
};

export function useGlobalStore() {
  const context = useContext(GlobalStoreContext);
  if (context === undefined) {
    throw new Error('useGlobalStore must be used within a GlobalStoreProvider');
  }
  return context;
}

export function GlobalStoreProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<Project>(defaultProject);

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
  }, []);

  // Save to localStorage on project changes
  useEffect(() => {
    localStorage.setItem('landsnap.project', JSON.stringify(project));
  }, [project]);

  const updateProject = (updates: Partial<Project>) => {
    setProjectState(prev => ({ ...prev, ...updates }));
  };

  const setProject = (newProject: Project) => {
    setProjectState(newProject);
  };

  return (
    <GlobalStoreContext.Provider value={{
      project,
      updateProject,
      setProject,
    }}>
      {children}
    </GlobalStoreContext.Provider>
  );
}
