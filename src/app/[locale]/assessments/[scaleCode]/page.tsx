import Link from 'next/link';
import { notFound } from 'next/navigation';
import { startScaleAttempt } from '@/app/[locale]/mvpScaleActions';
import {
  getCurrentUser,
  getLocalizedDimensionText,
  getLocalizedItemText,
  getLocalizedScaleText,
  getMvpDemoItems,
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
    questions: 'Questions',
  },
  zh: {
    back: '返回目录',
    boundary: '本评估记录仅供个人参考，不提供正式心理测评结果或诊断。',
    start: '开始评估',
    login: '登录后开始',
    dimensions: '维度',
    questions: '题目',
  },
};

export default async function MvpScaleDetailPage({
  params: { locale, scaleCode },
  searchParams,
}: Props) {
  const copy = locale === 'zh' ? detailCopy.zh : detailCopy.en;
  const [scale, dimensions, demoItems, user] = await Promise.all([
    getMvpScale(scaleCode),
    getMvpDimensions(scaleCode),
    getMvpDemoItems(scaleCode),
    getCurrentUser(),
  ]);

  if (!scale) {
    notFound();
  }

  const localizedScale = getLocalizedScaleText(scale, locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href={`/${locale}/assessments`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
        {copy.back}
      </Link>

      <div className="mt-8 border border-gray-200 bg-white p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">{localizedScale.moduleName}</span>
        </div>

        <h1 className="text-3xl font-light text-gray-900">{localizedScale.title}</h1>
        {localizedScale.secondaryTitle && (
          <p className="mt-2 text-base text-gray-500">{localizedScale.secondaryTitle}</p>
        )}
        <p className="mt-6 text-sm leading-6 text-gray-600">
          {localizedScale.description}
        </p>

        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {copy.boundary}
        </div>

        {searchParams.error && (
          <div className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
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
            className="bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
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
              <div key={dimension.dimension_code} className="border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-900">{localizedDimension.title}</p>
                {localizedDimension.secondaryTitle && (
                  <p className="mt-1 text-sm text-gray-500">{localizedDimension.secondaryTitle}</p>
                )}
                <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">{dimension.variant_type}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-medium text-gray-900">{copy.questions}</h2>
        <div className="space-y-3">
          {demoItems.map((item) => {
            const localizedItem = getLocalizedItemText(item, locale);

            return (
              <div key={item.item_code} className="border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">{item.item_code}</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{localizedItem.prompt}</p>
                {localizedItem.secondaryPrompt && (
                  <p className="mt-1 text-sm text-gray-500">{localizedItem.secondaryPrompt}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export const dynamic = 'force-dynamic';
