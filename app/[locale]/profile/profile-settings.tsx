"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { buildApiUrl } from '@/lib/api';
import { persistClientSession, useAuthSession } from '@/lib/auth/client';
import type { AuthSession } from '@/lib/auth/shared';

type ProfileCopy = {
  badge: string;
  title: string;
  subtitle: string;
  accountTitle: string;
  accountBody: string;
  accountSince: string;
  formTitle: string;
  formBody: string;
  nameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordHelp: string;
  save: string;
  saving: string;
  success: string;
  placeholders: {
    name: string;
    email: string;
    password: string;
  };
};

export function ProfileSettings({ copy }: { copy: ProfileCopy }) {
  const session = useAuthSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(session?.name ?? '');
  const [email, setEmail] = useState(session?.email ?? '');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const response = await fetch(buildApiUrl('/api/auth/profile'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; user?: AuthSession } | null;

    if (!response.ok) {
      setFeedback({
        type: 'error',
        message: payload?.error ?? 'No fue posible actualizar tu perfil.',
      });
      return;
    }

    setPassword('');
    if (payload?.user) {
      persistClientSession(payload.user);
    }
    setFeedback({ type: 'success', message: copy.success });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-8 py-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <p className="app-kicker text-xs font-bold uppercase">{copy.badge}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-zinc-100 md:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-300">{copy.subtitle}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="app-panel-strong rounded-[2rem] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#157a6e,#115e58)] text-2xl font-black text-white shadow-[0_16px_34px_rgba(21,122,110,0.22)]">
              {(session?.name ?? 'C').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.accountTitle}</p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-100">{session?.name ?? 'ClearUp'}</h2>
              <p className="text-sm text-[var(--muted)]">{session?.email ?? 'demo@clearup.app'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(21,122,110,0.08),rgba(255,255,255,0.92))] p-5 dark:bg-[linear-gradient(135deg,rgba(84,194,179,0.08),rgba(10,22,28,0.92))]">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.accountBody}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {copy.accountSince} {new Date().getFullYear()}
            </p>
          </div>
        </section>

        <section className="app-panel-strong rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{copy.formTitle}</p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-100">{copy.formBody}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.nameLabel}</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={copy.placeholders.name}
                className="app-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.emailLabel}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.placeholders.email}
                className="app-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.passwordLabel}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={copy.placeholders.password}
                className="app-input"
              />
              <p className="text-xs text-[var(--muted)]">{copy.passwordHelp}</p>
            </label>

            {feedback && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[linear-gradient(135deg,#157a6e,#115e58)] px-8 py-3 font-bold text-white shadow-[0_16px_34px_rgba(21,122,110,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? copy.saving : copy.save}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
