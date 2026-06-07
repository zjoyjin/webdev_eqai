import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { submitScaleAttempt } from '@/app/[locale]/mvpScaleActions';
import { getCurrentUser, getLocalizedItemText, getLocalizedScaleText, getMvpDemoItems, getMvpScale } from '@/lib/mvpScales';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Props = {
  params: { locale: string; scaleCode: string };
  searchParams: { attemptId?: string; error?: string };
};

type AttemptRow = {
  id: string;
  status: 'started' | 'completed';
  started_at: string;
  completed_at: string | null;
};

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

const takeCopy = {
  en: {
    back: 'Back',
    itemCount: 'questions',
    eyebrow: 'Assessment',
    intro:
      'Answer each item from 1 to 5. Your saved score is for personal reference and is not a formal psychological result.',
    emptyTitle: 'No questions available',
    emptyText: 'This assessment is available in the catalog, but questions are not active yet.',
    question: 'Question',
    of: 'of',
    low: 'Strongly disagree',
    high: 'Strongly agree',
    submit: 'Save result',
  },
  zh: {
    back: '返回',
    itemCount: '道题',
    eyebrow: '评估作答',
    intro: '请按 1 到 5 分回答每道题。保存的分数仅供个人参考，不代表正式心理测评结果。',
    emptyTitle: '暂无可作答题目',
    emptyText: '该评估已在目录中展示，但题目尚未启用。',
    question: '第',
    of: '题，共',
    low: '非常不同意',
    high: '非常同意',
    submit: '保存结果',
  },
};

export default async function TakeMvpScalePage({
  params: { locale, scaleCode },
  searchParams,
}: Props) {
  const copy = locale === 'zh' ? takeCopy.zh : takeCopy.en;
  const attemptId = searchParams.attemptId;

  if (!attemptId) {
    redirect(`/${locale}/assessments/${scaleCode}`);
  }

  const [scale, demoItems, user] = await Promise.all([
    getMvpScale(scaleCode),
    getMvpDemoItems(scaleCode),
    getCurrentUser(),
  ]);

  if (!scale) {
    notFound();
  }

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/assessments/${scaleCode}`);
  }

  const supabase = createSupabaseServerClient();
  const { data: attempt, error: attemptError } = await supabase
    .from('user_scale_attempts')
    .select('id,status,started_at,completed_at')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .eq('scale_code', scale.scale_code)
    .maybeSingle();

  if (attemptError) {
    redirect(`/${locale}/assessments/${scaleCode}?error=${encodeURIComponent(attemptError.message)}`);
  }

  if (!attempt) {
    redirect(`/${locale}/assessments/${scaleCode}`);
  }

  const typedAttempt = attempt as AttemptRow;

  if (typedAttempt.status === 'completed') {
    redirect(`/${locale}/me/assessments`);
  }

  const localizedScale = getLocalizedScaleText(scale, locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href={`/${locale}/assessments/${scale.scale_code}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          {copy.back}
        </Link>
        <span className="text-sm text-gray-500">
          {locale === 'zh' ? `${demoItems.length}${copy.itemCount}` : `${demoItems.length} ${copy.itemCount}`}
        </span>
      </div>

      <div className="mb-8 border border-gray-200 bg-white p-6">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-light text-gray-900">{localizedScale.title}</h1>
        {localizedScale.secondaryTitle && (
          <p className="mt-2 text-sm text-gray-500">{localizedScale.secondaryTitle}</p>
        )}
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {copy.intro}
        </p>
      </div>

      {searchParams.error && (
        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {searchParams.error}
        </div>
      )}

      {demoItems.length === 0 ? (
        <div className="border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-gray-900">{copy.emptyTitle}</h2>
          <p className="mt-3 text-sm text-gray-600">
            {copy.emptyText}
          </p>
        </div>
      ) : (
        <form
          action={async (formData) => {
            'use server';
            await submitScaleAttempt(locale, scale.scale_code, typedAttempt.id, formData);
          }}
          className="space-y-5"
        >
          <div className="h-2 bg-gray-100">
            <div className="h-2 bg-gray-900" style={{ width: '100%' }} />
          </div>

          <div className="space-y-4">
            {demoItems.map((item, index) => {
              const localizedItem = getLocalizedItemText(item, locale);

              return (
                <fieldset key={item.item_code} className="border border-gray-200 bg-white p-5">
                  <legend className="px-1 text-sm font-medium text-gray-500">
                    {locale === 'zh'
                      ? `${copy.question}${index + 1}${copy.of}${demoItems.length}${copy.itemCount}`
                      : `${copy.question} ${index + 1} ${copy.of} ${demoItems.length}`}
                  </legend>
                  <p className="mt-3 text-base font-medium leading-7 text-gray-900">
                    {localizedItem.prompt}
                  </p>
                  {localizedItem.secondaryPrompt && (
                    <p className="mt-2 text-sm leading-6 text-gray-500">{localizedItem.secondaryPrompt}</p>
                  )}

                  <div className="mt-5 grid grid-cols-5 gap-2">
                    {SCORE_OPTIONS.map((score) => (
                      <label
                        key={score}
                        className="flex cursor-pointer items-center justify-center border border-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-700 hover:border-gray-900 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-900 has-[:checked]:text-white"
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name={`score_${item.item_code}`}
                          value={score}
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
            className="w-full bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            {copy.submit}
          </button>
        </form>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
