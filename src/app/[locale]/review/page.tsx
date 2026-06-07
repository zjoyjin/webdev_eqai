import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

const reviewCopy = {
  en: {
    eyebrow: 'External review pack',
    title: 'EQAI Review',
    intro:
      'Use this page as the short walkthrough for the current EQAI experience. It lists the review path, verified capabilities, known limitations, and open product questions for reviewers.',
    primaryCta: 'Start with the assessment catalog',
    secondaryCta: 'Send review feedback',
    sections: [
      {
        heading: 'Walkthrough path',
        items: [
          {
            label: 'Home',
            href: '/en',
            text: 'Confirm the bilingual landing page, core mission, category cards, and embedded assessment guide.',
          },
          {
            label: 'Assessment catalog',
            href: '/en/assessments',
            text: 'Browse six Supabase-backed assessments and filter by Work, Personal, Kid, or Pet.',
          },
          {
            label: 'MWI assessment',
            href: '/en/assessments/MWI',
            text: 'Open an assessment detail page and confirm the non-diagnostic boundary.',
          },
          {
            label: 'Contact form',
            href: '/en/contact',
            text: 'Submit assessment interest, partnership, research, or review feedback into the insert-only intake flow.',
          },
          {
            label: 'Records',
            href: '/en/me/assessments',
            text: 'Sign in with a reviewer account to inspect private started and completed records.',
          },
        ],
      },
      {
        heading: 'Verified capabilities',
        items: [
          {
            label: 'Assessment discovery',
            text: 'Unified directory, category entry points, structured API routes, and dataset fallback are implemented.',
          },
          {
            label: 'Response flow',
            text: 'Signed-in users can start an assessment, answer bounded 1-7 items, save a total score, and review the result.',
          },
          {
            label: 'Contact intake',
            text: 'The contact API validates deterministic fields and writes submissions to Supabase while blocking public reads.',
          },
          {
            label: 'Privacy and terms',
            text: 'Privacy Policy and Terms of Service routes exist before the contact form collects submissions.',
          },
        ],
      },
      {
        heading: 'Known limitations',
        items: [
          {
            label: 'Formal assessment boundary',
            text: 'The current scales are informational tools for personal reference, not formal psychological instruments.',
          },
          {
            label: 'No admin inbox yet',
            text: 'Contact submissions are reviewed through Supabase for now; a staff-facing dashboard is intentionally deferred.',
          },
          {
            label: 'No payment or donation flow',
            text: 'Donate remains deferred until payment, compliance, and public-benefit positioning are confirmed.',
          },
          {
            label: 'Review assets',
            text: 'Screenshots and a short recording should be captured from the verified production-like build before external review.',
          },
        ],
      },
      {
        heading: 'Open product questions',
        items: [
          {
            label: 'Formal assessment roadmap',
            text: 'Which assessments should be expanded first, and what validation evidence is required before public claims expand?',
          },
          {
            label: 'Child data posture',
            text: 'What consent, retention, and parent/guardian flows are required before kid-related experiences collect real data?',
          },
          {
            label: 'Reviewer workflow',
            text: 'Should review feedback stay in the contact intake table or move to a dedicated reviewer workflow?',
          },
        ],
      },
    ],
  },
  zh: {
    eyebrow: '外部评审包',
    title: 'EQAI 评审',
    intro:
      '这个页面作为当前 EQAI 体验的短版走查：集中列出评审路径、已验证能力、已知限制和开放产品问题，方便评审者快速查看。',
    primaryCta: '从评估目录开始',
    secondaryCta: '提交评审反馈',
    sections: [
      {
        heading: '评审路径',
        items: [
          {
            label: '首页',
            href: '/zh',
            text: '确认双语落地页、核心使命、分类卡片和内嵌评估引导。',
          },
          {
            label: '评估目录',
            href: '/zh/assessments',
            text: '浏览 6 个 Supabase 支持的评估，并按工作、个人、儿童或宠物过滤。',
          },
          {
            label: 'MWI 评估',
            href: '/zh/assessments/MWI',
            text: '打开评估详情页，确认非诊断性的边界说明。',
          },
          {
            label: '联系表单',
            href: '/zh/contact',
            text: '提交评估咨询、合作、研究或评审反馈，进入只允许公开写入的 intake 流程。',
          },
          {
            label: '我的记录',
            href: '/zh/me/assessments',
            text: '使用评审账号登录后，检查私有的 started/completed 记录。',
          },
        ],
      },
      {
        heading: '已验证能力',
        items: [
          {
            label: '评估发现',
            text: '统一目录、分类入口、结构化 API 路由和 dataset fallback 已实现。',
          },
          {
            label: '作答流程',
            text: '登录用户可以开始评估、完成 1-7 分题目、保存总分并查看结果。',
          },
          {
            label: '联系信息收集',
            text: '联系 API 会校验确定性字段并写入 Supabase，同时阻止公开读取。',
          },
          {
            label: '隐私与条款',
            text: '在联系表单收集提交前，隐私政策和服务条款路由已经存在。',
          },
        ],
      },
      {
        heading: '已知限制',
        items: [
          {
            label: '正式测评边界',
            text: '当前量表用于个人参考，不是正式心理测评工具。',
          },
          {
            label: '尚无后台 inbox',
            text: '联系表单提交目前通过 Supabase 查看；面向员工的管理后台暂缓。',
          },
          {
            label: '没有支付或捐赠流程',
            text: 'Donate 继续暂缓，直到支付、合规和公益定位确认。',
          },
          {
            label: '评审素材',
            text: '外部评审前，应从已验证的类生产构建中截取截图并录制短视频。',
          },
        ],
      },
      {
        heading: '开放产品问题',
        items: [
          {
            label: '正式测评路线图',
            text: '哪些评估应最先扩展，公开表达扩大前需要哪些验证证据？',
          },
          {
            label: '儿童数据策略',
            text: '儿童相关体验收集真实数据前，需要哪些同意、保留和监护人流程？',
          },
          {
            label: '评审工作流',
            text: '评审反馈继续留在 contact intake 表中，还是迁移到专门的 reviewer 流程？',
          },
        ],
      },
    ],
  },
};

export default function ReviewPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const copy = locale === 'zh' ? reviewCopy.zh : reviewCopy.en;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            {copy.eyebrow}
          </p>
          <h1 className="text-4xl font-light text-gray-900 sm:text-5xl">{copy.title}</h1>
          <p className="mt-6 max-w-3xl text-lg font-light leading-relaxed text-gray-600">
            {copy.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/assessments`}
              className="inline-block bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              {copy.primaryCta}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-block border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {copy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-light text-gray-900">{section.heading}</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={item.label} className="border border-gray-200 bg-white p-5">
                      <h3 className="text-base font-medium text-gray-900">
                        {'href' in item ? (
                          <Link href={item.href} className="underline underline-offset-4">
                            {item.label}
                          </Link>
                        ) : (
                          item.label
                        )}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
