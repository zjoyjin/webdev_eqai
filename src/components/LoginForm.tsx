'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { inputClass, primaryButtonClass, softCardClass } from '@/components/PageChrome';

type LoginFormProps = {
  locale: string;
  nextPath?: string;
};

export default function LoginForm({
  locale,
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

    setPending(true);

    try {
      window.localStorage.setItem(
        'eqai.static.user.v1',
        JSON.stringify({ email, mode, signedInAt: new Date().toISOString() })
      );
      window.location.href = nextPath || `/${locale}/me/assessments`;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={softCardClass}>
      <div className="mb-6 grid grid-cols-2 rounded-full border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-full px-4 py-3 text-sm font-medium transition-colors ${
            mode === 'login' ? 'bg-primary-600 text-white shadow-md shadow-primary-100' : 'text-gray-600 hover:text-primary-700'
          }`}
        >
          {t('loginTab')}
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-full px-4 py-3 text-sm font-medium transition-colors ${
            mode === 'register' ? 'bg-primary-600 text-white shadow-md shadow-primary-100' : 'text-gray-600 hover:text-primary-700'
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
            className={inputClass}
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
            className={inputClass}
            placeholder={t('passwordPlaceholder')}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`w-full ${primaryButtonClass}`}
        >
          {pending ? t('working') : mode === 'login' ? t('loginButton') : t('registerButton')}
        </button>
      </form>

      {message && (
        <p role="status" aria-live="polite" className="mt-4 rounded-2xl border border-primary-100 bg-primary-50 p-3 text-sm text-primary-800">
          {message}
        </p>
      )}
    </div>
  );
}
