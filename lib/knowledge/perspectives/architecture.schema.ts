import { z } from 'zod';
import { BasePerspectiveSchema } from './base-perspective.schema';
import { ResourceSectionSchema } from './sections/resource-section.schema';

export const ArchitecturePerspectiveSchema = BasePerspectiveSchema.extend({
  perspective: z.literal('architecture').default('architecture'),
  designGoals: z.array(z.string()).default([]),
  coreComponents: z.array(z.string()).default([]),
  informationFlow: z.string().default(''),
  advantages: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  tradeoffs: z.array(z.string()).default([]),
  resources: ResourceSectionSchema.default({ title: 'Architecture Resources', items: [] }),
});

export type ArchitecturePerspective = z.infer<typeof ArchitecturePerspectiveSchema>;
