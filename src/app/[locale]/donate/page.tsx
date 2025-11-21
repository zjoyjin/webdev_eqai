import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type Props = {
  params: { locale: string };
};

export default function DonatePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations('donate');

  const impactPoints = [
    t('impact.point1'),
    t('impact.point2'),
    t('impact.point3'),
    t('impact.point4')
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
            {t('intro')}
          </p>
        </div>
      </div>

      {/* Impact Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
            {t('impact.heading')}
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
            {t('impact.text')}
          </p>
          <ul className="space-y-4">
            {impactPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-6 h-6 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 font-light">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* How to Donate Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
            {t('howToHelp.heading')}
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
            {t('howToHelp.text')}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            {t('button')}
          </Link>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl font-light text-gray-900">
            {t('thanks')}
          </p>
        </div>
      </section>
    </div>
  );
}
