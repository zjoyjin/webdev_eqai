import LoginForm from '@/components/LoginForm';
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
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          {t('eyebrow')}
        </p>
        <h1 className="text-3xl font-light text-gray-900">{t('title')}</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {t('intro')}
        </p>
      </div>

      {searchParams.message && (
        <p className="mb-4 border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
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
    </div>
  );
}

export const dynamic = 'force-dynamic';
