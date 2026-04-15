'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAuthSession } from '@/lib/auth/client';
import { getScopedStorageKey } from '@/lib/user-storage';

const DEFAULT_POMODORO_MINUTES = 25;
const STORAGE_KEY = 'focusSessions';

type Session = {
  id: string;
  task: string;
  seconds: number;
  finishedAt: string;
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusPage() {
  const t = useTranslations('Navigation');
  const session = useAuthSession();
  const userId = session?.id;
  const [task, setTask] = useState('Laboratorio de Redes');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storageKey = userId ? getScopedStorageKey(STORAGE_KEY, userId) : STORAGE_KEY;
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as Session[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const storageKey = userId ? getScopedStorageKey(STORAGE_KEY, userId) : STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch {
      // ignoramos errores de escritura
    }
  }, [sessions, userId]);

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setIsRunning(false);
          setSessions((current) => [
            {
              id: crypto.randomUUID(),
              task,
              seconds: DEFAULT_POMODORO_MINUTES * 60,
              finishedAt: new Date().toISOString(),
            },
            ...current,
          ]);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, task]);

  const progress = useMemo(() => {
    const total = DEFAULT_POMODORO_MINUTES * 60;
    return ((total - secondsLeft) / total) * 100;
  }, [secondsLeft]);

  const handleStartPause = () => {
    if (secondsLeft <= 0) {
      setSecondsLeft(DEFAULT_POMODORO_MINUTES * 60);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(DEFAULT_POMODORO_MINUTES * 60);
  };

  const currentLabel = isRunning ? 'En curso' : secondsLeft === 0 ? 'Completado' : 'Listo';

  return (
    <div className="space-y-10 py-8">
      <header className="app-hero rounded-[2rem] px-7 py-8 text-center">
        <p className="app-kicker text-xs font-bold uppercase">Deep Work</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-zinc-100 md:text-5xl">
          {t('focus')}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-300">
          Elimina distracciones y concéntrate en una sola tarea.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="app-panel-strong flex flex-col items-center justify-center rounded-[2rem] p-8">
          <div className="relative flex items-center justify-center">
            <div className="focus-timer-shell relative flex h-80 w-80 flex-col items-center justify-center overflow-hidden rounded-full border-[10px] border-blue-600/20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%),linear-gradient(180deg,#ffffff,#f8fbff)] shadow-[inset_0_-20px_40px_rgba(15,23,42,0.04)]">
              <div
                className="focus-timer-fill absolute inset-0 origin-bottom rounded-full bg-blue-600/10"
                style={{ transform: `scaleY(${progress / 100})` }}
              />
              <span className="focus-timer-time relative font-mono text-6xl font-bold text-zinc-950">
                {formatTime(secondsLeft)}
              </span>
              <span className="focus-timer-status relative mt-2 text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">
                {currentLabel}
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleStartPause}
              className="rounded-full bg-[linear-gradient(135deg,#157a6e,#115e58)] px-8 py-3 font-bold text-white shadow-[0_16px_34px_rgba(21,122,110,0.24)] transition hover:brightness-105"
            >
              {isRunning ? 'Pausar' : 'Comenzar sesión'}
            </button>
            <button
              onClick={handleReset}
              className="rounded-full border border-zinc-200 bg-white px-8 py-3 font-bold text-zinc-600 dark:border-[#28505a] dark:bg-[#102229] dark:text-[#e5f7f5]"
            >
              Reiniciar
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <div className="app-panel-strong w-full rounded-[2rem] p-5">
            <div className="flex items-center">
              <div className="mr-3 h-2 w-2 rounded-full bg-teal-500" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-100">Trabajando en:</span>
            </div>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="app-input mt-4 text-sm"
              placeholder="Escribe o pega el nombre de la tarea de tu backlog..."
            />
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-200">
              El tiempo completado se registrará para esta tarea cada vez que termine un bloque de
              Pomodoro.
            </p>
          </div>

          {sessions.length > 0 && (
            <div className="app-panel-strong w-full rounded-[2rem] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-teal-100">
                Sesiones recientes
              </h2>
              <ul className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-200">
                {sessions.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-3 dark:border-[#28505a] dark:bg-[#102229]"
                  >
                    <span className="max-w-[60%] truncate font-medium text-zinc-700 dark:text-zinc-100">{s.task}</span>
                    <span className="ml-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-200">
                      {formatTime(s.seconds)} ·{' '}
                      {new Date(s.finishedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
