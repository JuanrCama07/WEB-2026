import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

import { readServerSession } from '@/lib/auth/server';

import { AppIcon, type AppIconName } from './app-icon';
import { LandingNav } from './landing-nav';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const session = await readServerSession();

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations({ locale, namespace: 'Landing' });

  const features: { icon: AppIconName; title: string; body: string }[] = [
    { icon: 'tasks', title: t('features.tasks.title'), body: t('features.tasks.body') },
    { icon: 'planner', title: t('features.planner.title'), body: t('features.planner.body') },
    { icon: 'focus', title: t('features.focus.title'), body: t('features.focus.body') },
    { icon: 'analytics', title: t('features.analytics.title'), body: t('features.analytics.body') },
  ];

  const stats = [
    { value: t('stats.modules.value'), label: t('stats.modules.label') },
    { value: t('stats.flow.value'), label: t('stats.flow.label') },
    { value: t('stats.focus.value'), label: t('stats.focus.label') },
  ];

  const steps = [
    t('steps.capture'),
    t('steps.plan'),
    t('steps.execute'),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f7f7] text-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(21,122,110,0.18),transparent_24rem),radial-gradient(circle_at_86%_18%,rgba(56,189,248,0.18),transparent_24rem),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(237,247,247,0.96))]" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full border border-white/70 bg-white/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-7 lg:px-10">
        <LandingNav
          locale={locale}
          copy={{
            features: t('nav.features'),
            flow: t('nav.flow'),
            start: t('nav.start'),
            signIn: t('nav.signIn'),
          }}
        />

        <main className="flex flex-1 flex-col">
          <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
            <div>
              <p className="inline-flex rounded-full border border-[rgba(21,122,110,0.18)] bg-white/78 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-[var(--brand)] shadow-[0_12px_30px_rgba(21,122,110,0.08)]">
                {t('badge')}
              </p>
              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-zinc-950 sm:text-6xl lg:text-7xl">
                {t('title')}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
                {t('subtitle')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/sign-in`}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#157a6e,#115e58)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_20px_38px_rgba(21,122,110,0.24)] transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  {t('primaryCta')}
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/78 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-zinc-800 shadow-[0_16px_34px_rgba(14,42,51,0.06)] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {t('secondaryCta')}
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.4rem] border border-white/80 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,42,51,0.06)] backdrop-blur">
                    <p className="text-3xl font-black tracking-tight text-zinc-950">{stat.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-10 h-28 w-28 rounded-[2rem] bg-[#157a6e]/15 blur-2xl" />
              <div className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-sky-300/25 blur-2xl" />
              <div className="relative rounded-[2.4rem] border border-white/90 bg-white/78 p-4 shadow-[0_30px_80px_rgba(14,42,51,0.14)] backdrop-blur-xl">
                <div className="rounded-[2rem] bg-[linear-gradient(145deg,#0d2c33,#134a45_55%,#eaf8f6_55%,#ffffff)] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#9fe5da]">{t('preview.badge')}</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{t('preview.title')}</h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white">
                      <AppIcon name="dashboard" className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {['72%', '4', '2h'].map((value, index) => (
                      <div key={value} className="rounded-2xl border border-white/12 bg-white/12 p-4 text-white backdrop-blur">
                        <p className="text-2xl font-black">{value}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/64">
                          {t(`preview.metrics.${index}`)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[1.6rem] bg-white p-5 shadow-[0_18px_42px_rgba(4,24,29,0.12)]">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--brand)]">{t('preview.cardTitle')}</p>
                      <div className="mt-5 space-y-3">
                        {[86, 62, 44].map((width) => (
                          <div key={width} className="h-2.5 rounded-full bg-zinc-100">
                            <div className="h-2.5 rounded-full bg-[linear-gradient(90deg,#157a6e,#38bdf8)]" style={{ width: `${width}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-[#dff0ec] bg-[#f7fcfb] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{t('preview.focusTitle')}</p>
                      <div className="mt-4 space-y-3">
                        {steps.map((step, index) => (
                          <div key={step} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e4f7f3] text-sm font-black text-[var(--brand)]">
                              {index + 1}
                            </span>
                            <span className="text-sm font-semibold text-zinc-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="grid gap-4 pb-12 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="group rounded-[2rem] border border-white/85 bg-white/72 p-6 shadow-[0_18px_45px_rgba(14,42,51,0.07)] backdrop-blur transition hover:-translate-y-1 hover:bg-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(21,122,110,0.1)] text-[var(--brand)] transition group-hover:scale-105">
                  <AppIcon name={feature.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight text-zinc-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.body}</p>
              </article>
            ))}
          </section>

          <section id="flow" className="pb-14">
            <div className="rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(232,248,244,0.86))] p-7 shadow-[0_24px_70px_rgba(14,42,51,0.08)] backdrop-blur">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <p className="app-kicker text-xs font-black uppercase">{t('flow.badge')}</p>
                  <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-zinc-950">{t('flow.title')}</h2>
                  <p className="mt-4 text-base leading-7 text-zinc-600">{t('flow.body')}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {steps.map((step, index) => (
                    <div key={step} className="rounded-[1.7rem] border border-[var(--line)] bg-white/78 p-5 shadow-sm">
                      <p className="text-4xl font-black text-[rgba(21,122,110,0.22)]">0{index + 1}</p>
                      <p className="mt-4 text-lg font-black text-zinc-900">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="start" className="pb-10">
            <div className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,#102f36,#115e58)] p-8 text-white shadow-[0_28px_70px_rgba(17,94,88,0.22)] md:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9fe5da]">{t('final.badge')}</p>
                  <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em]">{t('final.title')}</h2>
                </div>
                <Link
                  href={`/${locale}/sign-in`}
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#115e58] shadow-[0_18px_38px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
                >
                  {t('final.cta')}
                </Link>
              </div>
            </div>
          </section>

          <p className="pb-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            © 2026 Web designers group1
          </p>
        </main>
      </div>
    </div>
  );
}
