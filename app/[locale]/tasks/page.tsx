import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TasksPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t('tasks')}
        </h1>
        <p className="text-lg text-zinc-500 mt-2">
          Gestiona tus entregas, parciales y proyectos con prioridad.
        </p>
      </header>

      {/* Sección de "Inbox" o Captura rápida (HU-05) */}
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <input 
          type="text" 
          placeholder="Captura rápida de tarea (Presiona Enter)..."
          className="w-full bg-transparent border-none focus:ring-0 text-zinc-600 dark:text-zinc-300"
        />
      </div>

      {/* Lista de Tareas (Simulada) */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
            <div className="h-5 w-5 rounded border border-zinc-300 dark:border-zinc-600 mr-4" />
            <div className="flex-1">
              <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
            <div className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              Prioridad Alta
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}