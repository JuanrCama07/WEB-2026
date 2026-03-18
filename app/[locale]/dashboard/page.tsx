import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t('dashboard')}
        </h1>
        <p className="text-lg text-zinc-500 mt-2">
          Visualiza tu carga académica y personal en un solo vistazo.
        </p>
      </header>

      {/* Grid de Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="font-semibold mb-2">Progreso Semanal</h3>
          <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="font-semibold mb-2">Próximas Entregas</h3>
          <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shadow-sm">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Sugerencia de IA</h3>
          <p className="text-sm text-blue-600 dark:text-blue-300 italic">
            &quot;Tienes un hueco de 2 horas hoy. Es buen momento para adelantar Redes.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}