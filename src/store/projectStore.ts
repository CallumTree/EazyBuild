
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// Zod schemas for validation
export const ObstacleSchema = z.object({
  id: z.string(),
  type: z.enum(['tree', 'pond', 'structure', 'other']),
  position: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  description: z.string().optional(),
});

export const FinanceSchema = z.object({
  gdv: z.number().min(0),
  buildCosts: z.number().min(0),
  fees: z.number().min(0),
  contingency: z.number().min(0),
  profit: z.number().min(0),
  residualLandValue: z.number(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  createdAt: z.string(),
  updatedAt: z.string(),
  boundary: z.array(z.object({
    lat: z.number(),
    lng: z.number(),
  })).optional(),
  obstacles: z.array(ObstacleSchema).default([]),
  houseType: z.enum(['detached', 'semi-detached', 'terraced', 'apartment']).optional(),
  estimatedUnits: z.number().min(2).max(15).optional(),
  finance: FinanceSchema.optional(),
  siteArea: z.number().optional(), // in square meters
});

export type Project = z.infer<typeof ProjectSchema>;
export type Obstacle = z.infer<typeof ObstacleSchema>;
export type Finance = z.infer<typeof FinanceSchema>;

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  createProject: (name: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  addObstacle: (projectId: string, obstacle: Omit<Obstacle, 'id'>) => void;
  removeObstacle: (projectId: string, obstacleId: string) => void;
  updateBoundary: (projectId: string, boundary: Array<{lat: number, lng: number}>) => void;
  updateFinance: (projectId: string, finance: Finance) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,

      createProject: (name: string) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          obstacles: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));

        return newProject;
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
              : state.currentProject,
        }));
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      setCurrentProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        set({ currentProject: project || null });
      },

      addObstacle: (projectId: string, obstacle: Omit<Obstacle, 'id'>) => {
        const newObstacle: Obstacle = {
          ...obstacle,
          id: crypto.randomUUID(),
        };

        get().updateProject(projectId, {
          obstacles: [
            ...get().projects.find((p) => p.id === projectId)?.obstacles || [],
            newObstacle,
          ],
        });
      },

      removeObstacle: (projectId: string, obstacleId: string) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
          get().updateProject(projectId, {
            obstacles: project.obstacles.filter((o) => o.id !== obstacleId),
          });
        }
      },

      updateBoundary: (projectId: string, boundary: Array<{lat: number, lng: number}>) => {
        // Calculate area using Turf.js when we implement the map
        get().updateProject(projectId, { boundary });
      },

      updateFinance: (projectId: string, finance: Finance) => {
        get().updateProject(projectId, { finance });
      },
    }),
    {
      name: 'landsnap-projects',
    }
  )
);
