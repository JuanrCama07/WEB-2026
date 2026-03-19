'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type IdeaItem = {
  id: string;
  title: string;
  createdAt: string;
  converted: boolean;
};

function loadIdeas(): IdeaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem('clearup_ideas');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveIdeas(ideas: IdeaItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('clearup_ideas', JSON.stringify(ideas));
}

export default function InboxPage() {
  const t = useTranslations('Inbox');
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setIdeas(loadIdeas());
  }, []);

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
      saveIdeas(updated);
      setInput('');
    }
  };

  const handleDeleteIdea = (id: string) => {
    const updated = ideas.filter(idea => idea.id !== id);
    setIdeas(updated);
    saveIdeas(updated);
  };

  const handleConvertToTask = (idea: IdeaItem) => {
    const updated = ideas.map(i => i.id === idea.id ? { ...i, converted: true } : i);
    setIdeas(updated);
    saveIdeas(updated);
  };

  const unconverted = ideas.filter(i => !i.converted);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{t('title')}</h1>
        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{t('subtitle')}</p>
      </header>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{t('quickAdd')}</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
            placeholder={t('placeholder')}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddIdea}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold text-white transition-colors"
          >
            {t('addButton')}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t('ideas')} ({unconverted.length})</h2>

        {unconverted.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t('empty')}</p>
            <p className="text-zinc-500 dark:text-zinc-400">{t('emptyBody')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unconverted.map((idea) => (
              <div key={idea.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
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
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">{t('classify')} ({ideas.filter(i => i.converted).length})</h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Estas ideas se han convertido en tareas. Ve a &quot;Mis Entregas&quot; para editarlas y clasificarlas completamente.
          </p>
        </section>
      )}
    </div>
  );
}
