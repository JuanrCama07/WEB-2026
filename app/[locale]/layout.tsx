import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import "../globals.css";

import { AuthSessionProvider } from '@/lib/auth/client';
import { readServerSession } from '@/lib/auth/server';

import type { AppIconName } from './app-icon';
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
  const menuItems: { name: string; href: string; icon: AppIconName }[] = [
    { name: t('home'), href: '', icon: 'home' },
    { name: t('dashboard'), href: 'dashboard', icon: 'dashboard' },
    { name: t('tasks'), href: 'tasks', icon: 'tasks' },
    { name: t('calendar'), href: 'planner', icon: 'planner' },
    { name: t('subjects'), href: 'subjects', icon: 'subjects' },
    { name: t('focus'), href: 'focus', icon: 'focus' },
    { name: t('habits'), href: 'habits', icon: 'habits' },
    { name: t('analytics'), href: 'analytics', icon: 'analytics' },
  ];

  const additionalItems: { name: string; href: string; icon: AppIconName }[] = [
    { name: 'Recordatorios', href: 'reminders', icon: 'reminders' },
    { name: 'Inbox', href: 'inbox', icon: 'inbox' },
    { name: 'Asistente IA', href: 'ai-assistant', icon: 'ai-assistant' },
    { name: t('profile'), href: 'profile', icon: 'profile' },
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
