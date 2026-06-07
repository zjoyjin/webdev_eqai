'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { inputClass, primaryButtonClass, softCardClass } from '@/components/PageChrome';

type ContactFormProps = {
  locale: string;
};

const inquiryTypes = [
  'assessment_interest',
  'partnership',
  'research',
  'review_feedback',
  'other',
] as const;
const interestedCategories = ['general', 'work', 'personal', 'kid', 'pet'] as const;
const audienceTypes = ['self', 'parent', 'educator', 'organization', 'reviewer', 'other'] as const;

export default function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations('contact.form');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('idle');
    setMessage('');
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          inquiryType: formData.get('inquiryType'),
          interestedCategory: formData.get('interestedCategory'),
          audienceType: formData.get('audienceType'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          consentContact: formData.get('consentContact') === 'on',
          sourceLocale: locale,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setStatus('error');
        setMessage(result.error || t('error'));
        return;
      }

      event.currentTarget.reset();
      setStatus('success');
      setMessage(t('success'));
    } catch {
      setStatus('error');
      setMessage(t('error'));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${softCardClass} space-y-6`} aria-busy={pending}>
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          {t('name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder={t('placeholder.name')}
          className={inputClass}
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder={t('placeholder.email')}
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
            {t('inquiryType')}
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            className={inputClass}
            defaultValue="assessment_interest"
            required
          >
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {t(`inquiryTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="interestedCategory" className="block text-sm font-medium text-gray-700 mb-2">
            {t('interestedCategory')}
          </label>
          <select
            id="interestedCategory"
            name="interestedCategory"
            className={inputClass}
            defaultValue="general"
            required
          >
            {interestedCategories.map((category) => (
              <option key={category} value={category}>
                {t(`interestedCategories.${category}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audienceType" className="block text-sm font-medium text-gray-700 mb-2">
            {t('audienceType')}
          </label>
          <select
            id="audienceType"
            name="audienceType"
            className={inputClass}
            defaultValue="self"
            required
          >
            {audienceTypes.map((audienceType) => (
              <option key={audienceType} value={audienceType}>
                {t(`audienceTypes.${audienceType}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          {t('subject')}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder={t('placeholder.subject')}
          className={inputClass}
          required
        />
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          {t('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder={t('placeholder.message')}
          className={`${inputClass} resize-none`}
          required
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-gray-600">
        <input
          type="checkbox"
          name="consentContact"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          required
        />
        <span>
          {t('consentPrefix')}{' '}
          <Link href={`/${locale}/privacy`} className="font-medium text-primary-700 underline underline-offset-4">
            {t('privacyPolicy')}
          </Link>
          {' '}
          {t('consentConnector')}{' '}
          <Link href={`/${locale}/terms`} className="font-medium text-primary-700 underline underline-offset-4">
            {t('termsOfService')}
          </Link>
          {t('consentSuffix')}
        </span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className={`w-full px-8 py-4 text-base ${primaryButtonClass}`}
      >
        {pending ? t('submitting') : t('submit')}
      </button>

      {message && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-lg border p-4 text-sm ${
            status === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
