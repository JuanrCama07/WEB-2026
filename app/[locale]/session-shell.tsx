"use client";

import { useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { AuthSession } from '@/lib/auth/shared';

import { AppIcon, type AppIconName } from './app-icon';
import { ThemeToggle } from './theme-toggle';

type MenuItem = {
  name: string;
  href: string;
  icon: AppIconName;
};

type SessionShellCopy = {
  tools: string;
  switchLanguage: string;
  signOut: string;
  guest: string;
};

export function SessionShell({
  children,
  locale,
  session,
  menuItems,
  additionalItems,
  copy,
}: {
  children: React.ReactNode;
  locale: string;
  session: AuthSession | null;
  menuItems: MenuItem[];
  additionalItems: MenuItem[];
  copy: SessionShellCopy;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isAuthPage = pathname === `/${locale}/sign-in`;
  const currentSection = pathname.replace(`/${locale}/`, '').split('/')[0];

  async function handleSignOut() {
    startTransition(async () => {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      router.replace(`/${locale}/sign-in`);
      router.refresh();
    });
  }

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <nav className="app-panel m-4 flex w-76 flex-col gap-7 rounded-[2.2rem] px-6 py-7 text-zinc-900">
        <div className="space-y-5">
          <Link href={`/${locale}`} className="flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#157a6e,#115e58)] text-xl font-black text-white shadow-[0_14px_34px_rgba(21,122,110,0.24)]">
              C
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--brand)]">ClearUp</h1>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">Student OS</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = currentSection === item.href;

            return (
              <Link
                key={item.href}
                href={`/${locale}/${item.href}`}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 font-medium transition ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,#157a6e,#115e58)] text-white shadow-[0_16px_32px_rgba(21,122,110,0.22)]'
                    : 'text-[var(--muted)] hover:bg-white/80 hover:text-[var(--brand)]'
                }`}
              >
                <span
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl border transition ${
                    isActive
                      ? 'border-white/30 bg-white/15 text-white'
                      : 'border-[var(--line)] bg-white/85 text-zinc-700 group-hover:border-[var(--glow)] group-hover:text-[var(--brand)]'
                  } ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                >
                  <AppIcon name={item.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">{item.name}</span>
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-white/80' : 'bg-transparent group-hover:bg-[var(--glow)]'}`} />
              </Link>
            );
          })}
        </div>

        <div className="border-t border-zinc-200/70 pt-4">
          <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{copy.tools}</p>
          <div className="flex flex-col gap-2">
            {additionalItems.map((item) => {
              const isActive = currentSection === item.href;

              return (
                <Link
                  key={item.href}
                  href={`/${locale}/${item.href}`}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[rgba(21,122,110,0.1)] text-[var(--brand)] ring-1 ring-[rgba(21,122,110,0.12)]'
                      : 'text-[var(--muted)] hover:bg-white/80 hover:text-[var(--brand)]'
                  }`}
                >
                  <span
                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl border transition ${
                      isActive
                        ? 'border-[rgba(21,122,110,0.2)] bg-white/85 text-[var(--brand)]'
                        : 'border-[var(--line)] bg-white/85 text-zinc-700 group-hover:border-[var(--glow)] group-hover:text-[var(--brand)]'
                    }`}
                  >
                    <AppIcon name={item.icon} className="h-[18px] w-[18px]" />
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <ThemeToggle />

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 p-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-[var(--foreground)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copy.signOut}
          </button>

          <Link
            href={locale === 'es' ? '/en' : '/es'}
            className="block rounded-2xl border border-[var(--line)] bg-white/80 p-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-[var(--foreground)] transition hover:bg-white"
          >
            {copy.switchLanguage}
          </Link>

          <div className="text-center text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">By group 1</div>
        </div>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 xl:p-7">
        <div className="app-panel rounded-[2.2rem] px-5 py-5 md:px-7 md:py-6">
          <header className="mb-8 flex flex-col gap-4 border-b border-zinc-200/70 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">Workspace</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
                {[...menuItems, ...additionalItems].find((item) => item.href === currentSection)?.name ?? 'ClearUp'}
              </h2>
            </div>
            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#157a6e,#115e58)] text-sm font-bold text-white">
                {(session?.name ?? 'C').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">{session?.name ?? 'ClearUp'}</p>
                <p className="text-xs text-[var(--muted)]">{session?.email ?? 'Workspace ready'}</p>
              </div>
            </Link>
          </header>
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </>
  );
}
