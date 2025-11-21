import { useTranslations } from 'next-intl';
import AssessmentCard from '@/components/AssessmentCard';

export default function HomePage() {
  const t = useTranslations('home');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-light">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <AssessmentCard
            key={category.key}
            title={t(`categories.${category.key}.title`)}
            description={t(`categories.${category.key}.description`)}
            href={category.href}
          />
        ))}
      </div>
    </div>
  );
}
