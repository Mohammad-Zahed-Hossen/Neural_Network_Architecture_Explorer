import { notFound } from 'next/navigation';
import { Metadata } from 'next';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getModel(slug);
  
  return {
    title: `${model.name} - Neural Network Architecture Explorer`,
    description: `Explore ${model.fullName}. ${model.description}`,
    openGraph: {
      title: `${model.name} - Neural Network Architecture Explorer`,
      description: model.description,
      url: `https://neuralnetworkarchitecture.com/models/${slug}`,
    },
  };
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

  // Breadcrumb schema for structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://neuralnetworkarchitecture.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catalog',
        item: 'https://neuralnetworkarchitecture.com/catalog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: model.name,
        item: `https://neuralnetworkarchitecture.com/models/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TabbedExplorer model={model} graphData={graphData} />
    </>
  );
}
