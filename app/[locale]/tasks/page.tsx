import { getTranslations } from 'next-intl/server';

import { TasksManager, type TasksCopy } from './tasks-manager';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TasksPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Tasks' });

  const copy: TasksCopy = {
    title: t('title'),
    subtitle: t('subtitle'),
    newActivity: t('newActivity'),
    editActivity: t('editActivity'),
    formDescription: t('formDescription'),
    saveActivity: t('saveActivity'),
    updateActivity: t('updateActivity'),
    resetForm: t('resetForm'),
    fields: {
      title: t('fields.title'),
      course: t('fields.course'),
      type: t('fields.type'),
      dueDate: t('fields.dueDate'),
      priority: t('fields.priority'),
      status: t('fields.status'),
      reminder: t('fields.reminder'),
      subtasks: t('fields.subtasks'),
      progress: t('fields.progress'),
    },
    placeholders: {
      title: t('placeholders.title'),
      course: t('placeholders.course'),
      subtasks: t('placeholders.subtasks'),
    },
    types: {
      assignment: t('types.assignment'),
      exam: t('types.exam'),
      project: t('types.project'),
    },
    priorities: {
      high: t('priorities.high'),
      medium: t('priorities.medium'),
      low: t('priorities.low'),
    },
    statuses: {
      pending: t('statuses.pending'),
      inProgress: t('statuses.inProgress'),
      completed: t('statuses.completed'),
    },
    summary: {
      total: t('summary.total'),
      dueSoon: t('summary.dueSoon'),
      highPriority: t('summary.highPriority'),
      completed: t('summary.completed'),
    },
    actions: {
      edit: t('actions.edit'),
      delete: t('actions.delete'),
      toggleStatus: t('actions.toggleStatus'),
      clearReminder: t('actions.clearReminder'),
      addReminder: t('actions.addReminder'),
      resolveAlert: t('actions.resolveAlert'),
    },
    labels: {
      progressCompleted: t('labels.progressCompleted'),
      subtasksCompleted: t('labels.subtasksCompleted'),
      reminderNone: t('labels.reminderNone'),
      reminderAt: t('labels.reminderAt'),
      dueLabel: t('labels.dueLabel'),
      emptyTitle: t('labels.emptyTitle'),
      activitiesList: t('labels.activitiesList'),
      smartReminders: t('labels.smartReminders'),
      escalationPanel: t('labels.escalationPanel'),
      alertsReady: t('labels.alertsReady'),
      noAlerts: t('labels.noAlerts'),
      riskLevel: t('labels.riskLevel'),
      suggestedAction: t('labels.suggestedAction'),
      smartRule: t('labels.smartRule'),
      noActivities: t('labels.noActivities'),
      basicInfo: t('labels.basicInfo'),
      planningInfo: t('labels.planningInfo'),
      subtasksInfo: t('labels.subtasksInfo'),
      emptyHint: t('labels.emptyHint'),
      listEyebrow: t('labels.listEyebrow'),
      guideTitle: t('labels.guideTitle'),
      chooseType: t('labels.chooseType'),
      choosePriority: t('labels.choosePriority'),
      chooseStatus: t('labels.chooseStatus'),
      previewTitle: t('labels.previewTitle'),
      previewEmpty: t('labels.previewEmpty'),
      autoProgressHelp: t('labels.autoProgressHelp'),
    },
    escalation: {
      low: t('escalation.low'),
      medium: t('escalation.medium'),
      high: t('escalation.high'),
      critical: t('escalation.critical'),
    },
    smartMessages: {
      criticalDeadline: t('smartMessages.criticalDeadline'),
      highPriorityStalled: t('smartMessages.highPriorityStalled'),
      reminderMissing: t('smartMessages.reminderMissing'),
      lowProgress: t('smartMessages.lowProgress'),
      onTrack: t('smartMessages.onTrack'),
      criticalAction: t('smartMessages.criticalAction'),
      highAction: t('smartMessages.highAction'),
      reminderAction: t('smartMessages.reminderAction'),
      progressAction: t('smartMessages.progressAction'),
    },
  };

  return <TasksManager copy={copy} />;
}
