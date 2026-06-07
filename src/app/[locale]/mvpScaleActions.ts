'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

const MVP_SQL_SETUP_MESSAGE =
  'Assessment records are not ready yet. Run backend/ingestion/mvp_scale_records.sql in Supabase SQL Editor first.';

export async function startScaleAttempt(locale: string, scaleCode: string) {
  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/login?message=Supabase%20is%20not%20configured`);
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?next=/${locale}/assessments/${scaleCode}`);
  }

  const { data: existing, error: existingError } = await supabase
    .from('user_scale_attempts')
    .select('id,status')
    .eq('user_id', user.id)
    .eq('scale_code', scaleCode)
    .eq('status', 'started')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    redirect(`/${locale}/assessments/${scaleCode}?error=${encodeURIComponent(formatMvpDatabaseError(existingError.message))}`);
  }

  let attemptId = existing?.id;

  if (!attemptId) {
    const { data, error } = await supabase
      .from('user_scale_attempts')
      .insert({
        user_id: user.id,
        scale_code: scaleCode,
        status: 'started',
      })
      .select('id')
      .single();

    if (error) {
      redirect(`/${locale}/assessments/${scaleCode}?error=${encodeURIComponent(formatMvpDatabaseError(error.message))}`);
    }

    attemptId = data.id;
  }

  revalidatePath(`/${locale}/me/assessments`);
  redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}`);
}

export async function submitScaleAttempt(locale: string, scaleCode: string, attemptId: string, formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/login?message=Supabase%20is%20not%20configured`);
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?next=/${locale}/assessments/${scaleCode}/take`);
  }

  const { data: attempt, error: attemptError } = await supabase
    .from('user_scale_attempts')
    .select('id,status,started_at')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .eq('scale_code', scaleCode)
    .maybeSingle();

  if (attemptError) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent(formatMvpDatabaseError(attemptError.message))}`);
  }

  if (!attempt) {
    redirect(`/${locale}/assessments/${scaleCode}`);
  }

  if (attempt.status === 'completed') {
    redirect(`/${locale}/assessments/${scaleCode}/result?attemptId=${attemptId}`);
  }

  const { data: items, error: itemsError } = await supabase
    .from('assessment_demo_items')
    .select('item_code,dimension_code')
    .eq('active', true)
    .eq('scale_code', scaleCode)
    .order('sort_order', { ascending: true });

  if (itemsError || !items || items.length === 0) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent(formatMvpDatabaseError(itemsError?.message ?? 'No active questions are available for this assessment.'))}`);
  }

  const scores = items.map((item) => {
    const value = formData.get(`score_${item.item_code}`);
    const score = typeof value === 'string' ? Number(value) : NaN;

    if (!Number.isInteger(score) || score < 1 || score > 7) {
      return null;
    }

    return score;
  });

  if (scores.some((score) => score === null)) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent('Please answer every question from 1 to 7 before submitting.')}`);
  }

  const totalScore = (scores as number[]).reduce((sum, score) => sum + score, 0);
  const responseRows = items.map((item, index) => ({
    attempt_id: attemptId,
    user_id: user.id,
    item_code: item.item_code,
    score: (scores as number[])[index],
  }));

  const { error: responsesError } = await supabase
    .from('user_scale_responses')
    .upsert(responseRows, { onConflict: 'attempt_id,item_code' });

  if (responsesError) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent(formatMvpDatabaseError(responsesError.message))}`);
  }

  const { error } = await supabase
    .from('user_scale_attempts')
    .update({
      status: 'completed',
      total_score: totalScore,
      completed_at: getCompletedAt(attempt.started_at),
      notes: null,
    })
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .eq('scale_code', scaleCode)
    .select('id')
    .single();

  if (error) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent(formatMvpDatabaseError(error.message))}`);
  }

  revalidatePath(`/${locale}/me/assessments`);
  redirect(`/${locale}/assessments/${scaleCode}/result?attemptId=${attemptId}`);
}

export async function signOut(locale: string) {
  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/login`);
  }

  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

function formatMvpDatabaseError(message: string) {
  return /assessment_scales|assessment_demo_items|user_scale_attempts|user_scale_responses|schema cache|PGRST205/i.test(message)
    ? MVP_SQL_SETUP_MESSAGE
    : message;
}

function getCompletedAt(startedAt: string) {
  const now = Date.now();
  const started = Date.parse(startedAt);
  const completed = Number.isFinite(started) ? Math.max(now, started) : now;

  return new Date(completed).toISOString();
}
