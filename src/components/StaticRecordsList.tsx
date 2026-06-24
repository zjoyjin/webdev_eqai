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
import { clearStaticAttempts, readStaticAttempts, type StaticScaleAttempt } from '@/lib/staticRecords';

type StaticRecordsListProps = {
  locale: string;
  copy: {
    eyebrow: string;
    title: string;
    intro: string;
    logout: string;
    emptyTitle: string;
    emptyText: string;
    browseDemoScales: string;
    demoScale: string;
    started: string;
    completed: string;
    details: string;
    continue: string;
    viewResult: string;
  };
};

export default function StaticRecordsList({ locale, copy }: StaticRecordsListProps) {
  const [attempts, setAttempts] = useState<StaticScaleAttempt[]>([]);

  useEffect(() => {
    setAttempts(readStaticAttempts());
  }, []);

  function handleClear() {
    clearStaticAttempts();
    setAttempts([]);
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Eyebrow tone="primary">{copy.eyebrow}</Eyebrow>
          <h1 className="text-3xl font-light text-gray-900">{copy.title}</h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            {copy.intro}
          </p>
        </div>
        <button type="button" onClick={handleClear} className={secondaryButtonClass}>
          {copy.logout}
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className={`${softCardClass} text-center`}>
          <h2 className="text-lg font-medium text-gray-900">{copy.emptyTitle}</h2>
          <p className="mt-3 text-sm text-gray-600">
            {copy.emptyText}
          </p>
          <Link href={`/${locale}/assessments/`} className={`mt-6 ${primaryButtonClass}`}>
            {copy.browseDemoScales}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const title = getAttemptTitle(attempt, locale);
            const moduleName = getAttemptModuleName(attempt, locale, copy.demoScale);

            return (
              <div key={attempt.id} className={softPanelClass}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary-100 bg-primary-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-primary-700">
                        {attempt.status}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-teal-500">
                        {moduleName}
                      </span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                    <p className="mt-2 text-sm text-gray-500">
                      {copy.started}: {formatDate(attempt.started_at, locale)}
                      {attempt.completed_at ? ` · ${copy.completed}: ${formatDate(attempt.completed_at, locale)}` : ''}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/${locale}/assessments/${attempt.scale_code}/`} className={secondaryButtonClass}>
                      {copy.details}
                    </Link>
                    {attempt.status === 'started' && (
                      <Link
                        href={`/${locale}/assessments/${attempt.scale_code}/take/?attemptId=${encodeURIComponent(attempt.id)}`}
                        className={primaryButtonClass}
                      >
                        {copy.continue}
                      </Link>
                    )}
                    {attempt.status === 'completed' && (
                      <Link
                        href={`/${locale}/assessments/${attempt.scale_code}/result/?attemptId=${encodeURIComponent(attempt.id)}`}
                        className={primaryButtonClass}
                      >
                        {copy.viewResult}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getAttemptTitle(attempt: StaticScaleAttempt, locale: string) {
  if (locale === 'zh') {
    return attempt.assessment_scales?.title_cn ?? attempt.assessment_scales?.title_en ?? attempt.scale_code;
  }

  return attempt.assessment_scales?.title_en ?? attempt.assessment_scales?.title_cn ?? attempt.scale_code;
}

function getAttemptModuleName(attempt: StaticScaleAttempt, locale: string, fallback: string) {
  if (locale === 'zh') {
    return attempt.assessment_scales?.module_name_cn ?? attempt.assessment_scales?.module_name_en ?? fallback;
  }

  return attempt.assessment_scales?.module_name_en ?? attempt.assessment_scales?.module_name_cn ?? fallback;
}
