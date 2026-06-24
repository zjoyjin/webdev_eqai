import { notFound } from 'next/navigation';
import StaticScaleTake from '@/components/StaticScaleTake';
import { PageShell } from '@/components/PageChrome';
import { demoScales, getMvpDemoItems, getMvpScale } from '@/lib/mvpScales';

type Props = {
  params: { locale: string; scaleCode: string };
};

export function generateStaticParams() {
  return demoScales.map((scale) => ({ scaleCode: scale.scale_code }));
}

export default async function TakeMvpScalePage({
  params: { locale, scaleCode },
}: Props) {
  const [scale, demoItems] = await Promise.all([
    getMvpScale(scaleCode),
    getMvpDemoItems(scaleCode),
  ]);

  if (!scale) {
    notFound();
  }

  return (
    <PageShell maxWidth="max-w-3xl" className="py-10 sm:py-14">
      <StaticScaleTake locale={locale} scale={scale} items={demoItems} />
    </PageShell>
  );
}
