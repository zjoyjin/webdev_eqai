import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/locales';
import Navigation from '@/components/Navigation';
import ChatBox from '@/components/ChatBox';
import { getSupabaseBrowserConfig, isSupabaseConfigured } from '@/lib/supabase/server';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const supabaseConfig = getSupabaseBrowserConfig();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navigation
            authConfigured={isSupabaseConfigured()}
            supabaseUrl={supabaseConfig.url}
            supabasePublishableKey={supabaseConfig.publishableKey}
          />
          <main className="min-h-screen">
            {children}
          </main>
          <ChatBox />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
