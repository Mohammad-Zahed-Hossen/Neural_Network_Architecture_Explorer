'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getModelSummaries } from '@/lib/data-access/models';
import { searchEntities } from '@/lib/search/search-engine';
import { enrichModelEntity } from '@/lib/search/metadata-enrichment';
import {
  knowledgeRepository,
  getPatternEvolution,
  getPatternResearch,
} from '@/lib/knowledge/repository';

import {
  ArchitecturePatternLayout,
  ArchitecturePatternHeader,
  ArchitecturePatternNavigation,
  ArchitectureMath,
  ArchitectureHistory,
  ArchitectureBlueprint,
  ArchitectureTradeoffs,
  ArchitectureRelationships,
  ArchitectureReferences,
  mapKnowledgeObjectToPatternInfo,
  type PatternInfo,
} from '@/components/architecture';

const PATTERNS: PatternInfo[] = knowledgeRepository
  .getObjectsByType('pattern')
  .map(mapKnowledgeObjectToPatternInfo);

export default function ArchitecturePatterns() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize selected pattern from URL
  const [selectedPattern, setSelectedPattern] = useState<string>(() => {
    return searchParams.get('pattern') || 'residual';
  });

  // Sync selected pattern to URL
  useEffect(() => {
    router.replace(`/architecture-patterns?pattern=${selectedPattern}`);
  }, [selectedPattern, router]);

  const activePattern = PATTERNS.find((p) => p.id === selectedPattern) || PATTERNS[0];

  // Filter models summary list using search engine pattern metadata
  const associatedModels = searchEntities(
    getModelSummaries(),
    { patterns: [activePattern.id] },
    enrichModelEntity
  ).map((r) => r.item);

  // Retrieve canonical repository relationships
  const evolution = getPatternEvolution(activePattern.id);
  const research = getPatternResearch(activePattern.id);
  const activeKO = knowledgeRepository.getKnowledgeObject(activePattern.id);
  const relatedPatterns = activeKO
    ? knowledgeRepository
        .getRelatedObjects(activeKO.identity.id)
        .filter((obj) => obj.identity.type === 'pattern')
    : [];

  return (
    <ArchitecturePatternLayout>
      {/* Page Header */}
      <ArchitecturePatternHeader variant="page" />

      {/* Dynamic Pattern Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT 4-COL: Patterns Index Selector */}
        <ArchitecturePatternNavigation
          patterns={PATTERNS}
          selectedPattern={selectedPattern}
          onSelectPattern={setSelectedPattern}
        />

        {/* RIGHT 8-COL: Interactive Pattern Details & SVG Block Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-6">
            {/* Pattern Header / Title & Badge */}
            <ArchitecturePatternHeader activePattern={activePattern} variant="pattern" />

            {/* Mathematical Equation Box */}
            <ArchitectureMath formula={activePattern.math} />

            {/* Concept description boxes */}
            <ArchitectureHistory problem={activePattern.problem} solution={activePattern.solution} />

            {/* SVG / Canvas Block routing Diagram */}
            <ArchitectureBlueprint patternId={activePattern.id} patternName={activePattern.name} />

            {/* Trade-offs splits */}
            <ArchitectureTradeoffs tradeoffs={activePattern.tradeoffs} />
          </div>

          {/* Linked Models & Relationships list */}
          <ArchitectureRelationships
            associatedModels={associatedModels}
            evolution={evolution}
            research={research}
            relatedPatterns={relatedPatterns}
          />
        </div>
      </div>

      {/* Continue Learning Section */}
      <ArchitectureReferences />
    </ArchitecturePatternLayout>
  );
}
