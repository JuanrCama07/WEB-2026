"use client";

import { useSyncExternalStore } from 'react';

import { getActiveClientSession, useAuthSession } from './auth/client';
import { getScopedStorageKey } from './user-storage';

export type ActivityType = 'assignment' | 'exam' | 'project';
export type ActivityPriority = 'high' | 'medium' | 'low';
export type ActivityStatus = 'pending' | 'inProgress' | 'completed';

export type Subtask = {
  id: number;
  title: string;
  done: boolean;
};

export type Activity = {
  id: number;
  title: string;
  course: string;
  type: ActivityType;
  dueDate: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  reminder: string;
  progress: number;
  subtasks: Subtask[];
};

const STORAGE_KEY = 'clearup_activities';
const STORE_EVENT = 'clearup-activities-updated';
let cachedRawValue: string | null = null;
let cachedActivities: Activity[] = [];
let cachedStorageKey: string | null = null;

function parseActivities(value: string | null) {
  if (value === cachedRawValue) {
    return cachedActivities;
  }

  cachedRawValue = value;

  if (!value) {
    cachedActivities = [];
    return cachedActivities;
  }

  try {
    const parsed = JSON.parse(value);
    cachedActivities = Array.isArray(parsed) ? (parsed as Activity[]) : [];
    return cachedActivities;
  } catch {
    cachedActivities = [];
    return cachedActivities;
  }
}

function resolveStorageKey(userId?: string) {
  const scopedUserId = userId ?? getActiveClientSession()?.id;

  if (!scopedUserId) {
    return STORAGE_KEY;
  }

  return getScopedStorageKey(STORAGE_KEY, scopedUserId);
}

export function readStoredActivities(userId?: string) {
  if (typeof window === 'undefined') {
    return [];
  }

  const storageKey = resolveStorageKey(userId);

  if (cachedStorageKey !== storageKey) {
    cachedRawValue = null;
    cachedActivities = [];
    cachedStorageKey = storageKey;
  }

  return parseActivities(window.localStorage.getItem(storageKey));
}

export function writeStoredActivities(activities: Activity[], userId?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const storageKey = resolveStorageKey(userId);
  const nextRawValue = JSON.stringify(activities);
  cachedRawValue = nextRawValue;
  cachedActivities = activities;
  cachedStorageKey = storageKey;
  window.localStorage.setItem(storageKey, nextRawValue);
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function updateStoredActivities(
  updater: (current: Activity[]) => Activity[],
  userId?: string,
) {
  writeStoredActivities(updater(readStoredActivities(userId)), userId);
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();

  window.addEventListener('storage', handleChange);
  window.addEventListener(STORE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(STORE_EVENT, handleChange);
  };
}

export function useStoredActivities() {
  const session = useAuthSession();
  const userId = session?.id;

  return useSyncExternalStore(
    subscribe,
    () => readStoredActivities(userId),
    () => [],
  );
}
