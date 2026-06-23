import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  Eyebrow,
  PageShell,
  secondaryButtonClass,
  softCardClass,
} from '@/components/PageChrome';
import { getDevlogEntries, getDevlogEntry } from '@/lib/devlog';

type Props = {
  params: { locale: string; slug: string };
};

export function generateStaticParams() {
  return getDevlogEntries().map((entry) => ({ slug: entry.slug }));
}

export default function DevlogEntryPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const entry = getDevlogEntry(slug);

  if (!entry) {
    notFound();
  }

  return (
    <PageShell maxWidth="max-w-5xl">
      <div className="mb-10">
        <Link href={`/${locale}/devlog`} className={secondaryButtonClass}>
          返回开发日志
        </Link>
        <div className="mt-8">
          <Eyebrow tone="warm">{entry.date}</Eyebrow>
          <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
            {entry.excerpt}
          </p>
        </div>
      </div>

      <div className="space-y-10">
        <article className={softCardClass}>
          <div
            className="prose prose-gray max-w-none prose-headings:font-light prose-headings:text-gray-900 prose-p:text-sm prose-p:leading-6 prose-p:text-gray-600 prose-li:text-sm prose-li:leading-6 prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
          />
        </article>
      </div>
    </PageShell>
  );
}
