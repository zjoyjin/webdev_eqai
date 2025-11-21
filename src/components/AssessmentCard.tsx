'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface AssessmentCardProps {
  title: string;
  description: string;
  href: string;
}

export default function AssessmentCard({ title, description, href }: AssessmentCardProps) {
  const locale = useLocale();
  const fullHref = `/${locale}${href}`;

  return (
    <Link
      href={fullHref}
      className="group block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200"
    >
      <div className="space-y-3">
        <h2 className="text-xl font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
          {title}
        </h2>
        <p className="text-sm text-gray-600 font-light leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
