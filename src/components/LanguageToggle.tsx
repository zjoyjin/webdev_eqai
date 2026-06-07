'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);

    startTransition(() => {
      router.replace(newPath);
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={t('switchLanguage')}
    >
      {locale === 'en' ? '中文' : 'English'}
    </button>
  );
}
