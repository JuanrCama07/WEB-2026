import { getTranslations } from 'next-intl/server';

import { ProfileSettings } from './profile-settings';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Profile' });

  return (
    <ProfileSettings
      copy={{
        badge: t('badge'),
        title: t('title'),
        subtitle: t('subtitle'),
        accountTitle: t('accountTitle'),
        accountBody: t('accountBody'),
        accountSince: t('accountSince'),
        formTitle: t('formTitle'),
        formBody: t('formBody'),
        nameLabel: t('fields.name'),
        emailLabel: t('fields.email'),
        passwordLabel: t('fields.password'),
        passwordHelp: t('passwordHelp'),
        save: t('actions.save'),
        saving: t('actions.saving'),
        success: t('success'),
        placeholders: {
          name: t('placeholders.name'),
          email: t('placeholders.email'),
          password: t('placeholders.password'),
        },
      }}
    />
  );
}
