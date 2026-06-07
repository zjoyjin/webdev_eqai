import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

const INQUIRY_TYPES = [
  'assessment_interest',
  'partnership',
  'research',
  'review_feedback',
  'other',
] as const;
const INTERESTED_CATEGORIES = ['general', 'work', 'personal', 'kid', 'pet'] as const;
const AUDIENCE_TYPES = ['self', 'parent', 'educator', 'organization', 'reviewer', 'other'] as const;
const LOCALES = ['en', 'zh'] as const;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  inquiryType?: unknown;
  interestedCategory?: unknown;
  audienceType?: unknown;
  subject?: unknown;
  message?: unknown;
  consentContact?: unknown;
  sourceLocale?: unknown;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonError('Contact submissions are not configured yet.', 503);
  }

  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonError('Invalid JSON payload.', 400);
  }

  const validation = validateContactPayload(payload);

  if (!validation.ok) {
    return jsonError(validation.error, 400);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('contact_submissions').insert({
    name: validation.data.name,
    email: validation.data.email,
    inquiry_type: validation.data.inquiryType,
    interested_category: validation.data.interestedCategory,
    audience_type: validation.data.audienceType,
    subject: validation.data.subject,
    message: validation.data.message,
    consent_contact: validation.data.consentContact,
    source_locale: validation.data.sourceLocale,
    user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
  });

  if (error) {
    return jsonError(formatContactDatabaseError(error.message), 500);
  }

  return NextResponse.json({ ok: true });
}

function validateContactPayload(payload: ContactPayload) {
  const name = readTrimmedString(payload.name);
  const email = readTrimmedString(payload.email).toLowerCase();
  const subject = readTrimmedString(payload.subject);
  const message = readTrimmedString(payload.message);
  const inquiryType = readEnum(payload.inquiryType, INQUIRY_TYPES);
  const interestedCategory = readEnum(payload.interestedCategory, INTERESTED_CATEGORIES);
  const audienceType = readEnum(payload.audienceType, AUDIENCE_TYPES);
  const sourceLocale = readEnum(payload.sourceLocale, LOCALES);

  if (name.length < 2 || name.length > 120) {
    return failed('Name must be between 2 and 120 characters.');
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return failed('Enter a valid email address.');
  }

  if (!inquiryType) {
    return failed('Choose an inquiry type.');
  }

  if (!interestedCategory) {
    return failed('Choose an assessment category.');
  }

  if (!audienceType) {
    return failed('Choose an audience type.');
  }

  if (subject.length < 2 || subject.length > 160) {
    return failed('Subject must be between 2 and 160 characters.');
  }

  if (message.length < 10 || message.length > 4000) {
    return failed('Message must be between 10 and 4000 characters.');
  }

  if (payload.consentContact !== true) {
    return failed('Consent is required before submitting.');
  }

  if (!sourceLocale) {
    return failed('Unsupported locale.');
  }

  return {
    ok: true as const,
    data: {
      name,
      email,
      inquiryType,
      interestedCategory,
      audienceType,
      subject,
      message,
      consentContact: true,
      sourceLocale,
    },
  };
}

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function readEnum<T extends readonly string[]>(value: unknown, allowed: T): T[number] | null {
  return typeof value === 'string' && allowed.includes(value) ? value : null;
}

function failed(error: string) {
  return { ok: false as const, error };
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

function formatContactDatabaseError(message: string) {
  return /contact_submissions|schema cache|PGRST205/i.test(message)
    ? 'Contact submissions are not ready. Run backend/ingestion/contact_submissions.sql in Supabase first.'
    : message;
}
