'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default function Navigation() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href={`/${locale}`}
            className="text-xl font-normal text-gray-900 hover:text-gray-700 transition-colors"
          >
            {t('common.appName')}
          </Link>

          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
