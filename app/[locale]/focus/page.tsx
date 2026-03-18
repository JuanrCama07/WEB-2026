'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

const DEFAULT_POMODORO_MINUTES = 25;

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
  const [task, setTask] = useState('Laboratorio de Redes');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('focusSessions');
      if (stored) {
        setSessions(JSON.parse(stored) as Session[]);
      }
    } catch {
      // ignoramos errores de parseo
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('focusSessions', JSON.stringify(sessions));
    } catch {
      // ignoramos errores de escritura
    }
  }, [sessions]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      setIsRunning(false);
      setSessions((prev) => [
        {
          id: crypto.randomUUID(),
          task,
          seconds: DEFAULT_POMODORO_MINUTES * 60,
          finishedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, secondsLeft, task]);

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
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t('focus')}
        </h1>
        <p className="text-lg text-zinc-500 mt-2">
          Elimina distracciones y concéntrate en una sola tarea.
        </p>
      </header>

      {/* Temporizador Pomodoro (HU-10) */}
      <div className="relative flex items-center justify-center">
        <div className="w-72 h-72 rounded-full border-8 border-blue-600/20 flex flex-col items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 rounded-full bg-blue-600/10 origin-bottom"
            style={{ transform: `scaleY(${progress / 100})` }}
          />
          <span className="relative text-6xl font-mono font-bold text-zinc-900 dark:text-white">
            {formatTime(secondsLeft)}
          </span>
          <span className="relative text-sm font-medium text-zinc-400 uppercase tracking-widest mt-2">
            {currentLabel}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleStartPause}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          {isRunning ? 'Pausar' : 'Comenzar sesión'}
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full font-bold"
        >
          Reiniciar
        </button>
      </div>

      {/* Tarea vinculada */}
      <div className="w-full max-w-md p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-3 shadow-sm">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
          <span className="text-sm text-zinc-500 font-medium">Trabajando en:</span>
        </div>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          placeholder="Escribe o pega el nombre de la tarea de tu backlog..."
        />
        <p className="text-xs text-zinc-400">
          El tiempo completado se registrará para esta tarea cada vez que termine un bloque de
          Pomodoro.
        </p>
      </div>

      {/* Historial simple de sesiones */}
      {sessions.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Sesiones recientes
          </h2>
          <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-300">
            {sessions.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-white/60 dark:bg-zinc-900/60"
              >
                <span className="truncate max-w-[60%] font-medium">{s.task}</span>
                <span className="ml-2 font-mono text-[11px]">
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
  );
}