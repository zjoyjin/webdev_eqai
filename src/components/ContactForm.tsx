'use client';

import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact.form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - form functionality to be implemented
    alert('Form submission is not yet implemented. This is a placeholder.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
          required
        />
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
      >
        {t('submit')}
      </button>
    </form>
  );
}
