import { getTranslations } from 'next-intl/server';

import { buildApiUrl } from '@/lib/api';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            {t('calendar')}
          </h1>
          <p className="text-lg text-zinc-500 mt-2">
            Organiza tus días y sincroniza tus calendarios externos.
          </p>
        </div>
        <a
          href={buildApiUrl(`/api/google-calendar/connect?locale=${locale}`)}
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-black md:w-auto"
        >
          Sincronizar Google Calendar
        </a>
      </header>

      {/* Vista de Calendario Simulada (HU-04) */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[52rem] grid-cols-7 gap-4">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-center">
              <span className="text-xs font-semibold uppercase text-zinc-400">{day}</span>
              <div className="relative mt-2 h-64 overflow-hidden rounded-xl border border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                {day === 'Lun' && (
                  <div className="absolute top-4 left-0 right-0 border-l-4 border-blue-500 bg-blue-100 p-2 text-[10px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Clase de Redes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
