import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import AssessmentCard from '@/components/AssessmentCard';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import Footer from '@/components/Footer';
import ChatBox from '@/components/ChatBox';

type Props = {
  params: { locale: string };
};

export default function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations();

  const categories = [
    { key: 'work', href: '/work', color: 'primary' as const },
    { key: 'personal', href: '/personal', color: 'teal' as const },
    { key: 'kid', href: '/kid', color: 'lavender' as const },
    { key: 'pet', href: '/pet', color: 'rose' as const },
  ];

  const features = [
    {
      key: 'whatIsEqai',
      title: t('features.whatIsEqai.title'),
      description: t('features.whatIsEqai.description'),
      color: 'primary' as const,
      icon: 'brain' as const,
    },
    {
      key: 'whyMatters',
      title: t('features.whyMatters.title'),
      description: t('features.whyMatters.description'),
      color: 'rose' as const,
      icon: 'heart' as const,
    },
    {
      key: 'whoFor',
      title: t('features.whoFor.title'),
      description: t('features.whoFor.description'),
      color: 'teal' as const,
      icon: 'users' as const,
    },
    {
      key: 'aiSupport',
      title: t('features.aiSupport.title'),
      description: t('features.aiSupport.description'),
      color: 'lavender' as const,
      icon: 'sparkles' as const,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <HeroSection locale={locale} />

      {/* Mission Section with image placeholder */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Placeholder */}
            <div className="order-2 lg:order-1">
              <div className="aspect-square bg-gradient-to-br from-teal-50 to-primary-50 rounded-2xl flex items-center justify-center border border-teal-100">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-primary-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Mission Image Placeholder</p>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6">
                {t('mission.heading')}
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                {t('mission.text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-3 py-1 bg-lavender-100 text-lavender-700 rounded-full text-sm font-medium mb-4">
              Why EQAI
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900">
              {t('features.heading')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature) => (
              <FeatureCard
                key={feature.key}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Image Banner Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[21/9] bg-gradient-to-r from-primary-100 via-lavender-100 to-teal-100 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/50 rounded-2xl flex items-center justify-center backdrop-blur">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Wide Banner Image Placeholder</p>
                <p className="text-sm text-gray-500 mt-1">Upload a promotional banner here (21:9 aspect ratio)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessments Section */}
      <section id="assessments" className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Get Started
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">
              {t('home.assessmentsHeading')}
            </h2>
            <p className="text-lg text-gray-600 font-light">
              {t('home.assessmentsSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <AssessmentCard
                key={category.key}
                title={t(`home.categories.${category.key}.title`)}
                description={t(`home.categories.${category.key}.description`)}
                href={category.href}
                color={category.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Guide Chat Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Ask Us Anything
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900">
              Find Your Assessment
            </h2>
            <p className="mt-4 text-lg text-gray-600 font-light">
              Not sure where to start? Chat with our guide to discover the right assessment for you.
            </p>
          </div>
          <ChatBox variant="inline" />
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
