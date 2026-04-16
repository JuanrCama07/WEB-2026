"use client";

import { useMemo, useState } from 'react';
import {
  type Activity,
  type ActivityPriority,
  type ActivityStatus,
  type ActivityType,
  updateStoredActivities,
  useStoredActivities,
} from '@/lib/activities-store';

type EscalationLevel = 'low' | 'medium' | 'high' | 'critical';

type FormState = {
  title: string;
  course: string;
  type: ActivityType;
  dueDate: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  reminder: string;
  progress: number;
  subtasks: string;
};

export type TasksCopy = {
  title: string;
  subtitle: string;
  newActivity: string;
  editActivity: string;
  formDescription: string;
  saveActivity: string;
  updateActivity: string;
  resetForm: string;
  fields: Record<'title' | 'course' | 'type' | 'dueDate' | 'priority' | 'status' | 'reminder' | 'subtasks' | 'progress', string>;
  placeholders: Record<'title' | 'course' | 'subtasks', string>;
  types: Record<ActivityType, string>;
  priorities: Record<ActivityPriority, string>;
  statuses: Record<ActivityStatus, string>;
  summary: Record<'total' | 'dueSoon' | 'highPriority' | 'completed', string>;
  actions: Record<'edit' | 'delete' | 'toggleStatus' | 'clearReminder' | 'addReminder' | 'resolveAlert', string>;
  labels: Record<'progressCompleted' | 'subtasksCompleted' | 'reminderNone' | 'reminderAt' | 'dueLabel' | 'emptyTitle' | 'activitiesList' | 'smartReminders' | 'escalationPanel' | 'alertsReady' | 'noAlerts' | 'riskLevel' | 'suggestedAction' | 'smartRule' | 'noActivities', string>;
  escalation: Record<EscalationLevel, string>;
  smartMessages: Record<'criticalDeadline' | 'highPriorityStalled' | 'reminderMissing' | 'lowProgress' | 'onTrack' | 'criticalAction' | 'highAction' | 'reminderAction' | 'progressAction', string>;
};

type SmartAlert = {
  activityId: number;
  title: string;
  level: EscalationLevel;
  message: string;
  action: string;
};

const emptyForm: FormState = {
  title: '',
  course: '',
  type: 'assignment',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
  reminder: '',
  progress: 0,
  subtasks: '',
};

const statusOrder: ActivityStatus[] = ['pending', 'inProgress', 'completed'];
const today = new Date('2026-03-18T00:00:00');

export function TasksManager({ copy }: { copy: TasksCopy }) {
  const activities = useStoredActivities();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const summary = useMemo(() => {
    const dueSoon = activities.filter((activity) => {
      const dueDate = new Date(`${activity.dueDate}T00:00:00`);
      const diff = dueDate.getTime() - today.getTime();
      return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 7;
    }).length;

    return {
      total: activities.length,
      dueSoon,
      highPriority: activities.filter((activity) => activity.priority === 'high').length,
      completed: activities.filter((activity) => activity.status === 'completed').length,
    };
  }, [activities]);

  const smartAlerts = useMemo(() => {
    return activities
      .filter((activity) => activity.status !== 'completed')
      .map((activity) => buildSmartAlert(activity, copy))
      .filter(isSmartAlert)
      .sort((left, right) => escalationScore(right.level) - escalationScore(left.level));
  }, [activities, copy]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function parseSubtasks(subtasksValue: string, baseId: number) {
    return subtasksValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((title, index) => ({
        id: baseId + index + 1,
        title,
        done: false,
      }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = form.title.trim();
    if (!normalizedTitle) {
      return;
    }

    if (editingId !== null) {
      updateStoredActivities((current) =>
        current.map((activity) =>
          activity.id === editingId
            ? {
                ...activity,
                title: normalizedTitle,
                course: form.course.trim(),
                type: form.type,
                dueDate: form.dueDate,
                priority: form.priority,
                status: form.status,
                reminder: form.reminder,
                progress: form.progress,
                subtasks:
                  form.subtasks.trim().length > 0
                    ? parseSubtasks(form.subtasks, editingId * 100)
                    : activity.subtasks,
              }
            : activity
        )
      );
    } else {
      updateStoredActivities((current) => {
        const nextId = current.length === 0 ? 1 : Math.max(...current.map((activity) => activity.id)) + 1;

        return [
          {
            id: nextId,
            title: normalizedTitle,
            course: form.course.trim(),
            type: form.type,
            dueDate: form.dueDate,
            priority: form.priority,
            status: form.status,
            reminder: form.reminder,
            progress: form.progress,
            subtasks: parseSubtasks(form.subtasks, nextId * 100),
          },
          ...current,
        ];
      });
    }

    resetForm();
  }

  function handleEdit(activity: Activity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      course: activity.course,
      type: activity.type,
      dueDate: activity.dueDate,
      priority: activity.priority,
      status: activity.status,
      reminder: activity.reminder,
      progress: activity.progress,
      subtasks: activity.subtasks.map((subtask) => subtask.title).join(', '),
    });
  }

  function toggleSubtask(activityId: number, subtaskId: number) {
    updateStoredActivities((current) =>
      current.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              subtasks: activity.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
              ),
            }
          : activity
      )
    );
  }

  function cycleStatus(activityId: number) {
    updateStoredActivities((current) =>
      current.map((activity) => {
        if (activity.id !== activityId) {
          return activity;
        }

        const currentIndex = statusOrder.indexOf(activity.status);
        return {
          ...activity,
          status: statusOrder[(currentIndex + 1) % statusOrder.length],
        };
      })
    );
  }

  function toggleReminder(activityId: number) {
    updateStoredActivities((current) =>
      current.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              reminder: activity.reminder ? '' : `${activity.dueDate}T08:00`,
            }
          : activity
      )
    );
  }

  function deleteActivity(activityId: number) {
    updateStoredActivities((current) => current.filter((activity) => activity.id !== activityId));

    if (editingId === activityId) {
      resetForm();
    }
  }

  function applySmartAction(activityId: number) {
    updateStoredActivities((current) =>
      current.map((activity) => {
        if (activity.id !== activityId) {
          return activity;
        }

        const daysLeft = getDaysLeft(activity.dueDate);

        if (daysLeft <= 2) {
          return {
            ...activity,
            reminder: activity.reminder || `${activity.dueDate}T07:00`,
            status: 'inProgress',
            priority: 'high',
          };
        }

        if (!activity.reminder) {
          return {
            ...activity,
            reminder: `${activity.dueDate}T08:00`,
          };
        }

        return {
          ...activity,
          status: activity.status === 'pending' ? 'inProgress' : activity.status,
          progress: Math.max(activity.progress, 40),
        };
      })
    );
  }

  return (
    <div className="space-y-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <p className="app-kicker text-xs font-bold uppercase">Operations Hub</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-zinc-600">
          {copy.subtitle}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label={copy.summary.total} value={summary.total} accent="bg-sky-100 text-sky-700" />
        <SummaryCard label={copy.summary.dueSoon} value={summary.dueSoon} accent="bg-amber-100 text-amber-700" />
        <SummaryCard label={copy.summary.highPriority} value={summary.highPriority} accent="bg-rose-100 text-rose-700" />
        <SummaryCard label={copy.summary.completed} value={summary.completed} accent="bg-emerald-100 text-emerald-700" />
      </section>

      <section className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(135deg,#fff7ed,#ffffff,#fff1f2)] p-6 shadow-[0_20px_48px_rgba(245,158,11,0.08)] dark:border-amber-900/50 dark:bg-[linear-gradient(135deg,#1a2328,#101a1f,#172126)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
              {copy.labels.smartReminders}
            </p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{copy.labels.escalationPanel}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {smartAlerts.length > 0 ? `${smartAlerts.length} ${copy.labels.alertsReady}` : copy.labels.noAlerts}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {smartAlerts.length > 0 ? (
            smartAlerts.map((alert) => (
              <div key={alert.activityId} className="rounded-[1.7rem] border border-white bg-white/95 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:border-zinc-700 dark:bg-zinc-900/95 dark:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{alert.title}</h3>
                  <EscalationBadge label={copy.escalation[alert.level]} level={alert.level} />
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{alert.message}</p>
                <div className="mt-4 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-800/80">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                    {copy.labels.suggestedAction}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{alert.action}</p>
                </div>
                <button
                  type="button"
                  onClick={() => applySmartAction(alert.activityId)}
                  className="mt-4 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  {copy.actions.resolveAlert}
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-[1.7rem] border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              {copy.smartMessages.onTrack}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <form onSubmit={handleSubmit} className="app-panel-strong space-y-5 rounded-[2rem] p-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">
              {editingId === null ? copy.newActivity : copy.editActivity}
            </p>
            <h2 className="text-2xl font-bold text-zinc-900">
              {editingId === null ? copy.saveActivity : copy.updateActivity}
            </h2>
            <p className="text-sm text-zinc-500">{copy.formDescription}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.title}</label>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder={copy.placeholders.title}
                className="app-input mt-2"
              />
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.course}</label>
              <input
                value={form.course}
                onChange={(event) => setForm({ ...form, course: event.target.value })}
                placeholder={copy.placeholders.course}
                className="app-input mt-2"
              />
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.type}</label>
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as ActivityType })}
                className="app-input mt-2"
              >
                <option value="assignment">{copy.types.assignment}</option>
                <option value="exam">{copy.types.exam}</option>
                <option value="project">{copy.types.project}</option>
              </select>
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.dueDate}</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                className="app-input mt-2"
              />
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.priority}</label>
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value as ActivityPriority })}
                className="app-input mt-2"
              >
                <option value="high">{copy.priorities.high}</option>
                <option value="medium">{copy.priorities.medium}</option>
                <option value="low">{copy.priorities.low}</option>
              </select>
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.status}</label>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as ActivityStatus })}
                className="app-input mt-2"
              >
                <option value="pending">{copy.statuses.pending}</option>
                <option value="inProgress">{copy.statuses.inProgress}</option>
                <option value="completed">{copy.statuses.completed}</option>
              </select>
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">{copy.fields.reminder}</label>
              <input
                type="datetime-local"
                value={form.reminder}
                onChange={(event) => setForm({ ...form, reminder: event.target.value })}
                className="app-input mt-2"
              />
            </Field>

            <Field>
              <label className="text-sm font-medium text-zinc-700">
                {copy.fields.progress} <span className="text-zinc-400">({form.progress}%)</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progress}
                onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })}
                className="mt-4 w-full accent-sky-500"
              />
            </Field>
          </div>

          <Field>
            <label className="text-sm font-medium text-zinc-700">{copy.fields.subtasks}</label>
            <textarea
              value={form.subtasks}
              onChange={(event) => setForm({ ...form, subtasks: event.target.value })}
              placeholder={copy.placeholders.subtasks}
              className="app-input mt-2 min-h-28"
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-[linear-gradient(135deg,#0f6cbd,#0b4f8a)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,108,189,0.24)] transition hover:brightness-105"
            >
              {editingId === null ? copy.saveActivity : copy.updateActivity}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              {copy.resetForm}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">{copy.labels.activitiesList}</h2>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
              {activities.length}
            </span>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-8 text-center">
                <h3 className="text-xl font-bold text-zinc-900">{copy.labels.emptyTitle}</h3>
                <p className="mt-2 text-sm text-zinc-500">{copy.labels.noActivities}</p>
              </div>
            ) : (
              activities.map((activity) => {
              const completedSubtasks = activity.subtasks.filter((subtask) => subtask.done).length;
              const typeLabel = copy.types[activity.type];
              const priorityLabel = copy.priorities[activity.priority];
              const statusLabel = copy.statuses[activity.status];
              const escalation = getEscalation(activity);

              return (
                <article key={activity.id} className="app-panel-strong rounded-[2rem] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{typeLabel}</Badge>
                        <Badge tone={activity.priority}>{priorityLabel}</Badge>
                        <Badge tone={activity.status}>{statusLabel}</Badge>
                        <EscalationBadge label={copy.escalation[escalation]} level={escalation} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-900">
                          {activity.title || copy.labels.emptyTitle}
                        </h3>
                        <p className="text-sm text-zinc-500">{activity.course}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(activity)}
                        className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                      >
                        {copy.actions.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteActivity(activity.id)}
                        className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        {copy.actions.delete}
                      </button>
                      <button
                        type="button"
                        onClick={() => cycleStatus(activity.id)}
                        className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                      >
                        {copy.actions.toggleStatus}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <InfoCard
                      label={copy.labels.dueLabel}
                      value={activity.dueDate || copy.labels.reminderNone}
                    />
                    <InfoCard
                      label={copy.labels.reminderAt}
                      value={activity.reminder || copy.labels.reminderNone}
                    />
                    <InfoCard
                      label={copy.labels.progressCompleted}
                      value={`${activity.progress}%`}
                    />
                    <InfoCard
                      label={copy.labels.riskLevel}
                      value={copy.escalation[escalation]}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      {copy.labels.smartRule}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-800">
                      {buildActivityRule(activity, copy)}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
                      <span>{copy.fields.progress}</span>
                      <span>{activity.progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-100">
                      <div
                        className="h-3 rounded-full bg-sky-500 transition-all"
                        style={{ width: `${activity.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-800">
                        {copy.labels.subtasksCompleted}: {completedSubtasks}/{activity.subtasks.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleReminder(activity.id)}
                        className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                      >
                        {activity.reminder ? copy.actions.clearReminder : copy.actions.addReminder}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activity.subtasks.map((subtask) => (
                        <button
                          key={subtask.id}
                          type="button"
                          onClick={() => toggleSubtask(activity.id, subtask.id)}
                          className="flex w-full items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-100"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              subtask.done
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-zinc-300 bg-white'
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${subtask.done ? 'bg-white' : 'bg-transparent'}`} />
                          </span>
                          <span className={subtask.done ? 'text-zinc-400 line-through' : 'text-zinc-700'}>
                            {subtask.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
              })
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="app-panel-strong rounded-[1.8rem] p-5">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
        {label}
      </div>
      <p className="mt-4 text-4xl font-black tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: ActivityPriority | ActivityStatus;
}) {
  const className =
    tone === 'high'
      ? 'bg-rose-100 text-rose-700'
      : tone === 'medium'
        ? 'bg-amber-100 text-amber-700'
        : tone === 'low'
          ? 'bg-emerald-100 text-emerald-700'
          : tone === 'pending'
            ? 'bg-zinc-100 text-zinc-700'
            : tone === 'inProgress'
              ? 'bg-sky-100 text-sky-700'
              : tone === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-violet-100 text-violet-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-800">{value}</p>
    </div>
  );
}

function getDaysLeft(dueDate: string) {
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getEscalation(activity: Activity): EscalationLevel {
  const daysLeft = getDaysLeft(activity.dueDate);

  if (daysLeft <= 1 && activity.status !== 'completed') {
    return 'critical';
  }

  if ((activity.priority === 'high' && activity.progress < 40) || daysLeft <= 3) {
    return 'high';
  }

  if (!activity.reminder || activity.progress < 60) {
    return 'medium';
  }

  return 'low';
}

function escalationScore(level: EscalationLevel) {
  return level === 'critical' ? 4 : level === 'high' ? 3 : level === 'medium' ? 2 : 1;
}

function buildSmartAlert(activity: Activity, copy: TasksCopy): SmartAlert | null {
  const daysLeft = getDaysLeft(activity.dueDate);

  if (daysLeft <= 1) {
    return {
      activityId: activity.id,
      title: activity.title,
      level: 'critical',
      message: copy.smartMessages.criticalDeadline,
      action: copy.smartMessages.criticalAction,
    } satisfies SmartAlert;
  }

  if (activity.priority === 'high' && activity.progress < 40) {
    return {
      activityId: activity.id,
      title: activity.title,
      level: 'high',
      message: copy.smartMessages.highPriorityStalled,
      action: copy.smartMessages.highAction,
    } satisfies SmartAlert;
  }

  if (!activity.reminder) {
    return {
      activityId: activity.id,
      title: activity.title,
      level: 'medium',
      message: copy.smartMessages.reminderMissing,
      action: copy.smartMessages.reminderAction,
    } satisfies SmartAlert;
  }

  if (activity.progress < 60 && daysLeft <= 7) {
    return {
      activityId: activity.id,
      title: activity.title,
      level: 'medium',
      message: copy.smartMessages.lowProgress,
      action: copy.smartMessages.progressAction,
    } satisfies SmartAlert;
  }

  return null;
}

function isSmartAlert(alert: SmartAlert | null): alert is SmartAlert {
  return alert !== null;
}

function buildActivityRule(activity: Activity, copy: TasksCopy) {
  const daysLeft = getDaysLeft(activity.dueDate);

  if (daysLeft <= 1) {
    return copy.smartMessages.criticalDeadline;
  }

  if (activity.priority === 'high' && activity.progress < 40) {
    return copy.smartMessages.highPriorityStalled;
  }

  if (!activity.reminder) {
    return copy.smartMessages.reminderMissing;
  }

  if (activity.progress < 60) {
    return copy.smartMessages.lowProgress;
  }

  return copy.smartMessages.onTrack;
}

function EscalationBadge({ label, level }: { label: string; level: EscalationLevel }) {
  const className =
    level === 'critical'
      ? 'bg-rose-600 text-white'
      : level === 'high'
        ? 'bg-orange-100 text-orange-700'
        : level === 'medium'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-emerald-100 text-emerald-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}
