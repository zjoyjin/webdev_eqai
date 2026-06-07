import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type Props = {
  params: { locale: string };
};

export default function PersonalAssessmentPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations('assessments.personal');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">
        {t('title')}
      </h1>

      <div className="bg-white border border-gray-200 p-8 sm:p-10">
        <p className="text-gray-600 font-light leading-7">
          {t('description')}
        </p>
        <p className="mt-4 text-sm text-gray-500 leading-6">
          {t('note')}
        </p>
        <Link
          href={`/${locale}/assessments?category=personal`}
          className="mt-8 inline-block bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
