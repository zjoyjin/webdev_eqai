import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero');

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-light mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
            <Link
              href={`/${locale}#assessments`}
              className="inline-block px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              {t('cta')}
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              {/* Placeholder for hero image */}
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-500"
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
                <p className="text-sm text-gray-500 font-light">
                  {t('imageAlt')}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Replace this with your custom hero image
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
          </div>
        </div>
      </div>
    </section>
  );
}
