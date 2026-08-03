import { z } from 'zod';
import { BasePerspectiveSchema } from './base-perspective.schema';

export const EquationBlockSchema = z.object({
  id: z.string(),
  latex: z.string(),
  description: z.string(),
});

export const MathematicsPerspectiveSchema = BasePerspectiveSchema.extend({
  perspective: z.literal('mathematics').default('mathematics'),
  equations: z.array(EquationBlockSchema).default([]),
  notation: z.record(z.string(), z.string()).default({}),
  proofIdeas: z.array(z.string()).default([]),
  derivations: z.array(z.string()).default([]),
  complexity: z.string().default(''),
  assumptions: z.array(z.string()).default([]),
});

export type EquationBlock = z.infer<typeof EquationBlockSchema>;
export type MathematicsPerspective = z.infer<typeof MathematicsPerspectiveSchema>;
