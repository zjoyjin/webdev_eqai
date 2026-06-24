import LoginForm from '@/components/LoginForm';
import { Eyebrow, PageShell } from '@/components/PageChrome';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export default async function LoginPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'auth' });
  const nextPath = `/${locale}/me/assessments`;
  return (
    <PageShell maxWidth="max-w-md">
      <div className="mb-8">
        <Eyebrow tone="primary">{t('eyebrow')}</Eyebrow>
        <h1 className="text-3xl font-light text-gray-900">{t('title')}</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {t('intro')}
        </p>
      </div>

      <LoginForm
        locale={locale}
        nextPath={nextPath}
      />
    </PageShell>
  );
}
