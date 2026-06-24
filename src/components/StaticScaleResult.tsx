'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Eyebrow,
  primaryButtonClass,
  secondaryButtonClass,
  softCardClass,
  softPanelClass,
} from '@/components/PageChrome';
import {
  getLocalizedDimensionText,
  getLocalizedScaleText,
  type MvpDemoItem,
  type MvpDimension,
  type MvpScale,
} from '@/lib/mvpScales';
import { readStaticAttempt, type StaticScaleAttempt, type StaticScaleResponse } from '@/lib/staticRecords';

type StaticScaleResultProps = {
  locale: string;
  scale: MvpScale;
  items: MvpDemoItem[];
  dimensions: MvpDimension[];
};

const resultCopy = {
  en: {
    saved: 'Result saved',
    totalScore: 'Total score',
    averageScore: 'Average score',
    completed: 'Completed',
    savedFallback: 'Saved',
    dimensions: 'Dimension scores',
    scoreLabel: 'Score',
    scoreRange: '1-7 scale',
    responseCount: 'Answered items',
    missingTitle: 'No local result found',
    missingText: 'This static version stores results in the current browser. Complete an assessment here to view a result.',
    boundary:
      'This record has been saved in this browser. The score and dimension summaries are for personal reflection only. This does not represent a formal psychological assessment result or diagnosis.',
    viewRecords: 'View my records',
    browseMore: 'Browse more assessments',
  },
  zh: {
    saved: '结果已保存',
    totalScore: '总分',
    averageScore: '平均分',
    completed: '完成时间',
    savedFallback: '已保存',
    dimensions: '维度得分',
    scoreLabel: '得分',
    scoreRange: '1-7 分',
    responseCount: '已答题目',
    missingTitle: '未找到本地结果',
    missingText: '静态版本会把结果保存在当前浏览器中。请在此浏览器完成一次评估后查看结果。',
    boundary: '记录已保存在当前浏览器。总分和维度摘要仅供个人参考，不代表正式心理测评结果或诊断。',
    viewRecords: '查看我的记录',
    browseMore: '浏览更多评估',
  },
};

export default function StaticScaleResult({ locale, scale, items, dimensions }: StaticScaleResultProps) {
  const copy = locale === 'zh' ? resultCopy.zh : resultCopy.en;
  const localizedScale = getLocalizedScaleText(scale, locale);
  const [attempt, setAttempt] = useState<StaticScaleAttempt | null | undefined>(undefined);

  useEffect(() => {
    const attemptId = new URLSearchParams(window.location.search).get('attemptId');
    const nextAttempt = readStaticAttempt(attemptId);
    setAttempt(nextAttempt && nextAttempt.scale_code === scale.scale_code ? nextAttempt : null);
  }, [scale.scale_code]);

  if (attempt === undefined) {
    return (
      <div className={softCardClass}>
        <p className="text-sm text-gray-600">{copy.savedFallback}</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className={`${softCardClass} text-center`}>
        <h1 className="text-2xl font-light text-gray-900">{copy.missingTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{copy.missingText}</p>
        <Link href={`/${locale}/assessments/${scale.scale_code}/`} className={`mt-6 ${primaryButtonClass}`}>
          {copy.browseMore}
        </Link>
      </div>
    );
  }

  const dimensionScores = buildDimensionScores(attempt.responses, items, dimensions, locale);
  const responseCount = attempt.responses.length;
  const averageScore =
    responseCount > 0
      ? (attempt.responses.reduce((sum, response) => sum + response.score, 0) / responseCount).toFixed(1)
      : null;

  return (
    <div className={softCardClass}>
      <Eyebrow tone="teal">{copy.saved}</Eyebrow>
      <h1 className="text-3xl font-light text-gray-900">{localizedScale.title}</h1>
      {localizedScale.secondaryTitle && (
        <p className="mt-2 text-sm text-gray-500">{localizedScale.secondaryTitle}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={softPanelClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-500">{copy.totalScore}</p>
          <p className="mt-2 text-3xl font-light text-primary-700">
            {attempt.total_score ?? '--'}
          </p>
        </div>
        <div className={softPanelClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-500">{copy.averageScore}</p>
          <p className="mt-2 text-3xl font-light text-teal-700">
            {averageScore ?? '--'}
          </p>
          <p className="mt-2 text-xs text-gray-500">{copy.scoreRange}</p>
        </div>
        <div className={softPanelClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-lavender-500">{copy.completed}</p>
          <p className="mt-3 text-sm text-gray-700">
            {attempt.completed_at ? formatDate(attempt.completed_at, locale) : copy.savedFallback}
          </p>
        </div>
        <div className={softPanelClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">{copy.responseCount}</p>
          <p className="mt-2 text-3xl font-light text-rose-700">{responseCount}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-warm-200 bg-warm-50 p-4 text-sm leading-6 text-warm-900">
        {copy.boundary}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-light text-gray-900">{copy.dimensions}</h2>
        <div className="mt-4 space-y-3">
          {dimensionScores.map((dimension) => (
            <div key={dimension.dimensionCode} className={softPanelClass}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">{dimension.title}</h3>
                    <span className="rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                      {dimension.level}
                    </span>
                  </div>
                  {dimension.secondaryTitle && (
                    <p className="mt-1 text-xs text-gray-500">{dimension.secondaryTitle}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-light text-gray-900">{dimension.average}</p>
                  <p className="text-xs text-gray-500">{copy.scoreLabel} · {dimension.count} / {copy.scoreRange}</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-teal-500"
                  style={{ width: `${Math.max(0, Math.min(100, (Number(dimension.average) / 7) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={`/${locale}/me/assessments/`} className={primaryButtonClass}>
          {copy.viewRecords}
        </Link>
        <Link href={`/${locale}/assessments/`} className={secondaryButtonClass}>
          {copy.browseMore}
        </Link>
      </div>
    </div>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function buildDimensionScores(
  responses: StaticScaleResponse[],
  items: MvpDemoItem[],
  dimensions: MvpDimension[],
  locale: string
) {
  const responseByItem = new Map(responses.map((response) => [response.item_code, response.score]));

  return dimensions
    .map((dimension) => {
      const scores = items
        .filter((item) => item.dimension_code === dimension.dimension_code)
        .map((item) => responseByItem.get(item.item_code))
        .filter((score): score is number => typeof score === 'number');

      if (scores.length === 0) return null;

      const localizedDimension = getLocalizedDimensionText(dimension, locale);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      return {
        dimensionCode: dimension.dimension_code,
        title: localizedDimension.title,
        secondaryTitle: localizedDimension.secondaryTitle,
        count: scores.length,
        average: average.toFixed(1),
        level: getDimensionLevel(average, locale),
      };
    })
    .filter((score): score is NonNullable<typeof score> => Boolean(score));
}

function getDimensionLevel(average: number, locale: string) {
  const levels =
    locale === 'zh'
      ? ['很低', '较低', '微低', '微高', '较高', '很高']
      : ['Very low', 'Low', 'Slightly low', 'Slightly high', 'High', 'Very high'];

  if (average <= 2) return levels[0];
  if (average <= 3) return levels[1];
  if (average <= 4) return levels[2];
  if (average <= 5) return levels[3];
  if (average <= 6) return levels[4];
  return levels[5];
}
