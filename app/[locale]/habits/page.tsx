'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

type Habit = {
  id: string;
  name: string;
  targetPerWeek: number;
  lastCheckInDates: string[]; // ISO dates (YYYY-MM-DD)
};

const DEFAULT_HABITS: Habit[] = [
  { id: 'sleep', name: 'Dormir 8 horas', targetPerWeek: 7, lastCheckInDates: [] },
  { id: 'exercise', name: 'Hacer ejercicio', targetPerWeek: 3, lastCheckInDates: [] },
  { id: 'reading', name: 'Lectura personal', targetPerWeek: 4, lastCheckInDates: [] },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort();
  let streak = 0;
  let cursor = todayISO();

  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    const diff = daysBetween(d, cursor);
    if (diff === 0) {
      streak += 1;
      cursor = d;
    } else if (diff === 1) {
      streak += 1;
      cursor = d;
    } else if (diff > 1) {
      break;
    }
  }
  return streak;
}

export default function HabitsPage() {
  const t = useTranslations('Navigation');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('clearup_habits');
      if (stored) {
        setHabits(JSON.parse(stored) as Habit[]);
      } else {
        setHabits(DEFAULT_HABITS);
      }
    } catch {
      setHabits(DEFAULT_HABITS);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('clearup_habits', JSON.stringify(habits));
    } catch {
      // ignore
    }
  }, [habits]);

  const handleCheckIn = (id: string) => {
    const today = todayISO();
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              lastCheckInDates: h.lastCheckInDates.includes(today)
                ? h.lastCheckInDates
                : [...h.lastCheckInDates, today],
            }
          : h,
      ),
    );
  };

  const handleAddHabit = () => {
    const name = newHabitName.trim();
    if (!name) return;
    setHabits((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        targetPerWeek: 3,
        lastCheckInDates: [],
      },
    ]);
    setNewHabitName('');
  };

  const handleRemoveHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const weekSummary = useMemo(() => {
    const startOfWeek = (() => {
      const d = new Date();
      const day = d.getDay(); // 0-6, Sunday is 0
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
      d.setDate(diff);
      return d.toISOString().slice(0, 10);
    })();
    const endOfWeek = (() => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + 6);
      return d.toISOString().slice(0, 10);
    })();

    const countInWeek = (dates: string[]) =>
      dates.filter((d) => d >= startOfWeek && d <= endOfWeek).length;

    const fulfilled = habits.filter(
      (h) => countInWeek(h.lastCheckInDates) >= h.targetPerWeek,
    ).length;

    return {
      startOfWeek,
      endOfWeek,
      fulfilled,
      total: habits.length,
    };
  }, [habits]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t('habits')}
        </h1>
        <p className="text-lg text-zinc-500 mt-2">
          Mantén el equilibrio entre tu vida académica y personal con hábitos que no dependen de
          una materia.
        </p>
      </header>

      {/* Resumen semanal */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Bienestar de esta semana
          </p>
          <p className="text-sm text-emerald-900/80 dark:text-emerald-100 mt-1">
            {weekSummary.fulfilled} de {weekSummary.total} hábitos en objetivo.
          </p>
        </div>
        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-200">
          Del {weekSummary.startOfWeek} al {weekSummary.endOfWeek}
        </p>
      </div>

      {/* Grid de Hábitos (HU-12) */}
      <div className="grid gap-4">
        {habits.map((habito) => {
          const streak = computeStreak(habito.lastCheckInDates);
          const todayDone = habito.lastCheckInDates.includes(todayISO());
          return (
            <div
              key={habito.id}
              className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                  {todayDone ? '✓' : '•'}
                </div>
                <div>
                  <h3 className="font-bold">{habito.name}</h3>
                  <p className="text-xs text-zinc-500">
                    Racha de {streak} día{streak === 1 ? '' : 's'} · Objetivo semanal:{' '}
                    {habito.targetPerWeek}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCheckIn(habito.id)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {todayDone ? 'Ya registrado hoy' : 'Registrar hoy'}
                </button>
                <button
                  onClick={() => handleRemoveHabit(habito.id)}
                  className="px-2 py-1 text-[11px] rounded-full border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Quitar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nuevo hábito */}
      <div className="mt-4 p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Agregar hábito personal
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ej. Meditar 10 minutos, salir a caminar..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAddHabit}
            disabled={!newHabitName.trim()}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold disabled:opacity-40"
          >
            Guardar hábito
          </button>
        </div>
        <p className="text-[11px] text-zinc-400">
          Estos hábitos no dependen de una materia y te ayudan a ver el balance entre vida personal
          y estudio.
        </p>
      </div>
    </div>
  );
}