import Link from 'next/link';
import { notFound } from 'next/navigation';
import { startScaleAttempt } from '@/app/[locale]/mvpScaleActions';
import {
  Eyebrow,
  PageShell,
  primaryButtonClass,
  secondaryButtonClass,
  softCardClass,
  softPanelClass,
} from '@/components/PageChrome';
import {
  getCurrentUser,
  getLocalizedDimensionText,
  getLocalizedScaleText,
  getMvpDimensions,
  getMvpScale,
} from '@/lib/mvpScales';

type Props = {
  params: { locale: string; scaleCode: string };
  searchParams: { error?: string };
};

const detailCopy = {
  en: {
    back: 'Back to catalog',
    boundary:
      'This assessment record is for personal reference only. It does not provide a formal psychological assessment result or diagnosis.',
    start: 'Start assessment',
    login: 'Log in to start',
    dimensions: 'Dimensions',
  },
  zh: {
    back: '返回目录',
    boundary: '本评估记录仅供个人参考，不提供正式心理测评结果或诊断。',
    start: '开始评估',
    login: '登录后开始',
    dimensions: '维度',
  },
};

export default async function MvpScaleDetailPage({
  params: { locale, scaleCode },
  searchParams,
}: Props) {
  const copy = locale === 'zh' ? detailCopy.zh : detailCopy.en;
  const [scale, dimensions, user] = await Promise.all([
    getMvpScale(scaleCode),
    getMvpDimensions(scaleCode),
    getCurrentUser(),
  ]);

  if (!scale) {
    notFound();
  }

  const localizedScale = getLocalizedScaleText(scale, locale);

  return (
    <PageShell maxWidth="max-w-4xl">
      <Link href={`/${locale}/assessments`} className={secondaryButtonClass}>
        {copy.back}
      </Link>

      <div className={`mt-8 ${softCardClass}`}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Eyebrow tone="teal" className="mb-0">{localizedScale.moduleName}</Eyebrow>
        </div>

        <h1 className="text-3xl font-light text-gray-900">{localizedScale.title}</h1>
        {localizedScale.secondaryTitle && (
          <p className="mt-2 text-base text-gray-500">{localizedScale.secondaryTitle}</p>
        )}
        <p className="mt-6 text-sm leading-6 text-gray-600">
          {localizedScale.description}
        </p>

        <div className="mt-6 rounded-2xl border border-warm-200 bg-warm-50 p-4 text-sm leading-6 text-warm-900">
          {copy.boundary}
        </div>

        {searchParams.error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {searchParams.error}
          </div>
        )}

        <form
          action={async () => {
            'use server';
            await startScaleAttempt(locale, scale.scale_code);
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className={primaryButtonClass}
          >
            {user ? copy.start : copy.login}
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-medium text-gray-900">{copy.dimensions}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dimensions.map((dimension) => {
            const localizedDimension = getLocalizedDimensionText(dimension, locale);

            return (
              <div key={dimension.dimension_code} className={softPanelClass}>
                <p className="text-sm font-medium text-gray-900">{localizedDimension.title}</p>
                {localizedDimension.secondaryTitle && (
                  <p className="mt-1 text-sm text-gray-500">{localizedDimension.secondaryTitle}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </PageShell>
  );
}

export const dynamic = 'force-dynamic';
