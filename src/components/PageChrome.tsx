import type { ReactNode } from 'react';

type Tone = 'primary' | 'teal' | 'lavender' | 'rose' | 'warm';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-100 text-primary-700',
  teal: 'bg-teal-100 text-teal-700',
  lavender: 'bg-lavender-100 text-lavender-700',
  rose: 'bg-rose-100 text-rose-700',
  warm: 'bg-warm-100 text-warm-800',
};

type PageShellProps = {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
};

export function PageShell({
  children,
  maxWidth = 'max-w-5xl',
  className = '',
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-50">
      <div className={`mx-auto ${maxWidth} px-4 py-12 sm:px-6 sm:py-16 lg:px-8 ${className}`}>
        {children}
      </div>
    </main>
  );
}

type EyebrowProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

export function Eyebrow({ children, tone = 'primary', className = '' }: EyebrowProps) {
  return (
    <p className={`mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${toneClasses[tone]} ${className}`}>
      {children}
    </p>
  );
}

export const softCardClass =
  'rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-primary-100/40 backdrop-blur sm:p-8';

export const softPanelClass =
  'rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-primary-100/30';

export const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-center text-sm font-medium text-white shadow-lg shadow-primary-200/70 transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none';

export const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-center text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-700';

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-300 focus:ring-2 focus:ring-primary-100';

