import Link from 'next/link';

type LandingNavCopy = {
  features: string;
  flow: string;
  start: string;
  signIn: string;
};

export function LandingNav({ locale, copy }: { locale: string; copy: LandingNavCopy }) {
  return (
    <nav
      className="sticky top-5 z-50 flex items-center justify-between rounded-[1.7rem] border border-white/80 bg-white/90 px-4 py-3 shadow-[0_18px_50px_rgba(14,42,51,0.08)] backdrop-blur-xl"
    >
      <Link href={`/${locale}`} className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#157a6e,#115e58)] text-xl font-black text-white shadow-[0_14px_34px_rgba(21,122,110,0.24)]"
        >
          C
        </span>
        <span>
          <span className="block text-xl font-black tracking-tight text-[var(--brand)]">
            ClearUp
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">Student OS</span>
        </span>
      </Link>

      <div className="hidden items-center gap-7 text-sm font-semibold text-zinc-600 md:flex">
        <a href="#features" className="transition hover:text-[var(--brand)]">{copy.features}</a>
        <a href="#flow" className="transition hover:text-[var(--brand)]">{copy.flow}</a>
        <a href="#start" className="transition hover:text-[var(--brand)]">{copy.start}</a>
      </div>

      <Link
        href={`/${locale}/sign-in`}
        className="rounded-2xl bg-[linear-gradient(135deg,#157a6e,#115e58)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(21,122,110,0.22)] transition hover:brightness-105"
      >
        {copy.signIn}
      </Link>
    </nav>
  );
}
