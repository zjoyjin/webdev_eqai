import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import ContactForm from '@/components/ContactForm';

type Props = {
  params: { locale: string };
};

export default function ContactPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations('contact');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
            {t('intro')}
          </p>
        </div>
      </div>

      {/* Contact Form and Info */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-xl font-medium text-gray-900 mb-6">
                  {t('info.heading')}
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 font-light">
                    {t('info.email')}
                  </p>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 font-light">
                      {t('info.note')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
