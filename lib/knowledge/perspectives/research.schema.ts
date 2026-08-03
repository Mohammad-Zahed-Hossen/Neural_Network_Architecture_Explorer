import { z } from 'zod';
import { BasePerspectiveSchema } from './base-perspective.schema';

export const ResearchPerspectiveSchema = BasePerspectiveSchema.extend({
  perspective: z.literal('research').default('research'),
  papers: z.array(z.string()).default([]),
  citations: z.array(z.string()).default([]),
  researchGaps: z.array(z.string()).default([]),
  futureDirections: z.array(z.string()).default([]),
  openProblems: z.array(z.string()).default([]),
});

export type ResearchPerspective = z.infer<typeof ResearchPerspectiveSchema>;
