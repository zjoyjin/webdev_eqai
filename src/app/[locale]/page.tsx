import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import AssessmentCard from '@/components/AssessmentCard';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';

type Props = {
  params: { locale: string };
};

export default function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations();

  const categories = [
    {
      key: 'work',
      href: '/work'
    },
    {
      key: 'personal',
      href: '/personal'
    },
    {
      key: 'kid',
      href: '/kid'
    },
    {
      key: 'pet',
      href: '/pet'
    }
  ];

  const features = [
    {
      key: 'whatIsEqai',
      title: t('features.whatIsEqai.title'),
      description: t('features.whatIsEqai.description')
    },
    {
      key: 'whyMatters',
      title: t('features.whyMatters.title'),
      description: t('features.whyMatters.description')
    },
    {
      key: 'whoFor',
      title: t('features.whoFor.title'),
      description: t('features.whoFor.description')
    },
    {
      key: 'aiSupport',
      title: t('features.aiSupport.title'),
      description: t('features.aiSupport.description')
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <HeroSection locale={locale} />

      {/* Mission Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
            {t('mission.heading')}
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            {t('mission.text')}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 text-center mb-12 sm:mb-16">
            {t('features.heading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {features.map((feature) => (
              <FeatureCard
                key={feature.key}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Assessments Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
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
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
