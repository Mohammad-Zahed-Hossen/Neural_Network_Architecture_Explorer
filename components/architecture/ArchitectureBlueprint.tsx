import React from 'react';
import { ArchitectureExplorer } from '@/components/explorer';
import type { ArchitectureBlueprintProps } from './types';

export default function ArchitectureBlueprint({ patternId, patternName }: ArchitectureBlueprintProps) {
  return (
    <ArchitectureExplorer patternId={patternId} patternName={patternName} />
  );
}
