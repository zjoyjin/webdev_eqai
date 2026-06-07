import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
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
    { key: 'work', href: '/assessments?category=work', color: 'primary' as const },
    { key: 'personal', href: '/assessments?category=personal', color: 'teal' as const },
    { key: 'kid', href: '/assessments?category=kid', color: 'lavender' as const },
    { key: 'pet', href: '/assessments?category=pet', color: 'rose' as const },
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

      {/* Mission Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-square overflow-hidden border border-teal-100 bg-teal-50">
                <Image
                  src="/logo.jpeg"
                  alt={t('common.appName')}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority={false}
                />
                <div className="absolute inset-0 bg-white/60" />
                <div className="absolute inset-x-6 bottom-6 bg-white/90 p-5">
                  <p className="text-sm font-medium text-gray-900">{t('mission.cardTitle')}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{t('mission.cardText')}</p>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                {t('mission.eyebrow')}
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

      {/* Assessment Flow Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-gray-200 bg-white p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.4fr] lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  {t('home.flowEyebrow')}
                </p>
                <h2 className="mt-3 text-3xl font-light text-gray-900">
                  {t('home.flowTitle')}
                </h2>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {t('home.flowText')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {['browse', 'answer', 'save'].map((step, index) => (
                  <div key={step} className="border border-gray-200 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      0{index + 1}
                    </p>
                    <h3 className="mt-3 text-base font-medium text-gray-900">
                      {t(`home.flowSteps.${step}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {t(`home.flowSteps.${step}.text`)}
                    </p>
                  </div>
                ))}
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
              {t('home.assessmentsEyebrow')}
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
              {t('home.chatEyebrow')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900">
              {t('home.chatTitle')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 font-light">
              {t('home.chatText')}
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
