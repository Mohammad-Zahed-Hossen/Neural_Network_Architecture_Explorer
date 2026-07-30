'use client';

import React from 'react';
import { TaggedNote } from '@/types/paper-schema';
import { SectionHeader } from '../../shared/SectionHeader';
import { TaggedList } from '../../shared/TaggedList';
import { ShieldAlert } from 'lucide-react';

interface CriticalNotesZoneProps {
  notes: TaggedNote[];
}

export function CriticalNotesZone({ notes }: CriticalNotesZoneProps) {
  return (
    <section id="critical-notes" className="space-y-6 scroll-mt-24">
      <SectionHeader
        id="critical-notes-header"
        title="Critical Engineering Notes & Critique"
        subtitle="Objective assessment of strengths, operational weaknesses, failure cases, and system trade-offs."
        icon={<ShieldAlert className="w-5 h-5" />}
      />

      <TaggedList notes={notes} />
    </section>
  );
}
