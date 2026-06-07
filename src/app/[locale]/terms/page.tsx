import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { Eyebrow, secondaryButtonClass, softPanelClass } from '@/components/PageChrome';

type Props = {
  params: { locale: string };
};

const termsCopy = {
  en: {
    eyebrow: 'Terms',
    title: 'Terms of Service',
    updated: 'Last updated: June 7, 2026',
    intro:
      'These terms cover the current EQAI experience, including assessment browsing, guided scale completion, saved user records, and contact submissions.',
    sections: [
      {
        heading: 'Service scope',
        body:
          'EQAI assessments, categories, records, and copy may change as the product is reviewed and improved.',
      },
      {
        heading: 'No medical or diagnostic service',
        body:
          'EQAI does not provide medical, clinical, emergency, veterinary, legal, or diagnostic services. Results are not formal psychological assessments and should not be used as a diagnosis, treatment plan, or crisis response.',
      },
      {
        heading: 'Your use of the service',
        body:
          'Use the service only for lawful, non-abusive purposes. Do not submit urgent clinical information, impersonate others, attack the service, or upload content you do not have the right to share.',
      },
      {
        heading: 'Accounts and records',
        body:
          'Some flows require sign-in so records can be associated with the correct user. You are responsible for keeping your account access secure. Records may be unavailable during maintenance or while database setup is changing.',
      },
      {
        heading: 'Contact submissions',
        body:
          'By submitting the contact form, you confirm that EQAI may store the message and contact you about the inquiry. The form is for product and assessment-related communication, not urgent support.',
      },
      {
        heading: 'Changes',
        body:
          'We may update the service, these terms, and related policies as the product develops. Continued use after updates means you accept the updated terms.',
      },
    ],
    privacyCta: 'Read the privacy policy',
  },
  zh: {
    eyebrow: '服务条款',
    title: '服务条款',
    updated: '最后更新：2026 年 6 月 7 日',
    intro:
      '这些条款适用于当前 EQAI 体验，包括评估浏览、引导式量表作答、用户记录保存和联系表单提交。',
    sections: [
      {
        heading: '服务范围',
        body:
          'EQAI 的评估、分类、记录和页面文案都可能随着产品评审和迭代而调整。',
      },
      {
        heading: '不提供医学或诊断服务',
        body:
          'EQAI 不提供医学、临床、紧急、兽医、法律或诊断服务。评估结果不是正式心理测评，不能作为诊断、治疗方案或危机处理依据。',
      },
      {
        heading: '服务使用',
        body:
          '请仅将服务用于合法、非滥用目的。不要提交紧急临床信息、冒充他人、攻击服务，或上传你无权分享的内容。',
      },
      {
        heading: '账户与记录',
        body:
          '部分流程需要登录，以便把记录关联到正确用户。你需要自行保护账户访问安全。维护期间或数据库设置变更时，记录可能暂时不可用。',
      },
      {
        heading: '联系表单提交',
        body:
          '提交联系表单即表示你确认 EQAI 可以保存该消息，并就本次咨询联系你。该表单用于产品和评估相关沟通，不用于紧急支持。',
      },
      {
        heading: '变更',
        body:
          '随着产品发展，我们可能更新服务、这些条款和相关政策。更新后继续使用服务，即表示你接受更新后的条款。',
      },
    ],
    privacyCta: '阅读隐私政策',
  },
};

export default function TermsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const copy = locale === 'zh' ? termsCopy.zh : termsCopy.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-50">
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Eyebrow tone="primary">{copy.eyebrow}</Eyebrow>
          <h1 className="text-4xl font-light text-gray-900 sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-sm text-gray-500">{copy.updated}</p>
          <p className="mt-6 text-lg font-light leading-relaxed text-gray-600">
            {copy.intro}
          </p>
        </div>
      </div>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {copy.sections.map((section) => (
              <section key={section.heading} className={softPanelClass}>
                <h2 className="text-2xl font-light text-gray-900">{section.heading}</h2>
                <p className="mt-4 text-base font-light leading-7 text-gray-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <Link
            href={`/${locale}/privacy`}
            className={`mt-12 ${secondaryButtonClass}`}
          >
            {copy.privacyCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
