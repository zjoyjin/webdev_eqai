import { NextResponse } from 'next/server';
import { getAssessmentGroups } from '@/lib/assessmentDirectory';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleCn = searchParams.get('module') ?? undefined;

  return NextResponse.json(await getAssessmentGroups(moduleCn));
}
