import { getTranslations } from 'next-intl/server';
import StaticRecordsList from '@/components/StaticRecordsList';
import { PageShell } from '@/components/PageChrome';

type Props = {
  params: { locale: string };
};

export default async function MyAssessmentRecordsPage({
  params: { locale },
}: Props) {
  const t = await getTranslations({ locale, namespace: 'records' });

  return (
    <PageShell maxWidth="max-w-5xl">
      <StaticRecordsList
        locale={locale}
        copy={{
          eyebrow: t('eyebrow'),
          title: t('title'),
          intro: t('intro'),
          logout: t('logout'),
          emptyTitle: t('emptyTitle'),
          emptyText: t('emptyText'),
          browseDemoScales: t('browseDemoScales'),
          demoScale: t('demoScale'),
          started: t('started'),
          completed: t('completed'),
          details: t('details'),
          continue: t('continue'),
          viewResult: t('viewResult'),
        }}
      />
    </PageShell>
  );
}
