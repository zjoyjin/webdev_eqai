'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type LoginFormProps = {
  locale: string;
  configured: boolean;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  nextPath?: string;
};

export default function LoginForm({
  locale,
  configured,
  supabaseUrl,
  supabasePublishableKey,
  nextPath,
}: LoginFormProps) {
  const t = useTranslations('auth');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!configured) {
      setMessage(t('notConfigured'));
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient({
        url: supabaseUrl,
        publishableKey: supabasePublishableKey,
      });
      const result =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath || `/${locale}/me/assessments`)}`,
              },
            });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (mode === 'register' && !result.data.session) {
        setMessage(t('registrationSaved'));
        return;
      }

      window.location.href = nextPath || `/${locale}/me/assessments`;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 grid grid-cols-2 border border-gray-200">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`px-4 py-3 text-sm font-medium ${
            mode === 'login' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('loginTab')}
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`px-4 py-3 text-sm font-medium ${
            mode === 'register' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('registerTab')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={pending}>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-900"
            placeholder={t('emailPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-900"
            placeholder={t('passwordPlaceholder')}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {pending ? t('working') : mode === 'login' ? t('loginButton') : t('registerButton')}
        </button>
      </form>

      {message && (
        <p role="status" aria-live="polite" className="mt-4 border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
}
