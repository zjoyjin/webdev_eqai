import StaticAssessmentCatalog from '@/components/StaticAssessmentCatalog';
import { PageShell } from '@/components/PageChrome';
import { getMvpScales } from '@/lib/mvpScales';

type Props = {
  params: { locale: string };
};

export default async function MvpAssessmentsPage({
  params: { locale },
}: Props) {
  const allScales = await getMvpScales();

  return (
    <PageShell maxWidth="max-w-6xl">
      <StaticAssessmentCatalog locale={locale} allScales={allScales} />
    </PageShell>
  );
}
