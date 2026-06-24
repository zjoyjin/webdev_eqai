'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eyebrow, primaryButtonClass, secondaryButtonClass, softCardClass } from '@/components/PageChrome';
import {
  getLocalizedItemText,
  getLocalizedScaleText,
  type MvpDemoItem,
  type MvpScale,
} from '@/lib/mvpScales';
import {
  completeStaticAttempt,
  ensureStaticAttempt,
  readStaticAttempt,
  type StaticScaleAttempt,
  type StaticScaleResponse,
} from '@/lib/staticRecords';

type StaticScaleTakeProps = {
  locale: string;
  scale: MvpScale;
  items: MvpDemoItem[];
};

const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const takeCopy = {
  en: {
    back: 'Back',
    itemCount: 'questions',
    eyebrow: 'Assessment',
    intro:
      'Answer each item from 1 to 7. Your saved score is stored in this browser and is not a formal psychological result.',
    emptyTitle: 'No questions available',
    emptyText: 'This assessment is available in the catalog, but questions are not active yet.',
    question: 'Question',
    of: 'of',
    low: 'Strongly disagree',
    high: 'Strongly agree',
    submit: 'Save result',
    saving: 'Saving result...',
    error: 'Please answer every question from 1 to 7 before submitting.',
  },
  zh: {
    back: '返回',
    itemCount: '道题',
    eyebrow: '评估作答',
    intro: '请按 1 到 7 分回答每道题。保存的分数会存放在当前浏览器中，不代表正式心理测评结果。',
    emptyTitle: '暂无可作答题目',
    emptyText: '该评估已在目录中展示，但题目尚未启用。',
    question: '第',
    of: '题，共',
    low: '非常不同意',
    high: '非常同意',
    submit: '保存结果',
    saving: '保存中...',
    error: '请先按 1 到 7 分回答每道题。',
  },
};

export default function StaticScaleTake({ locale, scale, items }: StaticScaleTakeProps) {
  const router = useRouter();
  const copy = locale === 'zh' ? takeCopy.zh : takeCopy.en;
  const localizedScale = getLocalizedScaleText(scale, locale);
  const [attempt, setAttempt] = useState<StaticScaleAttempt | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const itemCountLabel = locale === 'zh' ? `${items.length}${copy.itemCount}` : `${items.length} ${copy.itemCount}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const attemptId = params.get('attemptId');
    const nextAttempt = ensureStaticAttempt(scale, attemptId);
    setAttempt(nextAttempt);
    setScores(
      Object.fromEntries(
        nextAttempt.responses.map((response) => [response.item_code, response.score])
      )
    );

    if (!attemptId) {
      const nextUrl = `/${locale}/assessments/${scale.scale_code}/take/?attemptId=${encodeURIComponent(nextAttempt.id)}`;
      window.history.replaceState(null, '', nextUrl);
    }
  }, [locale, scale]);

  const allAnswered = useMemo(
    () => items.every((item) => Number.isInteger(scores[item.item_code])),
    [items, scores]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const currentAttempt = attempt ?? readStaticAttempt(new URLSearchParams(window.location.search).get('attemptId'));
    if (!currentAttempt || !allAnswered) {
      setError(copy.error);
      return;
    }

    setPending(true);
    const responses: StaticScaleResponse[] = items.map((item) => ({
      item_code: item.item_code,
      dimension_code: item.dimension_code,
      score: scores[item.item_code],
    }));
    const completed = completeStaticAttempt(scale, currentAttempt.id, responses);
    router.push(`/${locale}/assessments/${scale.scale_code}/result/?attemptId=${encodeURIComponent(completed.id)}`);
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href={`/${locale}/assessments/${scale.scale_code}/`} className={secondaryButtonClass}>
          {copy.back}
        </Link>
        <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
          {itemCountLabel}
        </span>
      </div>

      <div className={`mb-8 ${softCardClass}`}>
        <Eyebrow tone="primary">{copy.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-light text-gray-900">{localizedScale.title}</h1>
        {localizedScale.secondaryTitle && (
          <p className="mt-2 text-sm text-gray-500">{localizedScale.secondaryTitle}</p>
        )}
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {copy.intro}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className={softCardClass}>
          <h2 className="text-lg font-medium text-gray-900">{copy.emptyTitle}</h2>
          <p className="mt-3 text-sm text-gray-600">
            {copy.emptyText}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={pending}>
          <div className="h-2 overflow-hidden rounded-full bg-primary-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-teal-500" style={{ width: '100%' }} />
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const localizedItem = getLocalizedItemText(item, locale);

              return (
                <fieldset key={item.item_code} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-primary-100/30">
                  <legend className="rounded-full bg-white px-2 text-sm font-medium text-primary-600">
                    {locale === 'zh'
                      ? `${copy.question}${index + 1}${copy.of}${items.length}${copy.itemCount}`
                      : `${copy.question} ${index + 1} ${copy.of} ${items.length}`}
                  </legend>
                  <p className="mt-3 text-base font-medium leading-7 text-gray-900">
                    {localizedItem.prompt}
                  </p>
                  {localizedItem.secondaryPrompt && (
                    <p className="mt-2 text-sm leading-6 text-gray-500">{localizedItem.secondaryPrompt}</p>
                  )}

                  <div className="mt-5 grid grid-cols-7 gap-2">
                    {SCORE_OPTIONS.map((score) => (
                      <label
                        key={score}
                        className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-600 has-[:checked]:text-white"
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name={`score_${item.item_code}`}
                          value={score}
                          checked={scores[item.item_code] === score}
                          onChange={() => setScores((current) => ({ ...current, [item.item_code]: score }))}
                          required
                        />
                        {score}
                      </label>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-gray-400">
                    <span>{copy.low}</span>
                    <span>{copy.high}</span>
                  </div>
                </fieldset>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`w-full ${primaryButtonClass}`}
            aria-disabled={pending}
          >
            {pending ? copy.saving : copy.submit}
          </button>
        </form>
      )}
    </>
  );
}
