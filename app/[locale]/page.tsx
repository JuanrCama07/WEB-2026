import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

import { readServerSession } from '@/lib/auth/server';

import { AppIcon, type AppIconName } from './app-icon';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const session = await readServerSession();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  const t = await getTranslations({ locale, namespace: 'Home' });

  const featuredModules: { href: string; icon: AppIconName; title: string; body: string; tone: string }[] = [
    { href: 'dashboard', icon: 'dashboard', title: t('modules.dashboard.title'), body: t('modules.dashboard.body'), tone: 'from-[#e7f7f3] to-[#f8fdfc] dark:from-[#10242a] dark:to-[#0d1b20]' },
    { href: 'tasks', icon: 'tasks', title: t('modules.tasks.title'), body: t('modules.tasks.body'), tone: 'from-[#edf7fb] to-[#fbfeff] dark:from-[#12232d] dark:to-[#0d1a22]' },
    { href: 'planner', icon: 'planner', title: t('modules.planner.title'), body: t('modules.planner.body'), tone: 'from-[#eef8f5] to-[#fbfffe] dark:from-[#11252a] dark:to-[#0d1c21]' },
    { href: 'subjects', icon: 'subjects', title: t('modules.subjects.title'), body: t('modules.subjects.body'), tone: 'from-[#f0f9f7] to-[#fcfffe] dark:from-[#102228] dark:to-[#0d1a1f]' },
  ];

  const quickAccess: { href: string; icon: AppIconName; title: string }[] = [
    { href: 'focus', icon: 'focus', title: t('quick.focus') },
    { href: 'habits', icon: 'habits', title: t('quick.habits') },
    { href: 'reminders', icon: 'reminders', title: t('quick.reminders') },
    { href: 'inbox', icon: 'inbox', title: t('quick.inbox') },
    { href: 'ai-assistant', icon: 'ai-assistant', title: t('quick.ai') },
    { href: 'analytics', icon: 'analytics', title: t('quick.analytics') },
  ];

  return (
    <div className="space-y-8">
      <header className="app-hero rounded-[2rem] px-7 py-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="app-kicker text-xs font-bold uppercase">{t('badge')}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              {t('title', { name: session.name.split(' ')[0] ?? session.name })}
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-zinc-600">{t('subtitle')}</p>
          </div>
          <div className="rounded-[1.7rem] border border-[var(--line)] bg-white/80 p-5 shadow-[0_18px_40px_rgba(14,42,51,0.06)] dark:bg-zinc-900/90">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{t('todayLabel')}</p>
            <p className="mt-2 text-lg font-bold text-zinc-950 dark:text-zinc-100">{t('todayTitle')}</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-300">{t('todayBody')}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">{t('featuredTitle')}</h2>
            <p className="text-sm text-zinc-500">{t('featuredSubtitle')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredModules.map((module) => (
              <Link
                key={module.href}
                href={`/${locale}/${module.href}`}
                className={`rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${module.tone} p-6 shadow-[0_16px_34px_rgba(14,42,51,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(14,42,51,0.1)]`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 text-zinc-800 shadow-sm dark:bg-zinc-800/90 dark:text-zinc-100">
                  <AppIcon name={module.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-zinc-950 dark:text-zinc-100">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{module.body}</p>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">{t('openModule')}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="app-panel-strong rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{t('quickTitle')}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickAccess.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}/${item.href}`}
                  className="flex items-center gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/90 px-4 py-4 transition hover:bg-[rgba(21,122,110,0.08)] hover:text-[var(--brand)] dark:bg-zinc-900/90 dark:hover:bg-[rgba(84,194,179,0.12)]"
                >
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-white/85 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100">
                    <AppIcon name={item.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[rgba(21,122,110,0.18)] bg-[linear-gradient(135deg,#e8f8f4,#f8fdfc)] p-6 shadow-[0_18px_38px_rgba(14,42,51,0.08)] dark:border-[rgba(84,194,179,0.2)] dark:bg-[linear-gradient(135deg,#133038,#0f242b)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)] dark:text-[#8de0d5]">{t('assistantCard.badge')}</p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-[#12343b] dark:text-[#f2fbfa]">{t('assistantCard.title')}</h3>
            <p className="mt-3 text-sm leading-7 text-[#35545c] dark:text-[#cfe7e4]">{t('assistantCard.body')}</p>
            <Link
              href={`/${locale}/ai-assistant`}
              className="mt-5 inline-flex rounded-2xl bg-[linear-gradient(135deg,#157a6e,#115e58)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(21,122,110,0.22)] transition hover:brightness-105"
            >
              {t('assistantCard.cta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
