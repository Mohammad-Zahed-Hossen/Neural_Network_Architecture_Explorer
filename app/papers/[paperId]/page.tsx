import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPaperById, getAllPaperIds } from '@/lib/data-access/papers';
import { PaperPageLayout } from '@/components/paper-details';
import PageBackground from '@/components/layout/page-background';

interface PageProps {
  params: Promise<{ paperId: string }>;
}

export async function generateStaticParams() {
  const paperIds = getAllPaperIds();
  return paperIds.map(paperId => ({ paperId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { paperId } = await params;
  const paper = await getPaperById(paperId);

  if (!paper) {
    return {
      title: 'Paper Not Found | Neural Network Architecture Explorer',
    };
  }

  return {
    title: `${paper.metadata.title} | NN Architecture Explorer`,
    description: paper.summary.tldr,
    openGraph: {
      title: paper.metadata.title,
      description: paper.summary.tldr,
      type: 'article',
    },
  };
}

export default async function PaperDetailsPage({ params }: PageProps) {
  const { paperId } = await params;
  const paper = await getPaperById(paperId);

  if (!paper) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <PageBackground variant="cyan-purple" />
      <PaperPageLayout paper={paper} />
    </div>
  );
}
