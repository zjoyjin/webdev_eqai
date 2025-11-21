import { useTranslations } from 'next-intl';

export default function KidAssessmentPage() {
  const t = useTranslations('assessments.kid');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">
        {t('title')}
      </h1>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12">
        <p className="text-gray-600 text-center font-light">
          {t('placeholder')}
        </p>
      </div>
    </div>
  );
}
