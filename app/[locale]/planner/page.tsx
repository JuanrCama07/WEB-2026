'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useStoredActivities } from '@/lib/activities-store';

const today = new Date('2026-03-18T00:00:00');
const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);

function getDaysLeft(dueDate: string): number {
  const due = new Date(dueDate);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function isThisWeek(dueDate: string): boolean {
  const due = new Date(dueDate);
  const weekStart = getWeekStart(today);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  return due >= weekStart && due <= weekEnd;
}

export default function CalendarPage() {
  const t = useTranslations('Calendar');
  const activities = useStoredActivities();

  const weekStart = useMemo(() => getWeekStart(today), []);
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      return { date, day: WEEK_DAYS[i] };
    });
  }, [weekStart]);

  const thiWeekActivities = useMemo(() => {
    return activities
      .filter(a => a.status !== 'completed' && isThisWeek(a.dueDate))
      .sort((a, b) => getDaysLeft(a.dueDate) - getDaysLeft(b.dueDate));
  }, [activities]);

  const suggestedDistribution = useMemo(() => {
    if (thiWeekActivities.length === 0) return [];

    const activitiesPerDay = Math.max(1, Math.ceil(thiWeekActivities.length / 5));
    return thiWeekActivities.slice(0, activitiesPerDay * 5);
  }, [thiWeekActivities]);
  const priorityLabel = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  } as const;

  return (
    <div className="space-y-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <p className="app-kicker text-xs font-bold uppercase">Weekly Scheduling</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-600">{t('subtitle')}</p>
      </header>

      <div className="flex gap-3">
        <a
          href={`/api/google-calendar/connect?locale=es`}
          className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)] transition hover:brightness-105"
        >
          {t('sync')}
        </a>
      </div>

      {thiWeekActivities.length === 0 ? (
        <section className="app-panel-strong rounded-[2rem] border-dashed p-10 text-center">
          <p className="text-xl font-bold text-zinc-900 dark:text-white">Sin tareas esta semana</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Crea entregas o parciales con fecha de vencimiento para verlos aquí.</p>
        </section>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('suggested')}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestedDistribution.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-[1.5rem] border border-blue-200 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] p-4 shadow-[0_10px_24px_rgba(59,130,246,0.08)] transition-shadow hover:shadow-lg"
                >
                  <p className="font-semibold text-zinc-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{activity.course}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {getDaysLeft(activity.dueDate)} días
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="app-panel-strong overflow-x-auto rounded-[2rem] p-6">
            <div className="grid gap-4" style={{ gridTemplateColumns: `100px repeat(7, 1fr)` }}>
              {/* Header */}
              <div />
              {weekDays.map((day, idx) => {
                const isToday = day.date.toDateString() === today.toDateString();
                return (
                  <div key={idx} className={`text-center ${isToday ? 'bg-blue-100 dark:bg-blue-900 rounded-lg' : ''} p-2`}>
                    <p className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">{String(t(day.day))}</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{day.date.getDate()}</p>
                  </div>
                );
              })}

              {/* Time slots */}
              {HOURS.map((hour) => (
                <div key={`row-${hour}`}>
                  <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-center">{hour}:00</div>
                  {weekDays.map((day, dayIdx) => {
                    const dayActivities = thiWeekActivities.filter(a => new Date(a.dueDate).toDateString() === day.date.toDateString());

                    return (
                      <div
                        key={`${hour}-${dayIdx}`}
                        onDragOver={(e) => e.preventDefault()}
                        className="h-20 rounded-xl border border-zinc-200 bg-white/70 p-1 transition-colors hover:bg-blue-50"
                      >
                        {dayActivities.length > 0 && (
                          <div className="text-xs bg-blue-500 text-white rounded px-2 py-1 truncate">
                            {dayActivities[0].title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {thiWeekActivities.map((activity) => {
              const daysLeft = getDaysLeft(activity.dueDate);
              const priorityColor = {
                high: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950',
                medium: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
                low: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
              };

              return (
                <div key={activity.id} className={`rounded-[1.5rem] border-2 p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] ${priorityColor[activity.priority]}`}>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{activity.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{activity.course}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-medium uppercase tracking-[0.16em] text-zinc-700 dark:text-zinc-200">
                      {priorityLabel[activity.priority]}
                    </span>
                    <span className="font-medium">{daysLeft} días</span>
                    <span className="font-medium">{activity.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${activity.progress}%` }} />
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
