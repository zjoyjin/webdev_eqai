import LoginForm from '@/components/LoginForm';
import { Eyebrow, PageShell } from '@/components/PageChrome';
import { getSupabaseBrowserConfig, isSupabaseConfigured } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
  searchParams: { message?: string; next?: string };
};

export default async function LoginPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'auth' });
  const nextPath =
    searchParams.next?.startsWith(`/${locale}/`) || searchParams.next === `/${locale}`
      ? searchParams.next
      : `/${locale}/me/assessments`;
  const supabaseConfig = getSupabaseBrowserConfig();

  return (
    <PageShell maxWidth="max-w-md">
      <div className="mb-8">
        <Eyebrow tone="primary">{t('eyebrow')}</Eyebrow>
        <h1 className="text-3xl font-light text-gray-900">{t('title')}</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {t('intro')}
        </p>
      </div>

      {searchParams.message && (
        <p className="mb-4 rounded-2xl border border-primary-100 bg-primary-50 p-3 text-sm text-primary-800">
          {searchParams.message}
        </p>
      )}

      <LoginForm
        locale={locale}
        configured={isSupabaseConfigured()}
        supabaseUrl={supabaseConfig.url}
        supabasePublishableKey={supabaseConfig.publishableKey}
        nextPath={nextPath}
      />
    </PageShell>
  );
}

export const dynamic = 'force-dynamic';
