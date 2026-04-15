import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import "../globals.css";

import { AuthSessionProvider } from '@/lib/auth/client';
import { readServerSession } from '@/lib/auth/server';

import { SessionShell } from './session-shell';

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'Navigation' });
  const session = await readServerSession();

  // Definimos los items del menú para que sea fácil de mantener
  const menuItems = [
    { name: t('home'), href: '', icon: '🏠' },
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
    { name: t('profile'), href: 'profile', icon: '👤' },
  ];

  return (
    <html lang={locale}>
      <body className="app-shell flex min-h-screen text-zinc-900 dark:text-zinc-100 font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key='clearup_theme';var saved=localStorage.getItem(key);var theme=saved||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider key={session?.id ?? 'guest'} session={session}>
            <SessionShell
              locale={locale}
              session={session}
              menuItems={menuItems}
              additionalItems={additionalItems}
              copy={{
                tools: t('tools'),
                switchLanguage: t('switchLanguage'),
                signOut: t('signOut'),
                guest: t('activeSession'),
              }}
            >
              {children}
            </SessionShell>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
