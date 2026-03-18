"use client";

import { useSyncExternalStore } from 'react';

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

export function readStoredActivities() {
  if (typeof window === 'undefined') {
    return [];
  }

  return parseActivities(window.localStorage.getItem(STORAGE_KEY));
}

export function writeStoredActivities(activities: Activity[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextRawValue = JSON.stringify(activities);
  cachedRawValue = nextRawValue;
  cachedActivities = activities;
  window.localStorage.setItem(STORAGE_KEY, nextRawValue);
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function updateStoredActivities(updater: (current: Activity[]) => Activity[]) {
  writeStoredActivities(updater(readStoredActivities()));
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
  return useSyncExternalStore(subscribe, readStoredActivities, () => []);
}
