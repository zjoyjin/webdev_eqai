'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface AssessmentCardProps {
  title: string;
  description: string;
  href: string;
  color?: 'primary' | 'teal' | 'lavender' | 'rose';
}

const colorClasses = {
  primary: {
    bg: 'bg-white',
    border: 'border-primary-100',
    hoverBorder: 'hover:border-primary-300',
    iconBg: 'bg-primary-50',
    iconText: 'text-primary-500',
    accentBg: 'bg-primary-500',
  },
  teal: {
    bg: 'bg-white',
    border: 'border-teal-100',
    hoverBorder: 'hover:border-teal-300',
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-500',
    accentBg: 'bg-teal-500',
  },
  lavender: {
    bg: 'bg-white',
    border: 'border-lavender-100',
    hoverBorder: 'hover:border-lavender-300',
    iconBg: 'bg-lavender-50',
    iconText: 'text-lavender-500',
    accentBg: 'bg-lavender-500',
  },
  rose: {
    bg: 'bg-white',
    border: 'border-rose-100',
    hoverBorder: 'hover:border-rose-300',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-500',
    accentBg: 'bg-rose-500',
  },
};

const icons = {
  primary: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  teal: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  lavender: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  rose: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

export default function AssessmentCard({ title, description, href, color = 'primary' }: AssessmentCardProps) {
  const locale = useLocale();
  const fullHref = `/${locale}${href}`;
  const colors = colorClasses[color];
  const icon = icons[color];

  return (
    <Link
      href={fullHref}
      className={`group block ${colors.bg} border-2 ${colors.border} ${colors.hoverBorder} rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden`}
    >
      {/* Top accent bar */}
      <div className={`h-1 ${colors.accentBg}`}></div>

      <div className="p-6">
        {/* Icon */}
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.iconText} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>

        {/* Content */}
        <h2 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {title}
        </h2>
        <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className={`flex items-center ${colors.iconText} text-sm font-medium`}>
          <span>Start Assessment</span>
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
