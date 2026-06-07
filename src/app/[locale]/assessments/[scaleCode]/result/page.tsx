import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  getCurrentUser,
  getLocalizedDimensionText,
  getLocalizedScaleText,
  getMvpDemoItems,
  getMvpDimensions,
  getMvpScale,
} from '@/lib/mvpScales';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Props = {
  params: { locale: string; scaleCode: string };
  searchParams: { attemptId?: string };
};

type ResultAttempt = {
  id: string;
  status: 'started' | 'completed';
  total_score: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
};

type ResultResponse = {
  item_code: string;
  score: number;
};

const resultCopy = {
  en: {
    saved: 'Result saved',
    totalScore: 'Total score',
    averageScore: 'Average score',
    completed: 'Completed',
    savedFallback: 'Saved',
    summary: 'Summary',
    dimensions: 'Dimension scores',
    scoreLabel: 'Score',
    scoreRange: '1-7 scale',
    responseCount: 'Answered items',
    emptyResponses:
      'This record was saved before item-level responses were stored. Complete the assessment again to see dimension scores.',
    boundary:
      'This record has been saved. The score and dimension summaries are for personal reflection only. This does not represent a formal psychological assessment result or diagnosis.',
    viewRecords: 'View my records',
    browseMore: 'Browse more assessments',
  },
  zh: {
    saved: '结果已保存',
    totalScore: '总分',
    averageScore: '平均分',
    completed: '完成时间',
    savedFallback: '已保存',
    summary: '结果摘要',
    dimensions: '维度得分',
    scoreLabel: '得分',
    scoreRange: '1-7 分',
    responseCount: '已答题目',
    emptyResponses: '这条记录保存时尚未记录逐题分数。重新完成一次评估后，可以查看维度得分。',
    boundary: '记录已保存。总分和维度摘要仅供个人参考，不代表正式心理测评结果或诊断。',
    viewRecords: '查看我的记录',
    browseMore: '浏览更多评估',
  },
};

export default async function MvpScaleResultPage({
  params: { locale, scaleCode },
  searchParams,
}: Props) {
  const copy = locale === 'zh' ? resultCopy.zh : resultCopy.en;
  const attemptId = searchParams.attemptId;

  if (!attemptId) {
    redirect(`/${locale}/me/assessments`);
  }

  const [scale, user, demoItems, dimensions] = await Promise.all([
    getMvpScale(scaleCode),
    getCurrentUser(),
    getMvpDemoItems(scaleCode),
    getMvpDimensions(scaleCode),
  ]);

  if (!scale) {
    notFound();
  }

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/assessments/${scaleCode}/result`);
  }

  const supabase = createSupabaseServerClient();
  const { data: attempt, error } = await supabase
    .from('user_scale_attempts')
    .select('id,status,total_score,notes,started_at,completed_at')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .eq('scale_code', scale.scale_code)
    .maybeSingle();

  if (error) {
    redirect(`/${locale}/me/assessments?error=${encodeURIComponent(error.message)}`);
  }

  if (!attempt) {
    redirect(`/${locale}/me/assessments`);
  }

  const typedAttempt = attempt as ResultAttempt;

  if (typedAttempt.status !== 'completed') {
    redirect(`/${locale}/assessments/${scale.scale_code}/take?attemptId=${typedAttempt.id}`);
  }

  const { data: responses, error: responsesError } = await supabase
    .from('user_scale_responses')
    .select('item_code,score')
    .eq('attempt_id', typedAttempt.id)
    .eq('user_id', user.id);

  if (responsesError) {
    redirect(`/${locale}/me/assessments?error=${encodeURIComponent(responsesError.message)}`);
  }

  const localizedScale = getLocalizedScaleText(scale, locale);
  const typedResponses = (responses ?? []) as ResultResponse[];
  const dimensionScores = buildDimensionScores(typedResponses, demoItems, dimensions, locale);
  const responseCount = typedResponses.length;
  const averageScore =
    responseCount > 0
      ? (typedResponses.reduce((sum, response) => sum + response.score, 0) / responseCount).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="border border-gray-200 bg-white p-6 sm:p-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          {copy.saved}
        </p>
        <h1 className="text-3xl font-light text-gray-900">{localizedScale.title}</h1>
        {localizedScale.secondaryTitle && (
          <p className="mt-2 text-sm text-gray-500">{localizedScale.secondaryTitle}</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{copy.totalScore}</p>
            <p className="mt-2 text-3xl font-light text-gray-900">
              {typedAttempt.total_score ?? '--'}
            </p>
          </div>
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{copy.averageScore}</p>
            <p className="mt-2 text-3xl font-light text-gray-900">
              {averageScore ?? '--'}
            </p>
            <p className="mt-2 text-xs text-gray-500">{copy.scoreRange}</p>
          </div>
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{copy.completed}</p>
            <p className="mt-3 text-sm text-gray-700">
              {typedAttempt.completed_at ? formatDate(typedAttempt.completed_at, locale) : copy.savedFallback}
            </p>
          </div>
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{copy.responseCount}</p>
            <p className="mt-2 text-3xl font-light text-gray-900">{responseCount}</p>
          </div>
        </div>

        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {copy.boundary}
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-light text-gray-900">{copy.dimensions}</h2>
          {dimensionScores.length === 0 ? (
            <p className="mt-4 border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
              {copy.emptyResponses}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {dimensionScores.map((dimension) => (
                <div key={dimension.dimensionCode} className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">{dimension.title}</h3>
                        <span className="border border-gray-300 px-2 py-0.5 text-xs text-gray-600">
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
                  <div className="mt-3 h-2 bg-gray-100">
                    <div
                      className="h-2 bg-gray-900"
                      style={{ width: `${Math.max(0, Math.min(100, (Number(dimension.average) / 7) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/me/assessments`}
            className="bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-700"
          >
            {copy.viewRecords}
          </Link>
          <Link
            href={`/${locale}/assessments`}
            className="border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
          >
            {copy.browseMore}
          </Link>
        </div>
      </div>
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

function buildDimensionScores(
  responses: ResultResponse[],
  items: Awaited<ReturnType<typeof getMvpDemoItems>>,
  dimensions: Awaited<ReturnType<typeof getMvpDimensions>>,
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
