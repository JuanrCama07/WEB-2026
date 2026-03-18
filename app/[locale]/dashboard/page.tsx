import { getTranslations } from 'next-intl/server';

import { DashboardClient } from './dashboard-client';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  const copy = {
    title: t('title'),
    subtitle: t('subtitle'),
    metrics: {
      totalActivities: t('metrics.totalActivities'),
      dueSoon: t('metrics.dueSoon'),
      averageProgress: t('metrics.averageProgress'),
      critical: t('metrics.critical'),
    },
    details: {
      totalActivities: t('details.totalActivities'),
      dueSoon: t('details.dueSoon'),
      averageProgress: t('details.averageProgress'),
      critical: t('details.critical'),
    },
    labels: {
      weekOverview: t('labels.weekOverview'),
      priorityRadar: t('labels.priorityRadar'),
      decisionSupport: t('labels.decisionSupport'),
      currentProgress: t('labels.currentProgress'),
      loadBalance: t('labels.loadBalance'),
      timeDistribution: t('labels.timeDistribution'),
      productivity: t('labels.productivity'),
      weeklySignal: t('labels.weeklySignal'),
      recommendation: t('labels.recommendation'),
      attackFirst: t('labels.attackFirst'),
      emptyStateTitle: t('labels.emptyStateTitle'),
      emptyStateBody: t('labels.emptyStateBody'),
      noRecommendation: t('labels.noRecommendation'),
      distributionByType: t('labels.distributionByType'),
    },
    urgency: {
      critical: t('urgency.critical'),
      high: t('urgency.high'),
      medium: t('urgency.medium'),
      low: t('urgency.low'),
    },
    types: {
      assignment: t('types.assignment'),
      exam: t('types.exam'),
      project: t('types.project'),
    },
    insights: {
      completed: t('insights.completed'),
      avgProgress: t('insights.avgProgress'),
      focusBlocks: t('insights.focusBlocks'),
      signalPrefix: t('insights.signalPrefix'),
    },
  };

  return <DashboardClient copy={copy} />;
}
