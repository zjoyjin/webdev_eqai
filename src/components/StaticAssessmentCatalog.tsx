'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eyebrow,
  secondaryButtonClass,
  softCardClass,
  softPanelClass,
} from '@/components/PageChrome';
import {
  filterMvpScalesByCategory,
  getLocalizedScaleText,
  mvpScaleCategories,
  normalizeMvpScaleCategory,
  type MvpScale,
  type MvpScaleCategory,
} from '@/lib/mvpScales';

type StaticAssessmentCatalogProps = {
  locale: string;
  allScales: MvpScale[];
};

const catalogCopy = {
  en: {
    eyebrow: 'Assessment catalog',
    title: 'Assessments',
    intro:
      'Browse EQAI assessment pathways and save your own records in this browser. Results are for personal reference and are not a clinical diagnosis.',
    all: 'All',
    emptyPrefix: 'No assessments are active for',
    emptySuffix: 'yet.',
    emptyText: 'Browse all assessments while this category is being prepared.',
    emptyCta: 'View all assessments',
    scaleCount: 'assessments',
    viewDetails: 'View details',
    categories: {
      work: 'Work',
      personal: 'Personal',
      kid: 'Kid',
      pet: 'Pet',
    },
  },
  zh: {
    eyebrow: '评估目录',
    title: '评估',
    intro: '浏览 EQAI 评估路径，并把自己的作答记录保存在当前浏览器中。结果用于个人参考，不作为临床诊断。',
    all: '全部',
    emptyPrefix: '当前还没有启用',
    emptySuffix: '类评估。',
    emptyText: '该分类仍在准备中，可以先浏览全部评估。',
    emptyCta: '查看全部评估',
    scaleCount: '个评估',
    viewDetails: '查看详情',
    categories: {
      work: '工作',
      personal: '个人',
      kid: '儿童',
      pet: '宠物',
    },
  },
};

export default function StaticAssessmentCatalog({ locale, allScales }: StaticAssessmentCatalogProps) {
  const copy = locale === 'zh' ? catalogCopy.zh : catalogCopy.en;
  const [selectedCategory, setSelectedCategory] = useState<MvpScaleCategory | null>(null);

  useEffect(() => {
    setSelectedCategory(
      normalizeMvpScaleCategory(new URLSearchParams(window.location.search).get('category'))
    );
  }, []);

  const scales = useMemo(
    () => filterMvpScalesByCategory(allScales, selectedCategory),
    [allScales, selectedCategory]
  );
  const groupedScales = useMemo(
    () =>
      scales.reduce<Array<{ moduleCode: string; moduleName: string; scales: MvpScale[] }>>(
        (groups, scale) => {
          const moduleName = scale.module_name_en ?? scale.module_name_cn;
          const localized = getLocalizedScaleText(scale, locale);
          const existing = groups.find((group) => group.moduleCode === scale.module_code);

          if (existing) {
            existing.scales.push(scale);
          } else {
            groups.push({
              moduleCode: scale.module_code,
              moduleName: localized.moduleName ?? moduleName,
              scales: [scale],
            });
          }

          return groups;
        },
        []
      ),
    [locale, scales]
  );

  function selectCategory(category: MvpScaleCategory | null) {
    setSelectedCategory(category);
    const url = category ? `/${locale}/assessments/?category=${category}` : `/${locale}/assessments/`;
    window.history.pushState(null, '', url);
  }

  return (
    <>
      <div className="mb-10">
        <Eyebrow tone="primary">{copy.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          {copy.intro}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectCategory(null)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory
              ? 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700'
              : 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-100'
          }`}
        >
          {copy.all}
        </button>
        {mvpScaleCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => selectCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-100'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700'
            }`}
          >
            {copy.categories[category]}
          </button>
        ))}
      </div>

      {selectedCategory && scales.length === 0 && (
        <div className={`mb-8 ${softCardClass}`}>
          <h2 className="text-lg font-medium text-gray-900">
            {copy.emptyPrefix} {copy.categories[selectedCategory]} {copy.emptySuffix}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {copy.emptyText}
          </p>
          <button type="button" onClick={() => selectCategory(null)} className={`mt-5 ${secondaryButtonClass}`}>
            {copy.emptyCta}
          </button>
        </div>
      )}

      <div className="space-y-10">
        {groupedScales.map((group) => (
          <section key={group.moduleCode}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary-500">
                  {group.moduleCode}
                </p>
                <h2 className="mt-1 text-xl font-medium text-gray-900">{group.moduleName}</h2>
              </div>
              <span className="text-sm text-gray-500">
                {group.scales.length} {copy.scaleCount}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {group.scales.map((scale) => {
                const localized = getLocalizedScaleText(scale, locale);

                return (
                  <Link
                    key={scale.scale_code}
                    href={`/${locale}/assessments/${scale.scale_code}/`}
                    className={`${softPanelClass} block transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50`}
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {localized.title}
                    </h3>
                    {localized.secondaryTitle && (
                      <p className="mt-2 text-sm text-gray-500">{localized.secondaryTitle}</p>
                    )}
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {localized.description}
                    </p>
                    <p className="mt-5 text-sm font-medium text-primary-700">{copy.viewDetails}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
