import { getTranslations } from 'next-intl/server';
import AIChatClient from './ai-chat-client';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'AIAssistant' });

  return {
    title: t('title'),
  };
}

export default function AIChatPage() {
  return (
    <div className="h-screen -ml-12 -mr-12 mb-0">
      <AIChatClient />
    </div>
  );
}
