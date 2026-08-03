import { z } from 'zod';
import { BasePerspectiveSchema } from './base-perspective.schema';

export const TrainingPerspectiveSchema = BasePerspectiveSchema.extend({
  perspective: z.literal('training').default('training'),
  optimization: z.string().default(''),
  gradientBehavior: z.string().default(''),
  stability: z.string().default(''),
  normalization: z.string().default(''),
  lossFunctions: z.array(z.string()).default([]),
  trainingStrategies: z.array(z.string()).default([]),
});

export type TrainingPerspective = z.infer<typeof TrainingPerspectiveSchema>;
