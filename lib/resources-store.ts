export type ResourceType = 'link' | 'document' | 'note';

export type Resource = {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  createdAt: string;
  subjectId: string;
};

export function loadResources(): Resource[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem('clearup_resources');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveResources(resources: Resource[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('clearup_resources', JSON.stringify(resources));
}

export function getResourcesBySubject(subjectId: string): Resource[] {
  return loadResources().filter(r => r.subjectId === subjectId);
}

export function addResource(resource: Omit<Resource, 'id' | 'createdAt'>): Resource {
  const newResource: Resource = {
    ...resource,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const resources = loadResources();
  saveResources([...resources, newResource]);
  return newResource;
}

export function deleteResource(resourceId: string) {
  const resources = loadResources();
  saveResources(resources.filter(r => r.id !== resourceId));
}
