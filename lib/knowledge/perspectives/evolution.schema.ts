import { z } from 'zod';
import { BasePerspectiveSchema } from './base-perspective.schema';
import { TimelineSectionSchema } from './sections/timeline-section.schema';

export const EvolutionPerspectiveSchema = BasePerspectiveSchema.extend({
  perspective: z.literal('evolution').default('evolution'),
  predecessors: z.array(z.string()).default([]),
  successors: z.array(z.string()).default([]),
  historicalContext: z.string().default(''),
  timeline: TimelineSectionSchema.default({ title: 'Evolution Timeline', events: [] }),
});

export type EvolutionPerspective = z.infer<typeof EvolutionPerspectiveSchema>;
