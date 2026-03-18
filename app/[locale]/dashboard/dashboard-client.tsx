"use client";

import { useMemo } from 'react';

import { type Activity, type ActivityType, useStoredActivities } from '@/lib/activities-store';

type DashboardCopy = {
  title: string;
  subtitle: string;
  metrics: Record<'totalActivities' | 'dueSoon' | 'averageProgress' | 'critical', string>;
  details: Record<'totalActivities' | 'dueSoon' | 'averageProgress' | 'critical', string>;
  labels: Record<'weekOverview' | 'priorityRadar' | 'decisionSupport' | 'currentProgress' | 'loadBalance' | 'timeDistribution' | 'productivity' | 'weeklySignal' | 'recommendation' | 'attackFirst' | 'emptyStateTitle' | 'emptyStateBody' | 'noRecommendation' | 'distributionByType', string>;
  urgency: Record<'critical' | 'high' | 'medium' | 'low', string>;
  types: Record<ActivityType, string>;
  insights: Record<'completed' | 'avgProgress' | 'focusBlocks' | 'signalPrefix', string>;
};

const today = new Date('2026-03-18T00:00:00');

export function DashboardClient({ copy }: { copy: DashboardCopy }) {
  const activities = useStoredActivities();

  const summary = useMemo(() => {
    const dueSoon = activities.filter((activity) => {
      const daysLeft = getDaysLeft(activity.dueDate);
      return daysLeft >= 0 && daysLeft <= 7 && activity.status !== 'completed';
    }).length;

    const completed = activities.filter((activity) => activity.status === 'completed').length;
    const critical = activities.filter((activity) => getUrgency(activity) === 'critical').length;
    const averageProgress =
      activities.length === 0
        ? 0
        : Math.round(activities.reduce((total, activity) => total + activity.progress, 0) / activities.length);

    return {
      totalActivities: activities.length,
      dueSoon,
      averageProgress,
      critical,
      completed,
    };
  }, [activities]);

  const focusItems = useMemo(() => {
    return [...activities]
      .sort((left, right) => urgencyScore(getUrgency(right)) - urgencyScore(getUrgency(left)))
      .slice(0, 4);
  }, [activities]);

  const distribution = useMemo(() => {
    return [
      { type: 'assignment' as const, count: activities.filter((activity) => activity.type === 'assignment').length, accent: 'bg-sky-500' },
      { type: 'exam' as const, count: activities.filter((activity) => activity.type === 'exam').length, accent: 'bg-rose-500' },
      { type: 'project' as const, count: activities.filter((activity) => activity.type === 'project').length, accent: 'bg-emerald-500' },
    ];
  }, [activities]);

  const recommendation = focusItems[0];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">{copy.title}</h1>
        <p className="max-w-3xl text-lg text-zinc-600">{copy.subtitle}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={copy.metrics.totalActivities} value={String(summary.totalActivities)} detail={copy.details.totalActivities} accent="bg-sky-100 text-sky-700" />
        <MetricCard label={copy.metrics.dueSoon} value={String(summary.dueSoon)} detail={copy.details.dueSoon} accent="bg-amber-100 text-amber-700" />
        <MetricCard label={copy.metrics.averageProgress} value={`${summary.averageProgress}%`} detail={copy.details.averageProgress} accent="bg-emerald-100 text-emerald-700" />
        <MetricCard label={copy.metrics.critical} value={String(summary.critical)} detail={copy.details.critical} accent="bg-rose-100 text-rose-700" />
      </section>

      {activities.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900">{copy.labels.emptyStateTitle}</h2>
          <p className="mt-3 text-sm text-zinc-500">{copy.labels.emptyStateBody}</p>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">{copy.labels.weekOverview}</p>
                <h2 className="mt-2 text-2xl font-bold text-zinc-900">{copy.labels.priorityRadar}</h2>
              </div>
              <div className="rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700">
                {copy.labels.decisionSupport}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {focusItems.map((item) => {
                const urgency = getUrgency(item);

                return (
                  <div key={item.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                        <p className="text-sm text-zinc-500">{item.course}</p>
                      </div>
                      <UrgencyBadge label={copy.urgency[urgency]} urgency={urgency} />
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
                        <span>{copy.labels.currentProgress}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white">
                        <div className="h-3 rounded-full bg-sky-500" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">{copy.labels.loadBalance}</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">{copy.labels.distributionByType}</h2>

              <div className="mt-6 space-y-4">
                {distribution.map((block) => (
                  <div key={block.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-zinc-700">
                      <span>{copy.types[block.type]}</span>
                      <span>{block.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-100">
                      <div
                        className={`h-3 rounded-full ${block.accent}`}
                        style={{ width: `${activities.length === 0 ? 0 : (block.count / activities.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">{copy.labels.productivity}</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">{copy.labels.weeklySignal}</h2>
              <p className="mt-3 text-sm text-zinc-600">
                {copy.insights.signalPrefix} {summary.completed}/{activities.length}.
              </p>

              <div className="mt-5 grid gap-3">
                <InsightRow label={copy.insights.completed} value={`${summary.completed}/${activities.length}`} />
                <InsightRow label={copy.insights.avgProgress} value={`${summary.averageProgress}%`} />
                <InsightRow label={copy.insights.focusBlocks} value={String(focusItems.length)} />
              </div>
            </article>

            <article className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">{copy.labels.recommendation}</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">{copy.labels.attackFirst}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-700">
                {recommendation
                  ? `${recommendation.title} (${recommendation.course})`
                  : copy.labels.noRecommendation}
              </p>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
        {label}
      </div>
      <p className="mt-4 text-4xl font-black tracking-tight text-zinc-900">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </article>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className="text-lg font-bold text-zinc-900">{value}</span>
    </div>
  );
}

function UrgencyBadge({
  label,
  urgency,
}: {
  label: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}) {
  const className =
    urgency === 'critical'
      ? 'bg-rose-600 text-white'
      : urgency === 'high'
        ? 'bg-orange-100 text-orange-700'
        : urgency === 'medium'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-emerald-100 text-emerald-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function getDaysLeft(dueDate: string) {
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgency(activity: Activity) {
  const daysLeft = getDaysLeft(activity.dueDate);

  if (daysLeft <= 1 && activity.status !== 'completed') {
    return 'critical' as const;
  }

  if (activity.priority === 'high' || daysLeft <= 3) {
    return 'high' as const;
  }

  if (activity.progress < 60) {
    return 'medium' as const;
  }

  return 'low' as const;
}

function urgencyScore(urgency: 'critical' | 'high' | 'medium' | 'low') {
  return urgency === 'critical' ? 4 : urgency === 'high' ? 3 : urgency === 'medium' ? 2 : 1;
}
