import Link from 'next/link';
import {
  filterMvpScalesByCategory,
  getMvpScales,
  mvpScaleCategories,
  normalizeMvpScaleCategory,
} from '@/lib/mvpScales';

type Props = {
  params: { locale: string };
  searchParams: { category?: string };
};

const catalogCopy = {
  en: {
    eyebrow: 'Demo catalog',
    title: 'Assessment MVP',
    intro:
      'These demo scales are scaffolding for the MVP flow. They are not formal psychological assessments or diagnostic instruments.',
    all: 'All',
    emptyPrefix: 'No demo scales are active for',
    emptySuffix: 'yet.',
    emptyText: 'Browse all demo scales while this category is being prepared.',
    emptyCta: 'View all demo scales',
    demoScales: 'demo scales',
    demo: 'Demo',
    viewDetails: 'View details',
    categories: {
      work: 'Work',
      personal: 'Personal',
      kid: 'Kid',
      pet: 'Pet',
    },
  },
  zh: {
    eyebrow: 'Demo 目录',
    title: '评估 MVP',
    intro: '这些 demo 量表用于验证 MVP 流程，不属于正式心理测评或诊断工具。',
    all: '全部',
    emptyPrefix: '当前还没有启用',
    emptySuffix: '类 demo 量表。',
    emptyText: '该分类仍在准备中，可以先浏览全部 demo 量表。',
    emptyCta: '查看全部 demo 量表',
    demoScales: '个 demo 量表',
    demo: 'Demo',
    viewDetails: '查看详情',
    categories: {
      work: '工作',
      personal: '个人',
      kid: '儿童',
      pet: '宠物',
    },
  },
};

export default async function MvpAssessmentsPage({
  params: { locale },
  searchParams,
}: Props) {
  const copy = locale === 'zh' ? catalogCopy.zh : catalogCopy.en;
  const selectedCategory = normalizeMvpScaleCategory(searchParams.category);
  const allScales = await getMvpScales();
  const scales = filterMvpScalesByCategory(allScales, selectedCategory);
  const groupedScales = scales.reduce<Array<{ moduleCode: string; moduleName: string; scales: typeof scales }>>(
    (groups, scale) => {
      const moduleName = scale.module_name_en ?? scale.module_name_cn;
      const existing = groups.find((group) => group.moduleCode === scale.module_code);

      if (existing) {
        existing.scales.push(scale);
      } else {
        groups.push({
          moduleCode: scale.module_code,
          moduleName,
          scales: [scale],
        });
      }

      return groups;
    },
    []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          {copy.intro}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/assessments`}
          className={`border px-3 py-2 text-sm font-medium ${
            selectedCategory
              ? 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
              : 'border-gray-900 bg-gray-900 text-white'
          }`}
        >
          {copy.all}
        </Link>
        {mvpScaleCategories.map((category) => (
          <Link
            key={category}
            href={`/${locale}/assessments?category=${category}`}
            className={`border px-3 py-2 text-sm font-medium ${
              selectedCategory === category
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
            }`}
          >
            {copy.categories[category]}
          </Link>
        ))}
      </div>

      {selectedCategory && scales.length === 0 && (
        <div className="mb-8 border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-medium text-gray-900">
            {copy.emptyPrefix} {copy.categories[selectedCategory]} {copy.emptySuffix}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {copy.emptyText}
          </p>
          <Link
            href={`/${locale}/assessments`}
            className="mt-5 inline-block border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
          >
            {copy.emptyCta}
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {groupedScales.map((group) => (
          <section key={group.moduleCode}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {group.moduleCode}
                </p>
                <h2 className="mt-1 text-xl font-medium text-gray-900">{group.moduleName}</h2>
              </div>
              <span className="text-sm text-gray-500">
                {group.scales.length} {copy.demoScales}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {group.scales.map((scale) => (
                <Link
                  key={scale.scale_code}
                  href={`/${locale}/assessments/${scale.scale_code}`}
                  className="border border-gray-200 bg-white p-5 transition-colors hover:border-gray-900"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {scale.scale_code}
                    </span>
                    <span className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">
                      {copy.demo}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {scale.title_en ?? scale.title_cn}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{scale.title_cn}</p>
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {scale.description_en ?? scale.description_cn}
                  </p>
                  <p className="mt-5 text-sm font-medium text-gray-900">{copy.viewDetails}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
