export function getScopedStorageKey(baseKey: string, userId: string) {
  return `${baseKey}:${userId}`;
}
