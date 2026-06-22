import { notFound } from 'next/navigation';
import TabbedExplorer from '@/components/model-explorer/tabbed-explorer';
import modelsSummary from '@/data/models.json';
import { NeuralNetworkModel } from '@/lib/types/model';
import fs from 'fs';
import path from 'path';

// Generates static parameters during static export build
export async function generateStaticParams() {
  return modelsSummary.map(model => ({
    slug: model.id,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ModelPage({ params }: PageProps) {
  const { slug } = await params;

  // Validate the slug matches our known models
  const meta = modelsSummary.find(m => m.id === slug);
  if (!meta) {
    notFound();
  }

  let model: NeuralNetworkModel | null = null;
  let graphData = null;
  try {
    const oldModelPath = path.join(process.cwd(), 'lib', 'data', `${slug}.json`);
    const graphPath = path.join(process.cwd(), 'data', 'graphs', `${slug}.json`);
    
    if (!fs.existsSync(oldModelPath) || !fs.existsSync(graphPath)) {
      notFound();
    }
    
    const oldModelContent = fs.readFileSync(oldModelPath, 'utf8');
    model = JSON.parse(oldModelContent) as NeuralNetworkModel;
    
    const graphContent = fs.readFileSync(graphPath, 'utf8');
    graphData = JSON.parse(graphContent);
  } catch (error) {
    console.error(`Error loading model ${slug}:`, error);
    notFound();
  }

  if (!model || !graphData) {
    notFound();
  }

  return <TabbedExplorer model={model} graphData={graphData} />;
}
