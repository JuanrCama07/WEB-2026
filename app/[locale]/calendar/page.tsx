import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {t('calendar')}
          </h1>
          <p className="text-lg text-zinc-500 mt-2">
            Organiza tus días y sincroniza tus calendarios externos.
          </p>
        </div>
        <a
          href={`/api/google-calendar/connect?locale=${locale}`}
          className="px-4 py-2 bg-zinc-900 dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium"
        >
          Sincronizar Google Calendar
        </a>
      </header>

      {/* Vista de Calendario Simulada (HU-04) */}
      <div className="grid grid-cols-7 gap-4">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="text-center">
            <span className="text-xs font-semibold uppercase text-zinc-400">{day}</span>
            <div className="mt-2 h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 relative overflow-hidden">
              {day === 'Lun' && (
                <div className="absolute top-4 left-0 right-0 p-2 bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500 text-[10px] text-blue-700 dark:text-blue-300">
                  Clase de Redes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}