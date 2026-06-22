const BASE = '/api';

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
};

export const api = {
  // Projects
  getProjects: () => request('GET', '/projects'),
  addProject: (payload) => request('POST', '/projects', payload),
  updateProject: (id, payload) => request('PUT', `/projects/${id}`, payload),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),

  // Beads
  getBeads: (projectId) => request('GET', `/projects/${projectId}/beads`),
  getBead: (projectId, beadId) => request('GET', `/projects/${projectId}/beads/${beadId}`),
  createBead: (projectId, payload) => request('POST', `/projects/${projectId}/beads`, payload),
  updateBead: (projectId, beadId, payload) => request('PUT', `/projects/${projectId}/beads/${beadId}`, payload),
  closeBead: (projectId, beadId, reason) =>
    request('DELETE', `/projects/${projectId}/beads/${beadId}`, { reason }),

  // Workspace browser
  browseWorkspace: (path = '') => request('GET', `/workspace/browse?path=${encodeURIComponent(path)}`),

  // Init
  initProject: (projectId) => request('POST', `/projects/${projectId}/init`),
};
