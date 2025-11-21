import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export default function AboutPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations('about');

  const values = [
    { key: 'accessibility', text: t('values.accessibility') },
    { key: 'science', text: t('values.science') },
    { key: 'privacy', text: t('values.privacy') },
    { key: 'growth', text: t('values.growth') }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6">
            {t('title')}
          </h1>
        </div>
      </div>

      {/* Mission */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
            {t('mission.heading')}
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            {t('mission.text')}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Vision */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
            {t('vision.heading')}
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            {t('vision.text')}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Approach */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
            {t('approach.heading')}
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            {t('approach.text')}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-10 text-center">
            {t('values.heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.key}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <p className="text-base text-gray-700 font-light leading-relaxed">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
