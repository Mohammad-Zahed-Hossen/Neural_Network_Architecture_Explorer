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

  // Create a minimal overview object for the Overview tab - avoids serializing the full model
  // (up to 1.26MB for resnet152) into client component props when only scalar fields are needed.
  const overview = {
    id: model.id,
    name: model.name,
    fullName: model.fullName,
    description: model.description,
    category: model.category,
    colorTheme: model.colorTheme,
    paperYear: model.paperYear,
    authors: model.authors,
    paperUrl: model.paperUrl,
    docsUrl: model.docsUrl,
    totalParameters: model.totalParameters,
    depth: model.depth,
    memoryUsage: model.memoryUsage,
    totalFLOPs: model.totalFLOPs,
    top1Accuracy: model.top1Accuracy,
    top5Accuracy: model.top5Accuracy,
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
      <TabbedExplorer overview={overview} layers={model.architecture.layers} graphData={graphData} />
    </>
  );
}