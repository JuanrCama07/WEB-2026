'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useStoredActivities } from '@/lib/activities-store';

const today = new Date('2026-03-18T00:00:00');

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

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isInPeriod(date: string, periodStart: Date, periodEnd: Date): boolean {
  const d = new Date(date);
  return d >= periodStart && d <= periodEnd;
}

export default function AnalyticsPage() {
  const t = useTranslations('Analytics');
  const activities = useStoredActivities();

  const weekStart = useMemo(() => getWeekStart(today), []);
  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), [weekStart]);
  const monthStart = useMemo(() => getMonthStart(today), []);
  const monthEnd = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0), []);

  const weekStats = useMemo(() => {
    const completed = activities.filter(a => a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length;
    const pending = activities.filter(a => a.status !== 'completed' && getDaysLeft(a.dueDate) >= 0 && isInPeriod(a.dueDate, weekStart, weekEnd)).length;
    const avgProgress = activities.length === 0 ? 0 : Math.round(activities.reduce((sum, a) => sum + a.progress, 0) / activities.length);

    const byPriority = {
      high: activities.filter(a => a.priority === 'high' && a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length,
      medium: activities.filter(a => a.priority === 'medium' && a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length,
      low: activities.filter(a => a.priority === 'low' && a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length,
    };

    const byType = {
      assignment: activities.filter(a => a.type === 'assignment' && a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length,
      exam: activities.filter(a => a.type === 'exam' && a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length,
      project: activities.filter(a => a.type === 'project' && a.status === 'completed' && isInPeriod(a.dueDate, weekStart, weekEnd)).length,
    };

    return { completed, pending, avgProgress, byPriority, byType };
  }, [activities, weekStart, weekEnd]);

  const monthStats = useMemo(() => {
    const completed = activities.filter(a => a.status === 'completed' && isInPeriod(a.dueDate, monthStart, monthEnd)).length;
    const pending = activities.filter(a => a.status !== 'completed' && getDaysLeft(a.dueDate) >= 0 && isInPeriod(a.dueDate, monthStart, monthEnd)).length;

    return { completed, pending };
  }, [activities, monthStart, monthEnd]);

  const stressLevel = useMemo(() => {
    const overdue = activities.filter(a => a.status !== 'completed' && getDaysLeft(a.dueDate) < 0).length;
    const dueThisWeek = activities.filter(a => a.status !== 'completed' && getDaysLeft(a.dueDate) >= 0 && getDaysLeft(a.dueDate) <= 7).length;
    const avgProgress = activities.length === 0 ? 0 : Math.round(activities.reduce((sum, a) => sum + a.progress, 0) / activities.length);

    if (overdue > 0 || (dueThisWeek > 2 && avgProgress < 30)) return 'critical';
    if (dueThisWeek > 0 && avgProgress < 50) return 'high';
    if (dueThisWeek > 0) return 'medium';
    return 'low';
  }, [activities]);

  const stressColor = {
    low: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-100',
    medium: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-100',
    high: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100',
    critical: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-100',
  };
  const stressIndicator = {
    low: 'OK',
    medium: 'MED',
    high: 'ALT',
    critical: 'CRT',
  } as const;

  if (activities.length === 0) {
    return (
      <div className="space-y-8">
        <header className="app-hero rounded-[2rem] px-7 py-8">
          <p className="app-kicker text-xs font-bold uppercase">Performance Snapshot</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950">{t('title')}</h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600">{t('subtitle')}</p>
        </header>

        <section className="app-panel-strong rounded-[2rem] border-dashed p-10 text-center">
          <p className="text-xl font-bold text-zinc-900 dark:text-white">{t('noData')}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="app-kicker text-xs font-bold uppercase">Performance Snapshot</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">{t('title')}</h1>
            <p className="mt-3 max-w-3xl text-lg text-zinc-600">{t('subtitle')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill label={t('completed')} value={String(weekStats.completed)} />
            <StatPill label={t('pending')} value={String(weekStats.pending)} />
            <StatPill label={t('avgProgress')} value={`${weekStats.avgProgress}%`} />
          </div>
        </div>
      </header>

      <div className={`rounded-[2rem] border p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${stressColor[stressLevel]}`}>
        <h2 className="text-2xl font-bold mb-2">{t('stressLevel')}</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-current/15 bg-white/55 text-sm font-black uppercase tracking-[0.18em] shadow-sm dark:bg-black/10">
            {stressIndicator[stressLevel]}
          </div>
          <div>
            <p className="text-lg font-bold">
              {stressLevel === 'low'
                ? t('low')
                : stressLevel === 'medium'
                  ? t('medium')
                  : stressLevel === 'high'
                    ? t('high')
                    : t('critical')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="app-panel-strong rounded-[2rem] p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t('weekSummary')}</h2>

          <div className="space-y-4">
            <StatRow label={t('completed')} value={String(weekStats.completed)} color="emerald" />
            <StatRow label={t('pending')} value={String(weekStats.pending)} color="amber" />
            <StatRow label={t('avgProgress')} value={`${weekStats.avgProgress}%`} color="blue" />
          </div>

          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">{t('byPriority')}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Alta</span>
                <span className="font-semibold">{weekStats.byPriority.high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Media</span>
                <span className="font-semibold">{weekStats.byPriority.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Baja</span>
                <span className="font-semibold">{weekStats.byPriority.low}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="app-panel-strong rounded-[2rem] p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t('monthSummary')}</h2>

          <div className="space-y-4">
            <StatRow label={t('completed')} value={String(monthStats.completed)} color="emerald" />
            <StatRow label={t('pending')} value={String(monthStats.pending)} color="amber" />
          </div>

          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">{t('byType')}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Entregas</span>
                <span className="font-semibold">{weekStats.byType.assignment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Parciales</span>
                <span className="font-semibold">{weekStats.byType.exam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Proyectos</span>
                <span className="font-semibold">{weekStats.byType.project}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-violet-200 bg-[linear-gradient(135deg,#f5f3ff,#faf5ff)] p-6 shadow-[0_18px_40px_rgba(139,92,246,0.08)]">
        <h2 className="text-xl font-bold text-violet-900 dark:text-violet-100 mb-3">{t('recommendation')}</h2>
        <p className="text-sm text-violet-700 dark:text-violet-300">
          {stressLevel === 'low'
            ? 'Tu carga está bajo control. Mantén el ritmo actual.'
            : stressLevel === 'medium'
              ? 'Tienes tareas próximas. Aumenta tu dedicación esta semana.'
              : stressLevel === 'high'
                ? 'Alto estrés detectado. Planifica bloques de trabajo urgentes.'
                : 'Situación crítica. Actúa inmediatamente en tareas atrasadas.'}
        </p>
      </section>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: 'emerald' | 'amber' | 'blue' }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <span className={`px-3 py-1 rounded-lg font-bold ${colors[color]}`}>{value}</span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{value}</p>
    </div>
  );
}
