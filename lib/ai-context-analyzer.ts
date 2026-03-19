import { Activity } from './activities-store';

export interface StudentContext {
  totalActivities: number;
  pendingActivities: number;
  urgentActivities: number;
  completionRate: number;
  averagePriority: 'low' | 'medium' | 'high';
  stressLevel: 'low' | 'medium' | 'high' | 'critical';
  upcomingDeadlines: Activity[];
  mostPressuredSubjects: string[];
}

export function analyzeStudentContext(activities: Activity[]): StudentContext {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Contar actividades por estado
  const total = activities.length;
  const pending = activities.filter(a => a.status === 'pending').length;
  const completed = activities.filter(a => a.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Identificar actividades urgentes (próximas 2 días)
  const urgent = activities.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate <= twoDaysFromNow && a.status !== 'completed';
  });

  // Actividades próximas (próxima semana)
  const upcoming = activities.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate <= oneWeekFromNow && dueDate > now && a.status !== 'completed';
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Calcular prioridad promedio
  const priorities = activities.map(a => a.priority || 'medium');
  const priorityScore =
    (priorities.filter(p => p === 'high').length * 3 +
      priorities.filter(p => p === 'medium').length * 2 +
      priorities.filter(p => p === 'low').length * 1) /
    Math.max(priorities.length, 1);

  let averagePriority: 'low' | 'medium' | 'high' = 'medium';
  if (priorityScore >= 2.5) averagePriority = 'high';
  else if (priorityScore >= 1.5) averagePriority = 'medium';
  else averagePriority = 'low';

  // Determinar nivel de estrés basado en carga
  let stressLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const stressScore =
    (pending / Math.max(total, 1)) * 100 +
    (urgent.length * 15) +
    (completionRate < 30 ? 30 : completionRate < 50 ? 15 : 0);

  if (stressScore > 80) stressLevel = 'critical';
  else if (stressScore > 50) stressLevel = 'high';
  else if (stressScore > 25) stressLevel = 'medium';
  else stressLevel = 'low';

  // Materias con más presión
  const subjectMap = new Map<string, number>();
  activities.forEach(a => {
    if (!a.course) return;
    const current = subjectMap.get(a.course) || 0;
    const weight =
      a.priority === 'high' ? 3 :
      a.priority === 'medium' ? 2 : 1;
    subjectMap.set(a.course, current + weight);
  });

  const mostPressuredSubjects = Array.from(subjectMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([subject]) => subject);

  return {
    totalActivities: total,
    pendingActivities: pending,
    urgentActivities: urgent.length,
    completionRate,
    averagePriority,
    stressLevel,
    upcomingDeadlines: upcoming.slice(0, 5),
    mostPressuredSubjects,
  };
}

export function getStressEmoji(stressLevel: string): string {
  switch (stressLevel) {
    case 'critical': return '🚨';
    case 'high': return '😰';
    case 'medium': return '😐';
    default: return '😌';
  }
}
