import { NextResponse } from 'next/server';
import { getAssessmentMeasures } from '@/lib/assessmentDirectory';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupCode = searchParams.get('group') ?? undefined;

  return NextResponse.json(await getAssessmentMeasures(groupCode));
}
