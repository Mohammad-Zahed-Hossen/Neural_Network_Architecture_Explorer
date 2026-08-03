import { Metadata } from 'next';
import { ComparisonStudio } from '@/components/comparison/ComparisonStudio';
import { knowledgeRepository } from '@/lib/knowledge/repository/repository';

export const metadata: Metadata = {
  title: 'Comparison Studio | Neural Network Explorer',
  description: 'Compare neural network architectures, training concepts, research papers, and telemetry side-by-side using the canonical repository framework.',
};

export default function ComparePage() {
  const objects = knowledgeRepository.getKnowledgeObjects();
  return <ComparisonStudio initialObjects={objects} />;
}
