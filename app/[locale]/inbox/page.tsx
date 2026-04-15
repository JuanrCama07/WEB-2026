'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAuthSession } from '@/lib/auth/client';
import { getScopedStorageKey } from '@/lib/user-storage';

type IdeaItem = {
  id: string;
  title: string;
  createdAt: string;
  converted: boolean;
};

const STORAGE_KEY = 'clearup_ideas';

function loadIdeas(userId?: string): IdeaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const storageKey = userId ? getScopedStorageKey(STORAGE_KEY, userId) : STORAGE_KEY;
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveIdeas(ideas: IdeaItem[], userId?: string) {
  if (typeof window === 'undefined') return;
  const storageKey = userId ? getScopedStorageKey(STORAGE_KEY, userId) : STORAGE_KEY;
  window.localStorage.setItem(storageKey, JSON.stringify(ideas));
}

export default function InboxPage() {
  const t = useTranslations('Inbox');
  const session = useAuthSession();
  const userId = session?.id;
  const [ideas, setIdeas] = useState<IdeaItem[]>(() => loadIdeas(userId));
  const [input, setInput] = useState('');

  const handleAddIdea = () => {
    if (input.trim()) {
      const newIdea: IdeaItem = {
        id: Date.now().toString(),
        title: input,
        createdAt: new Date().toISOString(),
        converted: false,
      };
      const updated = [...ideas, newIdea];
      setIdeas(updated);
      saveIdeas(updated, userId);
      setInput('');
    }
  };

  const handleDeleteIdea = (id: string) => {
    const updated = ideas.filter(idea => idea.id !== id);
    setIdeas(updated);
    saveIdeas(updated, userId);
  };

  const handleConvertToTask = (idea: IdeaItem) => {
    const updated = ideas.map(i => i.id === idea.id ? { ...i, converted: true } : i);
    setIdeas(updated);
    saveIdeas(updated, userId);
  };

  const unconverted = ideas.filter(i => !i.converted);

  return (
    <div className="space-y-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <p className="app-kicker text-xs font-bold uppercase">Capture Layer</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-600">{t('subtitle')}</p>
      </header>

      <section className="app-panel-strong rounded-[2rem] p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{t('quickAdd')}</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
            placeholder={t('placeholder')}
            className="app-input flex-1 text-sm"
          />
          <button
            onClick={handleAddIdea}
            className="rounded-2xl bg-[linear-gradient(135deg,#0f6cbd,#0b4f8a)] px-6 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(15,108,189,0.2)] transition hover:brightness-105"
          >
            {t('addButton')}
          </button>
        </div>
      </section>

      <section className="app-panel-strong rounded-[2rem] p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t('ideas')} ({unconverted.length})</h2>

        {unconverted.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t('empty')}</p>
            <p className="text-zinc-500 dark:text-zinc-400">{t('emptyBody')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unconverted.map((idea) => (
              <div key={idea.id} className="rounded-[1.6rem] border border-zinc-200 bg-zinc-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white">{idea.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {new Date(idea.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConvertToTask(idea)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                    >
                      {t('convertToTask')}
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {ideas.filter(i => i.converted).length > 0 && (
        <section className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] p-6 shadow-[0_14px_30px_rgba(16,185,129,0.08)]">
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">{t('classify')} ({ideas.filter(i => i.converted).length})</h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Estas ideas se han convertido en tareas. Ve a &quot;Mis Entregas&quot; para editarlas y clasificarlas completamente.
          </p>
        </section>
      )}
    </div>
  );
}
