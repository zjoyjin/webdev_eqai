'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LanguageToggle from './LanguageToggle';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type NavigationProps = {
  authConfigured: boolean;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

export default function Navigation({
  authConfigured,
  supabaseUrl,
  supabasePublishableKey,
}: NavigationProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'signedIn' | 'signedOut'>(
    authConfigured ? 'loading' : 'signedOut'
  );

  useEffect(() => {
    if (!authConfigured) {
      setAuthState('signedOut');
      return;
    }

    const supabase = createSupabaseBrowserClient({
      url: supabaseUrl,
      publishableKey: supabasePublishableKey,
    });
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setAuthState(data.session ? 'signedIn' : 'signedOut');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'signedIn' : 'signedOut');
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [authConfigured, supabaseUrl, supabasePublishableKey]);

  const navItems = [
    { key: 'home', href: `/${locale}`, label: t('nav.home') },
    { key: 'assessments', href: `/${locale}/assessments`, label: t('nav.assessments') },
    { key: 'about', href: `/${locale}/about`, label: t('nav.about') },
    { key: 'contact', href: `/${locale}/contact`, label: t('nav.contact') },
    authState === 'signedIn'
      ? { key: 'records', href: `/${locale}/me/assessments`, label: t('nav.myRecords') }
      : authState === 'signedOut'
        ? { key: 'login', href: `/${locale}/login`, label: t('nav.login') }
        : null,
  ].filter((item): item is { key: string; href: string; label: string } => Boolean(item));

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}`;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-xl font-normal text-gray-900 hover:text-gray-700 transition-colors"
          >
            {t('common.appName')}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 transition-colors"
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-navigation" className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
