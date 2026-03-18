import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Si por alguna razón el locale llega undefined, usamos 'es' por defecto
  const currentLocale = locale || 'es';

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});