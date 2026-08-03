'use client';

import React from 'react';
import { KnowledgeObject } from '@/lib/knowledge/schema/knowledge-object.types';
import { knowledgeRepository } from '@/lib/knowledge/repository/repository';
import { PerspectiveSwitcher } from './PerspectiveSwitcher';
import { LearningPath } from './LearningPath';
import { CrossDomainExplorer } from './CrossDomainExplorer';

interface KnowledgeNavigationProps {
  object: KnowledgeObject;
  activePerspectiveId?: string;
  className?: string;
}

export function KnowledgeNavigation({
  object,
  activePerspectiveId,
  className = '',
}: KnowledgeNavigationProps) {
  const perspectiveLinks = knowledgeRepository.getPerspectiveLinks(object.identity.id);
  const learningPath = knowledgeRepository.getLearningPath(object.identity.id);
  const crossDomain = knowledgeRepository.getCrossDomainConnections(object.identity.id);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Perspective Switcher */}
      <PerspectiveSwitcher
        perspectiveLinks={perspectiveLinks}
        activePerspectiveId={activePerspectiveId}
      />

      {/* 2. Graph Learning Path */}
      <LearningPath step={learningPath} />

      {/* 3. Cross-Domain Network Explorer */}
      <CrossDomainExplorer connections={crossDomain} />
    </div>
  );
}
