'use client';

import { StudentContext } from './ai-context-analyzer';

export type AIResponse = {
  id: string;
  message: string;
  timestamp: Date;
  isUser: boolean;
};

const mockResponses = {
  workloadAnalysis: (context: StudentContext): string => {
    const stressEmoji = context.stressLevel === 'critical' ? '🚨' :
                       context.stressLevel === 'high' ? '😰' :
                       context.stressLevel === 'medium' ? '😐' : '😌';

    const lines = [
      `${stressEmoji} **Análisis de tu Carga Académica**`,
      ``,
      `Tienes **${context.totalActivities}** actividades registradas en total.`,
      `📊 **Detalles:**`,
      `• Pendientes: ${context.pendingActivities} (${context.completionRate}% completadas)`,
      `• Urgentes (próx. 2 días): ${context.urgentActivities}`,
      `• Nivel de estrés: ${context.stressLevel.toUpperCase()}`,
      ``,
      `🎯 **Materias con más presión:**`,
      context.mostPressuredSubjects.length > 0
        ? context.mostPressuredSubjects.map((s, i) => `${i + 1}. ${s}`).join('\n')
        : 'No hay actividades registradas',
    ];

    return lines.join('\n');
  },

  priorityRecommendation: (context: StudentContext): string => {
    const upcoming = context.upcomingDeadlines.slice(0, 3);

    const lines = [
      `⚡ **Recomendación de Prioridades**`,
      ``,
      `Basándome en tus actividades actuales, aquí está el orden recomendado:`,
      ``,
    ];

    if (upcoming.length > 0) {
      lines.push(`🔴 **URGENTES (Próximas 48h):**`);
      upcoming.forEach((activity, i) => {
        const daysLeft = Math.ceil(
          (new Date(activity.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
        );
        lines.push(`${i + 1}. ${activity.title} (${activity.course}) - Vence en ${daysLeft} día(s)`);
      });
    }

    lines.push(
      ``,
      `💡 **Consejo:** Enfócate primero en las tareas urgentes. Dedica 25-50 minutos por sesión.`
    );

    return lines.join('\n');
  },

  performanceEvaluation: (context: StudentContext): string => {
    let rating = '';
    let feedback = '';

    if (context.completionRate >= 80) {
      rating = '🌟 Excelente';
      feedback = 'Vas muy bien. Mantén ese ritmo y no pierdas el enfoque.';
    } else if (context.completionRate >= 60) {
      rating = '😊 Bueno';
      feedback = 'Vas en buen camino. Intenta acelerar un poco el ritmo.';
    } else if (context.completionRate >= 40) {
      rating = '😐 Moderado';
      feedback = 'Necesitas enfocarte más. Hay muchas tareas pendientes.';
    } else {
      rating = '⚠️ Bajo';
      feedback = 'Tu carga de trabajo está muy alta. Prioriza y pide ayuda si es necesario.';
    }

    return [
      `📈 **Evaluación de Desempeño**`,
      ``,
      `Tu progreso actual: ${rating}`,
      ``,
      `📊 Tasa de completación: ${context.completionRate}%`,
      `Actividades pendientes: ${context.pendingActivities}`,
      ``,
      `💭 ${feedback}`,
    ].join('\n');
  },

  optimizationTips: (context: StudentContext): string => {
    const tips = [
      `🚀 **Tips de Optimización Personal**`,
      ``,
    ];

    if (context.stressLevel === 'critical') {
      tips.push(
        `🆘 **ALERTA:** Tu nivel de estrés es crítico.`,
        `• Divide tus tareas en partes más pequeñas`,
        `• Dedica 25-30 min por sesión (técnica Pomodoro)`,
        `• Toma descansos cada hora`,
        ``
      );
    }

    if (context.urgentActivities > 3) {
      tips.push(
        `📌 Tienes muchas tareas urgentes:`,
        `• Enfócate en máximo 3 simultáneamente`,
        `• Comunica plazos ajustados a profesores si es necesario`,
        ``
      );
    }

    tips.push(
      `✅ **Recomendaciones generales:**`,
      `1. Haz revisiones periódicas de tu planner`,
      `2. Marca subtareas conforme avanzas`,
      `3. Revisa diariamente tu bandeja de entrada`,
      `4. Dedica tiempo a descansar (bienestar)`,
      ``,
      `¿Necesitas ayuda con algo específico? Pregúntame directamente.`
    );

    return tips.join('\n');
  },
};

export function generateAIResponse(
  question: string,
  context: StudentContext
): string {
  const lowerQuestion = question.toLowerCase();

  // Detectar intención de la pregunta
  if (
    lowerQuestion.includes('carga') ||
    lowerQuestion.includes('tengo') ||
    lowerQuestion.includes('cuántas')
  ) {
    return mockResponses.workloadAnalysis(context);
  }

  if (
    lowerQuestion.includes('qué') ||
    lowerQuestion.includes('prioridad') ||
    lowerQuestion.includes('siguiente')
  ) {
    return mockResponses.priorityRecommendation(context);
  }

  if (
    lowerQuestion.includes('voy') ||
    lowerQuestion.includes('desempeño') ||
    lowerQuestion.includes('académicamente')
  ) {
    return mockResponses.performanceEvaluation(context);
  }

  if (
    lowerQuestion.includes('cómo') ||
    lowerQuestion.includes('tips') ||
    lowerQuestion.includes('mejorar')
  ) {
    return mockResponses.optimizationTips(context);
  }

  // Respuesta por defecto
  return [
    `👋 **Hola, soy tu Asistente de Académico**`,
    ``,
    `Puedo ayudarte con:`,
    `• Analizar tu carga de trabajo`,
    `• Recomendarte prioridades`,
    `• Evaluar tu desempeño académico`,
    `• Darte tips de optimización`,
    ``,
    `¿Cuál es tu pregunta? Algunos ejemplos:`,
    `• "¿Cuál es mi carga de trabajo?"`,
    `• "¿Cuál es mi próxima prioridad?"`,
    `• "¿Voy bien académicamente?"`,
    `• "¿Cómo puedo mejorar mi productividad?"`,
  ].join('\n');
}
