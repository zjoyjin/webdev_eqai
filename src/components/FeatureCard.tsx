interface FeatureCardProps {
  title: string;
  description: string;
  color: 'primary' | 'teal' | 'lavender' | 'rose';
  icon: 'brain' | 'heart' | 'users' | 'sparkles';
  imagePlaceholder?: boolean;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    border: 'border-primary-100',
    iconBg: 'bg-primary-100',
    iconText: 'text-primary-600',
    hoverBorder: 'hover:border-primary-200',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
    hoverBorder: 'hover:border-teal-200',
  },
  lavender: {
    bg: 'bg-lavender-50',
    border: 'border-lavender-100',
    iconBg: 'bg-lavender-100',
    iconText: 'text-lavender-600',
    hoverBorder: 'hover:border-lavender-200',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    hoverBorder: 'hover:border-rose-200',
  },
};

const icons = {
  brain: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

export default function FeatureCard({
  title,
  description,
  color,
  icon,
  imagePlaceholder = false
}: FeatureCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} p-8 rounded-2xl border ${colors.border} ${colors.hoverBorder} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.iconText}`}>
          {icons[icon]}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 font-light leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {imagePlaceholder && (
        <div className="mt-6 aspect-video bg-white/50 rounded-xl border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-500">Add image here</p>
          </div>
        </div>
      )}
    </div>
  );
}
