import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { GitCommit, Network, Split, Scaling, Cpu, Sparkles } from 'lucide-react';
import type { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import type { PatternEvolutionSummary, PatternResearchSummary } from '@/lib/knowledge/repository';
import type { ModelSummary } from '@/lib/schema/model.schema';

export interface PatternInfo {
  id: string;
  name: string;
  icon: ComponentType<LucideProps>;
  color: string;
  bgColor: string;
  borderColor: string;
  math: string;
  problem: string;
  solution: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  models: string[]; // Model IDs using this pattern
}

export const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  GitCommit,
  Network,
  Split,
  Scaling,
  Cpu,
  Sparkles,
};

export function mapKnowledgeObjectToPatternInfo(ko: KnowledgeObject): PatternInfo {
  const meta = ko.extensibility.domainMetadata;
  const iconName = String(meta.icon || 'GitCommit');
  const icon = ICON_MAP[iconName] || GitCommit;

  const rawTradeoffs = meta.tradeoffs as { pros?: string[]; cons?: string[] } | string[] | undefined;
  let pros: string[] = [];
  let cons: string[] = [];

  if (rawTradeoffs && typeof rawTradeoffs === 'object') {
    if (Array.isArray(rawTradeoffs)) {
      pros = rawTradeoffs;
    } else {
      pros = Array.isArray(rawTradeoffs.pros) ? rawTradeoffs.pros : [];
      cons = Array.isArray(rawTradeoffs.cons) ? rawTradeoffs.cons : [];
    }
  }

  const rawModels = Array.isArray(meta.models)
    ? (meta.models as string[])
    : ko.relationships.relatedObjects
        .filter((id) => id.startsWith('model:'))
        .map((id) => id.replace(/^model:/, ''));

  return {
    id: ko.identity.slug,
    name: ko.identity.title,
    icon,
    color: String(meta.color || '#10b981'),
    bgColor: String(meta.bgColor || 'bg-emerald-500/10'),
    borderColor: String(meta.borderColor || 'border-emerald-500/30'),
    math: String(meta.math || meta.blueprint || ''),
    problem: String(meta.problem || ko.metadata.summary),
    solution: String(meta.solution || ko.metadata.description),
    tradeoffs: { pros, cons },
    models: rawModels,
  };
}

export interface ArchitecturePatternLayoutProps {
  children: React.ReactNode;
}

export interface ArchitecturePatternHeaderProps {
  activePattern?: PatternInfo;
  variant?: 'page' | 'pattern';
}

export interface ArchitecturePatternNavigationProps {
  patterns: PatternInfo[];
  selectedPattern: string;
  onSelectPattern: (id: string) => void;
}

export interface ArchitectureMathProps {
  formula: string;
}

export interface ArchitectureHistoryProps {
  problem: string;
  solution: string;
}

export interface ArchitectureBlueprintProps {
  patternId: string;
  patternName: string;
}

export interface ArchitectureTradeoffsProps {
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
}

export interface ArchitectureRelationshipsProps {
  associatedModels: ModelSummary[];
  evolution?: PatternEvolutionSummary;
  research?: PatternResearchSummary;
  relatedPatterns?: readonly KnowledgeObject[];
}
