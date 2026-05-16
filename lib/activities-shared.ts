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

export const ACTIVITIES_COOKIE_PREFIX = 'clearup_activities';

const ACTIVITY_TYPES: ActivityType[] = ['assignment', 'exam', 'project'];
const ACTIVITY_PRIORITIES: ActivityPriority[] = ['high', 'medium', 'low'];
const ACTIVITY_STATUSES: ActivityStatus[] = ['pending', 'inProgress', 'completed'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeSubtask(value: unknown): Subtask | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === 'number' ? value.id : Number(value.id);
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const done = typeof value.done === 'boolean' ? value.done : false;

  if (!Number.isFinite(id) || !title) {
    return null;
  }

  return {
    id,
    title,
    done,
  };
}

function normalizeActivity(value: unknown): Activity | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === 'number' ? value.id : Number(value.id);
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const course = typeof value.course === 'string' ? value.course.trim() : '';
  const type = ACTIVITY_TYPES.includes(value.type as ActivityType)
    ? (value.type as ActivityType)
    : null;
  const dueDate = typeof value.dueDate === 'string' ? value.dueDate : '';
  const priority = ACTIVITY_PRIORITIES.includes(value.priority as ActivityPriority)
    ? (value.priority as ActivityPriority)
    : null;
  const status = ACTIVITY_STATUSES.includes(value.status as ActivityStatus)
    ? (value.status as ActivityStatus)
    : null;
  const reminder = typeof value.reminder === 'string' ? value.reminder : '';
  const progress = typeof value.progress === 'number' ? value.progress : Number(value.progress);
  const subtasks = Array.isArray(value.subtasks)
    ? value.subtasks.map(normalizeSubtask).filter((subtask): subtask is Subtask => subtask !== null)
    : [];

  if (
    !Number.isFinite(id) ||
    !title ||
    !type ||
    !priority ||
    !status ||
    !Number.isFinite(progress)
  ) {
    return null;
  }

  return {
    id,
    title,
    course,
    type,
    dueDate,
    priority,
    status,
    reminder,
    progress: Math.max(0, Math.min(100, progress)),
    subtasks,
  };
}

export function normalizeActivities(value: unknown): Activity[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeActivity)
    .filter((activity): activity is Activity => activity !== null);
}

export function getActivitiesCookieName(userId: string) {
  return `${ACTIVITIES_COOKIE_PREFIX}_${userId}`;
}
