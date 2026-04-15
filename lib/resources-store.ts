import { getActiveClientSession } from './auth/client';
import { getScopedStorageKey } from './user-storage';

export type ResourceType = 'link' | 'document' | 'note';

export type Resource = {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  createdAt: string;
  subjectId: string;
};

const STORAGE_KEY = 'clearup_resources';

function resolveStorageKey(userId?: string) {
  const scopedUserId = userId ?? getActiveClientSession()?.id;
  return scopedUserId ? getScopedStorageKey(STORAGE_KEY, scopedUserId) : STORAGE_KEY;
}

export function loadResources(userId?: string): Resource[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(resolveStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveResources(resources: Resource[], userId?: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(resolveStorageKey(userId), JSON.stringify(resources));
}

export function getResourcesBySubject(subjectId: string, userId?: string): Resource[] {
  return loadResources(userId).filter(r => r.subjectId === subjectId);
}

export function addResource(resource: Omit<Resource, 'id' | 'createdAt'>, userId?: string): Resource {
  const newResource: Resource = {
    ...resource,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const resources = loadResources(userId);
  saveResources([...resources, newResource], userId);
  return newResource;
}

export function deleteResource(resourceId: string, userId?: string) {
  const resources = loadResources(userId);
  saveResources(resources.filter(r => r.id !== resourceId), userId);
}
