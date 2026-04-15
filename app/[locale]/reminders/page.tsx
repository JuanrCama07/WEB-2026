'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { type Activity, useStoredActivities, updateStoredActivities } from '@/lib/activities-store';

const today = new Date('2026-03-18T00:00:00');

type AlertLevel = 'critical' | 'high' | 'medium';

type Alert = {
  activityId: number;
  title: string;
  course: string;
  reason: string;
  level: AlertLevel;
  daysLeft: number;
  progress: number;
  suggestedAction: string;
};

function getDaysLeft(dueDate: string): number {
  const due = new Date(dueDate);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getAlerts(activities: Activity[]): Alert[] {
  const alerts: Alert[] = [];

  activities.filter(a => a.status !== 'completed').forEach(activity => {
    const daysLeft = getDaysLeft(activity.dueDate);
    const isHighPriority = activity.priority === 'high';
    const isMediumPriority = activity.priority === 'medium';
    const hasReminder = !!activity.reminder;

    if (daysLeft < 2 && daysLeft >= 0 && activity.progress < 50) {
      alerts.push({
        activityId: activity.id,
        title: activity.title,
        course: activity.course,
        reason: 'Entrega inminente con bajo avance',
        level: 'critical' as const,
        daysLeft,
        progress: activity.progress,
        suggestedAction: 'Pasa a en progreso y trabaja inmediatamente',
      });
    }

    if (daysLeft < 0) {
      alerts.push({
        activityId: activity.id,
        title: activity.title,
        course: activity.course,
        reason: 'Fecha de entrega vencida',
        level: 'critical' as const,
        daysLeft,
        progress: activity.progress,
        suggestedAction: 'Completa y entrega cuanto antes',
      });
    }

    if (daysLeft >= 2 && daysLeft <= 5 && isHighPriority && !hasReminder) {
      alerts.push({
        activityId: activity.id,
        title: activity.title,
        course: activity.course,
        reason: 'Alta prioridad próxima sin recordatorio',
        level: 'high' as const,
        daysLeft,
        progress: activity.progress,
        suggestedAction: 'Activa un recordatorio temprano',
      });
    }

    if (daysLeft >= 3 && daysLeft <= 7 && activity.progress < 30 && (isHighPriority || isMediumPriority)) {
      alerts.push({
        activityId: activity.id,
        title: activity.title,
        course: activity.course,
        reason: 'Progreso bajo a pesar del tiempo disponible',
        level: 'high' as const,
        daysLeft,
        progress: activity.progress,
        suggestedAction: 'Incrementa el avance planificando un bloque de trabajo',
      });
    }

    if (daysLeft >= 5 && daysLeft <= 14 && !hasReminder && activity.progress === 0) {
      alerts.push({
        activityId: activity.id,
        title: activity.title,
        course: activity.course,
        reason: 'Pendiente sin recordatorio ni avance',
        level: 'medium' as const,
        daysLeft,
        progress: activity.progress,
        suggestedAction: 'Configura un recordatorio y comienza el trabajo',
      });
    }
  });

  return alerts.sort((a, b) => {
    const levelScore = { critical: 3, high: 2, medium: 1 };
    return levelScore[b.level] - levelScore[a.level];
  });
}

function levelColor(level: AlertLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-100';
    case 'high':
      return 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-100';
    case 'medium':
      return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-100';
  }
}

function levelBadgeColor(level: AlertLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-rose-500 text-white';
    case 'high':
      return 'bg-amber-500 text-white';
    case 'medium':
      return 'bg-blue-500 text-white';
  }
}

export default function RemindersPage() {
  const t = useTranslations('Reminders');
  const activities = useStoredActivities();

  const alerts = useMemo(() => getAlerts(activities), [activities]);

  const criticalAlerts = alerts.filter((a) => a.level === 'critical');
  const emergingRisks = alerts.filter((a) => a.level !== 'critical');

  const handleResolveAlert = (alertId: number) => {
    updateStoredActivities((current) =>
      current.map((a) => (a.id === alertId ? { ...a, status: 'inProgress' as const, reminder: new Date().toISOString() } : a))
    );
  };

  return (
    <div className="space-y-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <p className="app-kicker text-xs font-bold uppercase">Risk Center</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-600">{t('subtitle')}</p>
      </header>

      {alerts.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-emerald-300 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-200 dark:bg-emerald-900 flex items-center justify-center text-2xl dark:text-emerald-300">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-emerald-900 dark:text-emerald-100">{t('noAlerts')}</h2>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Panel de alertas críticas */}
          <section className="rounded-[2rem] border border-rose-200 bg-[linear-gradient(135deg,#fff1f2,#ffffff)] p-6 shadow-[0_16px_32px_rgba(244,63,94,0.08)]">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-rose-900 dark:text-rose-100">{t('critical')}</h2>
              <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
                {criticalAlerts.length === 0 ? t('noCritical') : `${criticalAlerts.length} alerta(s)`}
              </p>
            </div>

            <div className="space-y-3">
              {criticalAlerts.length === 0 ? (
                <div className="text-center py-8 text-rose-600 dark:text-rose-400 text-sm">{t('noCritical')}</div>
              ) : (
                criticalAlerts.map((alert) => (
                  <AlertCard key={alert.activityId} alert={alert} onResolve={handleResolveAlert} t={t} />
                ))
              )}
            </div>
          </section>

          {/* Panel de riesgos emergentes */}
          <section className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(135deg,#fffbeb,#ffffff)] p-6 shadow-[0_16px_32px_rgba(245,158,11,0.08)]">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">{t('emergingRisks')}</h2>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {emergingRisks.length === 0 ? t('noEmerging') : `${emergingRisks.length} riesgo(s)`}
              </p>
            </div>

            <div className="space-y-3">
              {emergingRisks.length === 0 ? (
                <div className="text-center py-8 text-amber-600 dark:text-amber-400 text-sm">{t('noEmerging')}</div>
              ) : (
                emergingRisks.map((alert) => (
                  <AlertCard key={alert.activityId} alert={alert} onResolve={handleResolveAlert} t={t} />
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Lista completa de alertas */}
      {alerts.length > 0 && (
        <section className="app-panel-strong rounded-[2rem] p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t('escalationTitle')}</h2>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.activityId} className={`rounded-2xl border p-4 ${levelColor(alert.level)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${levelBadgeColor(alert.level)}`}>
                        {alert.level === 'critical'
                          ? 'Crítico'
                          : alert.level === 'high'
                            ? 'Alto'
                            : 'Medio'}
                      </span>
                    </div>
                    <p className="text-sm opacity-75 mt-1">{alert.course}</p>
                    <p className="text-sm font-medium mt-2">{t('reason')}: {alert.reason}</p>
                    <p className="text-sm opacity-75 mt-1">
                      {alert.daysLeft === 0
                        ? 'Vence hoy'
                        : alert.daysLeft === 1
                          ? 'Vence mañana'
                          : alert.daysLeft > 0
                            ? `${alert.daysLeft} días`
                            : `${Math.abs(alert.daysLeft)} días atrasado`}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('action')}</span>
                    <span className="font-semibold">{alert.progress}%</span>
                  </div>
                  <p className="text-sm opacity-75">{alert.suggestedAction}</p>
                </div>

                <button
                  onClick={() => handleResolveAlert(alert.activityId)}
                  className="mt-3 px-3 py-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-sm font-medium transition-colors"
                >
                  {t('resolve')}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onResolve,
  t,
}: {
  alert: Alert;
  onResolve: (id: number) => void;
  t: (key: string) => string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${levelColor(alert.level)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-base">{alert.title}</h3>
          <p className="text-sm opacity-75">{alert.course}</p>
          <p className="text-sm font-medium mt-2">{alert.reason}</p>
          <p className="text-xs opacity-75 mt-1">
            {alert.daysLeft === 0
              ? 'Hoy'
              : alert.daysLeft === 1
                ? 'Mañana'
                : alert.daysLeft > 0
                  ? `${alert.daysLeft} días`
                  : `${Math.abs(alert.daysLeft)} d. atrasado`}
          </p>
        </div>
        <button
          onClick={() => onResolve(alert.activityId)}
          className="px-2 py-1 rounded text-xs font-semibold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors whitespace-nowrap"
        >
          {t('resolve')}
        </button>
      </div>
    </div>
  );
}
