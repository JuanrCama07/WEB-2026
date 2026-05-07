"use client";

import { useEffect, useRef, useState } from 'react';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'up' | 'left' | 'right' | 'zoom';
};

type AccordionItem = {
  title: string;
  body: string;
};

const hiddenByVariant: Record<NonNullable<ScrollRevealProps['variant']>, string> = {
  up: 'translate-y-10',
  left: '-translate-x-10',
  right: 'translate-x-10',
  zoom: 'scale-95',
};

export function ScrollReveal({ children, className = '', delay = 0, variant = 'up' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transform-gpu transition-all duration-700 ease-out ${
        isVisible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : `${hiddenByVariant[variant]} opacity-0`
      }`}
    >
      {children}
    </div>
  );
}

export function LandingAccordion({
  badge,
  title,
  body,
  items,
}: {
  badge: string;
  title: string;
  body: string;
  items: AccordionItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ScrollReveal className="pb-14" variant="zoom">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/80 bg-white/72 p-7 shadow-[0_24px_70px_rgba(14,42,51,0.08)] backdrop-blur">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[rgba(21,122,110,0.12)] blur-3xl" />
        <div className="absolute -bottom-16 left-12 h-40 w-40 rounded-full bg-[rgba(56,189,248,0.14)] blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="app-kicker text-xs font-black uppercase">{badge}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-zinc-950">{title}</h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">{body}</p>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <div
                  key={item.title}
                  className={`overflow-hidden rounded-[1.6rem] border transition-[background-color,border-color,box-shadow] duration-150 ease-out ${
                    isActive
                      ? 'border-[rgba(21,122,110,0.24)] bg-[linear-gradient(135deg,#ffffff,#eefaf7)] shadow-[0_18px_44px_rgba(14,42,51,0.09)]'
                      : 'border-[var(--line)] bg-white/74 hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(isActive ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isActive}
                  >
                    <span className="text-lg font-black tracking-tight text-zinc-950">{item.title}</span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(21,122,110,0.1)] text-xl font-black text-[var(--brand)] transition-transform duration-150 ease-out ${
                        isActive ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <p className={`px-5 pb-5 text-sm leading-7 text-zinc-600 transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
