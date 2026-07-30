'use client';

import React from 'react';
import { CanonicalPaperSchema } from '@/types/paper-schema';
import { QuickScanZone } from './zones/Zone1_QuickScan/QuickScanZone';
import { MotivationZone } from './zones/Zone2_Motivation/MotivationZone';
import { InnovationsZone } from './zones/Zone3_Innovations/InnovationsZone';
import { EvidenceZone } from './zones/Zone4_Evidence/EvidenceZone';
import { CriticalNotesZone } from './zones/Zone5_CriticalNotes/CriticalNotesZone';
import { ConnectionsZone } from './zones/Zone6_Connections/ConnectionsZone';
import { ReferenceZone } from './zones/Zone7_Reference/ReferenceZone';
import { PersistentUtilityPanel } from './utility-panel/PersistentUtilityPanel';
import { PaperBreadcrumbs } from './PaperBreadcrumbs';

interface PaperPageLayoutProps {
  paper: CanonicalPaperSchema;
}

export function PaperPageLayout({ paper }: PaperPageLayoutProps) {
  const { metadata, summary, motivation, innovations, evidence, criticalNotes, connections, reference } = paper;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 min-w-0 overflow-hidden">
      {/* Top Breadcrumb Navigation */}
      <PaperBreadcrumbs category={metadata.primaryCategory} title={metadata.title} />

      {/* Main Grid: Left 7-Zone Reading Flow, Right Sticky Utility Panel */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start w-full max-w-full min-w-0">
        {/* Left Column: 7 Cognitive Information Zones */}
        <main className="flex-1 min-w-0 max-w-full space-y-10 sm:space-y-14 overflow-hidden">
          <QuickScanZone metadata={metadata} summary={summary} />
          <MotivationZone motivation={motivation} readingGuide={summary.readingGuide} />
          <InnovationsZone innovations={innovations} vocabulary={summary.vocabulary} visualFigures={summary.visualFigures} />
          <EvidenceZone evidence={evidence} />
          <CriticalNotesZone notes={criticalNotes} />
          <ConnectionsZone connections={connections} />
          <ReferenceZone reference={reference} />
        </main>

        {/* Right Column: Persistent Utility Panel */}
        <PersistentUtilityPanel metadata={metadata} fullJson={paper} />
      </div>
    </div>
  );
}
