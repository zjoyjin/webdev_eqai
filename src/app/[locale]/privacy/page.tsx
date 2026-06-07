import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

const privacyCopy = {
  en: {
    eyebrow: 'Privacy notice',
    title: 'Privacy Policy',
    updated: 'Last updated: June 7, 2026',
    intro:
      'EQAI provides assessment discovery, guided answering, saved records, and inquiry review. This notice explains what information is collected and how it is used.',
    sections: [
      {
        heading: 'Information we collect',
        body:
          'When you submit the contact form, we collect your name, email address, inquiry type, category, audience type, subject, message, consent flag, source locale, and basic request metadata such as user agent. When you use assessments, we may store your authenticated account id, selected scale, attempt status, item answers, scores, notes, and timestamps.',
      },
      {
        heading: 'How we use information',
        body:
          'We use contact submissions to respond to assessment inquiries, partnership requests, research conversations, and product feedback. Assessment records let signed-in users review their own history and help EQAI improve the service workflow.',
      },
      {
        heading: 'Storage and access',
        body:
          'Service data is stored in Supabase. Contact submissions are insert-only for public users and are intended for EQAI team review. Assessment records are protected with row-level security so signed-in users can access their own records.',
      },
      {
        heading: 'Clinical and diagnostic boundary',
        body:
          'EQAI content is informational and for personal reference. It is not medical, clinical, emergency, or diagnostic support. Do not submit urgent health or safety information through the contact form.',
      },
      {
        heading: 'Retention and requests',
        body:
          'We keep service data only as long as needed for product review, user support, legal, security, and operational purposes. You can contact us to ask about access, correction, or deletion of information associated with your inquiry.',
      },
    ],
    contactCta: 'Contact us about privacy',
  },
  zh: {
    eyebrow: '隐私说明',
    title: '隐私政策',
    updated: '最后更新：2026 年 6 月 7 日',
    intro:
      'EQAI 提供评估发现、引导作答、记录保存和咨询审核。本说明解释我们会收集哪些信息以及如何使用。',
    sections: [
      {
        heading: '我们收集的信息',
        body:
          '当你提交联系表单时，我们会收集姓名、电子邮件、咨询类型、关注分类、受众身份、主题、留言、同意标记、来源语言，以及 user agent 等基础请求元数据。使用评估时，我们可能保存你的登录账户 id、所选量表、作答状态、题目答案、分数、备注和时间戳。',
      },
      {
        heading: '信息用途',
        body:
          '联系表单信息用于回复评估咨询、合作请求、研究沟通和产品反馈。评估记录用于让登录用户查看自己的历史记录，并帮助 EQAI 改进服务流程。',
      },
      {
        heading: '存储与访问',
        body:
          '服务数据存储在 Supabase 中。公开用户只能插入联系表单记录，供 EQAI 团队审核；评估记录通过行级安全策略保护，登录用户只能访问自己的记录。',
      },
      {
        heading: '临床与诊断边界',
        body:
          'EQAI 内容用于信息展示和个人参考，不提供医学、临床、紧急或诊断支持。请不要通过联系表单提交紧急健康或安全信息。',
      },
      {
        heading: '保留与请求',
        body:
          '我们仅在产品评审、用户支持、法律、安全和运营需要的期限内保留服务数据。你可以联系我们，询问与你的咨询相关的信息访问、更正或删除请求。',
      },
    ],
    contactCta: '联系隐私相关问题',
  },
};

export default function PrivacyPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const copy = locale === 'zh' ? privacyCopy.zh : privacyCopy.en;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            {copy.eyebrow}
          </p>
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
              <section key={section.heading} className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-light text-gray-900">{section.heading}</h2>
                <p className="mt-4 text-base font-light leading-7 text-gray-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <Link
            href={`/${locale}/contact`}
            className="mt-12 inline-block border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
          >
            {copy.contactCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
