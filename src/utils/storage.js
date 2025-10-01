
// Simple localStorage-based project storage for EazyBuild

export function getProjects() {
  try {
    const projects = localStorage.getItem('eazybuild:projects');
    return projects ? JSON.parse(projects) : [];
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

export function saveProject(project) {
  try {
    const projects = getProjects();
    const newProject = {
      ...project,
      id: project.id || `proj_${Date.now()}`,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    localStorage.setItem('eazybuild:projects', JSON.stringify(projects));
    return newProject;
  } catch (error) {
    console.error('Error saving project:', error);
    throw error;
  }
}

export function updateProject(id, updates) {
  try {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('eazybuild:projects', JSON.stringify(projects));
    return projects[projectIndex];
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export function deleteProject(id) {
  try {
    const projects = getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    localStorage.setItem('eazybuild:projects', JSON.stringify(filteredProjects));
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

export function getProject(id) {
  try {
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
}
