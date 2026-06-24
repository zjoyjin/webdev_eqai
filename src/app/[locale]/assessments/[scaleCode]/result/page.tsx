import { notFound } from 'next/navigation';
import StaticScaleResult from '@/components/StaticScaleResult';
import { PageShell } from '@/components/PageChrome';
import { demoScales, getMvpDemoItems, getMvpDimensions, getMvpScale } from '@/lib/mvpScales';

type Props = {
  params: { locale: string; scaleCode: string };
};

export function generateStaticParams() {
  return demoScales.map((scale) => ({ scaleCode: scale.scale_code }));
}

export default async function MvpScaleResultPage({
  params: { locale, scaleCode },
}: Props) {
  const [scale, demoItems, dimensions] = await Promise.all([
    getMvpScale(scaleCode),
    getMvpDemoItems(scaleCode),
    getMvpDimensions(scaleCode),
  ]);

  if (!scale) {
    notFound();
  }

  return (
    <PageShell maxWidth="max-w-3xl">
      <StaticScaleResult locale={locale} scale={scale} items={demoItems} dimensions={dimensions} />
    </PageShell>
  );
}
