'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type BrowserConfig = {
  url?: string;
  publishableKey?: string;
};

export function createSupabaseBrowserClient(config: BrowserConfig = {}) {
  const url = config.url ?? supabaseUrl;
  const publishableKey = config.publishableKey ?? supabasePublishableKey;

  if (!url || !publishableKey) {
    throw new Error('Supabase browser environment variables are not configured.');
  }

  return createBrowserClient(url, publishableKey);
}
