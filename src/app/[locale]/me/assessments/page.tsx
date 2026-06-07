import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/[locale]/mvpScaleActions';
import { getUserAttempts } from '@/lib/mvpScales';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
  searchParams: { error?: string };
};

export default async function MyAssessmentRecordsPage({
  params: { locale },
  searchParams,
}: Props) {
  const t = await getTranslations({ locale, namespace: 'records' });
  const { user, attempts, error } = await getUserAttempts();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/me/assessments`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            {t('eyebrow')}
          </p>
          <h1 className="text-3xl font-light text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            {t('intro')}
          </p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut(locale);
          }}
        >
          <button
            type="submit"
            className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
          >
            {t('logout')}
          </button>
        </form>
      </div>

      {(searchParams.error || error) && (
        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {searchParams.error || error}
        </div>
      )}

      {error ? (
        <div className="border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-gray-900">{t('setupTitle')}</h2>
          <p className="mt-3 text-sm text-gray-600">
            {t('setupText')}
          </p>
          <Link
            href={`/${locale}/assessments`}
            className="mt-6 inline-block border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
          >
            {t('backToCatalog')}
          </Link>
        </div>
      ) : attempts.length === 0 ? (
        <div className="border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-gray-900">{t('emptyTitle')}</h2>
          <p className="mt-3 text-sm text-gray-600">
            {t('emptyText')}
          </p>
          <Link
            href={`/${locale}/assessments`}
            className="mt-6 inline-block bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            {t('browseDemoScales')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const title = getAttemptTitle(attempt, locale);
            const moduleName = getAttemptModuleName(attempt, locale, t('demoScale'));

            return (
              <div key={attempt.id} className="border border-gray-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="border border-gray-300 px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
                        {attempt.status}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        {moduleName}
                      </span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('started')}: {formatDate(attempt.started_at, locale)}
                      {attempt.completed_at ? ` · ${t('completed')}: ${formatDate(attempt.completed_at, locale)}` : ''}
                    </p>
                    {attempt.notes && (
                      <p className="mt-3 text-sm leading-6 text-gray-600">{attempt.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/${locale}/assessments/${attempt.scale_code}`}
                      className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
                    >
                      {t('details')}
                    </Link>
                    {attempt.status === 'started' && (
                      <Link
                        href={`/${locale}/assessments/${attempt.scale_code}/take?attemptId=${attempt.id}`}
                        className="bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                      >
                        {t('continue')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getAttemptTitle(attempt: Awaited<ReturnType<typeof getUserAttempts>>['attempts'][number], locale: string) {
  if (locale === 'zh') {
    return attempt.assessment_scales?.title_cn ?? attempt.assessment_scales?.title_en ?? attempt.scale_code;
  }

  return attempt.assessment_scales?.title_en ?? attempt.assessment_scales?.title_cn ?? attempt.scale_code;
}

function getAttemptModuleName(
  attempt: Awaited<ReturnType<typeof getUserAttempts>>['attempts'][number],
  locale: string,
  fallback: string
) {
  if (locale === 'zh') {
    return attempt.assessment_scales?.module_name_cn ?? attempt.assessment_scales?.module_name_en ?? fallback;
  }

  return attempt.assessment_scales?.module_name_en ?? attempt.assessment_scales?.module_name_cn ?? fallback;
}
