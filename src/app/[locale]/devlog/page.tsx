import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { Eyebrow, PageShell, softPanelClass } from '@/components/PageChrome';
import { getDevlogEntries } from '@/lib/devlog';

type Props = {
  params: { locale: string };
};

export default function DevlogIndexPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const entries = getDevlogEntries();

  return (
    <PageShell maxWidth="max-w-5xl">
      <div className="mb-10">
        <Eyebrow tone="warm">内部开发日志</Eyebrow>
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">
          EQAI 开发日志
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          这里归档项目日报、周报和工作说明，方便内部查看 EQAI 与相关项目的开发进展、上线状态和部署问题处理。
        </p>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/${locale}/devlog/${entry.slug}`}
            className={`${softPanelClass} block transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50`}
          >
            <p className="text-sm font-medium text-primary-700">{entry.date}</p>
            <h2 className="mt-2 text-2xl font-light text-gray-900">{entry.title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{entry.excerpt}</p>
            <p className="mt-5 text-sm font-medium text-primary-700">查看日志</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
