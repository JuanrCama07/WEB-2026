import { getTranslations } from 'next-intl/server';

import { AuthForm } from '../auth-form';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignInPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return (
    <AuthForm
      locale={locale}
      copy={{
        badge: t('badge'),
        title: t('title'),
        subtitle: t('subtitle'),
        signInTab: t('tabs.signIn'),
        signUpTab: t('tabs.signUp'),
        nameLabel: t('fields.name.label'),
        emailLabel: t('fields.email.label'),
        passwordLabel: t('fields.password.label'),
        namePlaceholder: t('fields.name.placeholder'),
        emailPlaceholder: t('fields.email.placeholder'),
        passwordPlaceholder: t('fields.password.placeholder'),
        signInAction: t('actions.signIn'),
        signUpAction: t('actions.signUp'),
        switchToSignIn: t('switchToSignIn'),
        switchToSignUp: t('switchToSignUp'),
        helper: t('helper'),
        demoTitle: t('demoTitle'),
        demoBody: t('demoBody'),
      }}
    />
  );
}
