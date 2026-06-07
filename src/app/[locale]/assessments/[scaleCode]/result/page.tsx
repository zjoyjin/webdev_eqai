import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, getMvpScale } from '@/lib/mvpScales';
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

export default async function MvpScaleResultPage({
  params: { locale, scaleCode },
  searchParams,
}: Props) {
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="border border-gray-200 bg-white p-6 sm:p-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          Demo result saved
        </p>
        <h1 className="text-3xl font-light text-gray-900">{scale.title_en ?? scale.title_cn}</h1>
        <p className="mt-2 text-sm text-gray-500">{scale.title_cn}</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total score</p>
            <p className="mt-2 text-3xl font-light text-gray-900">
              {typedAttempt.total_score ?? '--'}
            </p>
          </div>
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Completed</p>
            <p className="mt-3 text-sm text-gray-700">
              {typedAttempt.completed_at ? formatDate(typedAttempt.completed_at) : 'Saved'}
            </p>
          </div>
        </div>

        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          This record has been saved. The current scale is a demo version, and the score is only used
          to test the MVP flow. It does not represent a formal psychological assessment result.
        </div>

        {typedAttempt.notes && (
          <p className="mt-5 text-sm leading-6 text-gray-600">{typedAttempt.notes}</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/me/assessments`}
            className="bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-700"
          >
            View my records
          </Link>
          <Link
            href={`/${locale}/assessments`}
            className="border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900"
          >
            Browse more scales
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
