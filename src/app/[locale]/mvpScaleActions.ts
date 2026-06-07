'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

const MVP_SQL_SETUP_MESSAGE =
  'MVP database tables are not ready. Run backend/ingestion/mvp_scale_records.sql in Supabase SQL Editor first.';

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

  const { data: items, error: itemsError } = await supabase
    .from('assessment_demo_items')
    .select('item_code')
    .eq('active', true)
    .eq('scale_code', scaleCode)
    .order('sort_order', { ascending: true });

  if (itemsError || !items || items.length === 0) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent(formatMvpDatabaseError(itemsError?.message ?? 'No demo items are available for this scale.'))}`);
  }

  const scores = items.map((item) => {
    const value = formData.get(`score_${item.item_code}`);
    const score = typeof value === 'string' ? Number(value) : NaN;

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return null;
    }

    return score;
  });

  if (scores.some((score) => score === null)) {
    redirect(`/${locale}/assessments/${scaleCode}/take?attemptId=${attemptId}&error=${encodeURIComponent('Please answer every demo item from 1 to 5 before submitting.')}`);
  }

  const totalScore = (scores as number[]).reduce((sum, score) => sum + score, 0);
  const { error } = await supabase
    .from('user_scale_attempts')
    .update({
      status: 'completed',
      total_score: totalScore,
      completed_at: new Date().toISOString(),
      notes: `Demo flow completed with ${items.length} item scores. This is not a formal assessment result.`,
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
  return /assessment_scales|assessment_demo_items|user_scale_attempts|schema cache|PGRST205/i.test(message)
    ? MVP_SQL_SETUP_MESSAGE
    : message;
}
