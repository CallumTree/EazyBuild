
export function getProjects() {
  try {
    const stored = localStorage.getItem('eazybuild_projects');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load projects from localStorage:', error);
    return [];
  }
}

export function saveProject(project) {
  try {
    const projects = getProjects();
    const updatedProjects = [...projects, project];
    localStorage.setItem('eazybuild_projects', JSON.stringify(updatedProjects));
    return project;
  } catch (error) {
    console.error('Failed to save project:', error);
    throw error;
  }
}

export function updateProject(projectId, updates) {
  try {
    const projects = getProjects();
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    localStorage.setItem('eazybuild_projects', JSON.stringify(updatedProjects));
    return updatedProjects.find(p => p.id === projectId);
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

export function updateProject(projectId, updates) {
  try {
    const projects = getProjects();
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    localStorage.setItem('eazybuild_projects', JSON.stringify(updatedProjects));
    return updatedProjects.find(p => p.id === projectId);
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

export function deleteProject(projectId) {
  try {
    const projects = getProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('eazybuild_projects', JSON.stringify(filteredProjects));
    return true;
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}
