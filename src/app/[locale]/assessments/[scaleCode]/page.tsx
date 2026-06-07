import Link from 'next/link';
import { notFound } from 'next/navigation';
import { startScaleAttempt } from '@/app/[locale]/mvpScaleActions';
import { getCurrentUser, getMvpDemoItems, getMvpDimensions, getMvpScale } from '@/lib/mvpScales';

type Props = {
  params: { locale: string; scaleCode: string };
  searchParams: { error?: string };
};

export default async function MvpScaleDetailPage({
  params: { locale, scaleCode },
  searchParams,
}: Props) {
  const [scale, dimensions, demoItems, user] = await Promise.all([
    getMvpScale(scaleCode),
    getMvpDimensions(scaleCode),
    getMvpDemoItems(scaleCode),
    getCurrentUser(),
  ]);

  if (!scale) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href={`/${locale}/assessments`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
        Back to catalog
      </Link>

      <div className="mt-8 border border-gray-200 bg-white p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="border border-gray-300 px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
            Demo
          </span>
          <span className="text-sm text-gray-500">{scale.module_name_en ?? scale.module_name_cn}</span>
        </div>

        <h1 className="text-3xl font-light text-gray-900">{scale.title_en ?? scale.title_cn}</h1>
        <p className="mt-2 text-base text-gray-500">{scale.title_cn}</p>
        <p className="mt-6 text-sm leading-6 text-gray-600">
          {scale.description_en ?? scale.description_cn}
        </p>

        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          This is a demo MVP scale. It is only used to test account, catalog, and record
          persistence. It is not a formal assessment result or diagnosis.
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
            {user ? 'Start demo scale' : 'Log in to start'}
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-medium text-gray-900">Demo dimensions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dimensions.map((dimension) => (
            <div key={dimension.dimension_code} className="border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-900">{dimension.title_en ?? dimension.title_cn}</p>
              <p className="mt-1 text-sm text-gray-500">{dimension.title_cn}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">{dimension.variant_type}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-medium text-gray-900">Demo items</h2>
        <div className="space-y-3">
          {demoItems.map((item) => (
            <div key={item.item_code} className="border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">{item.item_code}</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{item.prompt_en ?? item.prompt_cn}</p>
              <p className="mt-1 text-sm text-gray-500">{item.prompt_cn}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const dynamic = 'force-dynamic';
