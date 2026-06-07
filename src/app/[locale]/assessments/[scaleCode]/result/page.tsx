import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, getLocalizedScaleText, getMvpScale } from '@/lib/mvpScales';
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

const resultCopy = {
  en: {
    saved: 'Result saved',
    totalScore: 'Total score',
    completed: 'Completed',
    savedFallback: 'Saved',
    boundary:
      'This record has been saved. The score is for personal reference only and does not represent a formal psychological assessment result or diagnosis.',
    viewRecords: 'View my records',
    browseMore: 'Browse more assessments',
  },
  zh: {
    saved: '结果已保存',
    totalScore: '总分',
    completed: '完成时间',
    savedFallback: '已保存',
    boundary: '记录已保存。分数仅供个人参考，不代表正式心理测评结果或诊断。',
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

  const [scale, user] = await Promise.all([getMvpScale(scaleCode), getCurrentUser()]);

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

  const localizedScale = getLocalizedScaleText(scale, locale);

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
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{copy.completed}</p>
            <p className="mt-3 text-sm text-gray-700">
              {typedAttempt.completed_at ? formatDate(typedAttempt.completed_at, locale) : copy.savedFallback}
            </p>
          </div>
        </div>

        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {copy.boundary}
        </div>

        {typedAttempt.notes && (
          <p className="mt-5 text-sm leading-6 text-gray-600">{typedAttempt.notes}</p>
        )}

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
