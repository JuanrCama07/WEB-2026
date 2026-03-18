import Image from "next/image";
import { getTranslations } from 'next-intl/server';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  // 1. Esperamos a que los params se resuelvan
  const { locale } = await props.params;
  
  // 2. Usamos la versión ASYNC de las traducciones para componentes de servidor
  const t = await getTranslations({locale, namespace: 'Index'});

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t('description')}
          </p>
        </div>
        
        {/* Usamos locale aquí para que ESLint vea que se usa */}
        <p className="text-xs text-zinc-400">Language: {locale}</p>
      </main>
    </div>
  );
}