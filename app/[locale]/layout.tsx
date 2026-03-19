import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import "../globals.css";

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  // Definimos los items del menú para que sea fácil de mantener
  const menuItems = [
    { name: t('dashboard'), href: 'dashboard', icon: '📊' },
    { name: t('tasks'), href: 'tasks', icon: '📅' },
    { name: t('calendar'), href: 'planner', icon: '🗓️' },
    { name: t('subjects'), href: 'subjects', icon: '📚' },
    { name: t('focus'), href: 'focus', icon: '⏱️' },
    { name: t('habits'), href: 'habits', icon: '🌱' },
    { name: t('analytics'), href: 'analytics', icon: '📈' },
  ];

  const additionalItems = [
    { name: 'Recordatorios', href: 'reminders', icon: '🔔' },
    { name: 'Inbox', href: 'inbox', icon: '📥' },
    { name: 'Asistente IA', href: 'ai-assistant', icon: '🤖' },
  ];

  return (
    <html lang={locale}>
      <body className="flex min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
        <NextIntlClientProvider messages={messages}>
          
          {/* SIDEBAR */}
          <nav className="w-72 border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col gap-8 bg-white dark:bg-black">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">C</div>
              <h1 className="text-2xl font-black tracking-tighter text-blue-600">ClearUp</h1>
            </div>

            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}/${item.href}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-blue-600 transition-all font-medium"
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 px-4 mb-2">Herramientas</p>
              <div className="flex flex-col gap-2">
                {additionalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={`/${locale}/${item.href}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-blue-600 transition-all font-medium text-sm"
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-4">
              {/* Botón de Idioma rápido */}
              <Link 
                href={locale === 'es' ? '/en/dashboard' : '/es/dashboard'}
                className="block text-center text-xs font-bold uppercase tracking-widest p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {locale === 'es' ? '🇺🇸 Switch to English' : '🇨🇴 Cambiar a Español'}
              </Link>
              
              <div className="text-[10px] text-zinc-400 text-center uppercase tracking-widest">
                Uniandes • Protocolo Alpha
              </div>
            </div>
          </nav>

          {/* CONTENIDO PRINCIPAL */}
          <main className="flex-1 overflow-y-auto p-12">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>

        </NextIntlClientProvider>
      </body>
    </html>
  );
}