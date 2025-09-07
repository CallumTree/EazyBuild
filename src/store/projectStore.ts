import { create } from 'zustand';

interface Project {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  gdv?: number;
  units?: number;
  createdAt: Date;
}

interface ProjectStore {
  projects: Project[];
  createProject: (name: string) => Project;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  createProject: (name: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      status: 'draft',
      createdAt: new Date(),
    };

    set((state) => ({
      projects: [...state.projects, newProject]
    }));

    return newProject;
  }
}));