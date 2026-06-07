import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Eyebrow, PageShell, primaryButtonClass, softCardClass } from '@/components/PageChrome';

type Props = {
  params: { locale: string };
};

export default function PersonalAssessmentPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations('assessments.personal');

  return (
    <PageShell maxWidth="max-w-4xl">
      <Eyebrow tone="teal">{t('title')}</Eyebrow>
      <div className={softCardClass}>
        <h1 className="mb-6 text-3xl font-light text-gray-900 sm:text-4xl">
          {t('title')}
        </h1>
        <p className="text-gray-600 font-light leading-7">
          {t('description')}
        </p>
        <p className="mt-4 text-sm text-gray-500 leading-6">
          {t('note')}
        </p>
        <Link
          href={`/${locale}/assessments?category=personal`}
          className={`mt-8 ${primaryButtonClass}`}
        >
          {t('cta')}
        </Link>
      </div>
    </PageShell>
  );
}
