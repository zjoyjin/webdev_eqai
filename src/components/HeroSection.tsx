import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-lavender-50 to-teal-50"></div>

      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-lavender-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              Emotional Intelligence x AI
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-light mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={`/${locale}#assessments`}
                className="inline-block px-8 py-4 bg-primary-600 text-white text-base font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
              >
                {t('cta')}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="inline-block px-8 py-4 bg-white text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-lavender-100 to-teal-100 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border border-white/50">
              {/* Placeholder for hero image */}
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-200 to-lavender-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-16 h-16 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-base text-gray-600 font-medium mb-2">
                  {t('imageAlt')}
                </p>
                <p className="text-sm text-gray-500">
                  Upload your hero image here
                </p>
              </div>
              {/* Uncomment and use this when you have an image: */}
              {/* <Image
                src="/hero-banner.jpg"
                alt={t('imageAlt')}
                fill
                className="object-cover"
                priority
              /> */}
            </div>

            {/* Floating stats cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Evidence-Based</p>
                  <p className="text-xs text-gray-500">Research-backed methods</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lavender-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-lavender-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI-Powered</p>
                  <p className="text-xs text-gray-500">Smart insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
