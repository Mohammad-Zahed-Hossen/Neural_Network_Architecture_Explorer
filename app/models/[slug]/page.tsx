import { notFound } from 'next/navigation';
import TabbedExplorer from '@/components/model-explorer/tabbed-explorer';
import { getAllModelIds } from '@/lib/data-access/models';
import { getModel } from '@/lib/data-access/models.server';

// Generates static parameters during static export build
export async function generateStaticParams() {
  const ids = getAllModelIds();
  return ids.map(id => ({
    slug: id,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModelPage({ params }: PageProps) {
  const { slug } = await params;

  let model;
  try {
    model = getModel(slug);
  } catch (error) {
    console.error(`Error loading model ${slug}:`, error);
    notFound();
  }

  // Extract graph data from architecture.layout while keeping TabbedExplorer's prop shape stable.
  const graphData = {
    nodes: model.architecture.layout?.nodes ?? [],
    edges: model.architecture.layout?.edges ?? [],
    groups: model.architecture.layout?.groups ?? [],
    groupedNodes: model.architecture.layout?.groupedNodes ?? [],
    groupedEdges: model.architecture.layout?.groupedEdges ?? [],
  };

  return <TabbedExplorer model={model} graphData={graphData} />;
}
