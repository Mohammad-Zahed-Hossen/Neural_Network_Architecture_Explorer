import { z } from 'zod';
import { BasePerspectiveSchema } from './base-perspective.schema';
import { ResourceSectionSchema } from './sections/resource-section.schema';

export const CodeExampleSchema = z.object({
  language: z.string(),
  code: z.string(),
  description: z.string().optional(),
});

export const ImplementationPerspectiveSchema = BasePerspectiveSchema.extend({
  perspective: z.literal('implementation').default('implementation'),
  frameworkSupport: z.array(z.string()).default([]),
  deployment: z.string().default(''),
  hardware: z.string().default(''),
  memory: z.string().default(''),
  optimization: z.string().default(''),
  codeExamples: z.array(CodeExampleSchema).default([]),
  resources: ResourceSectionSchema.default({ title: 'Implementation Assets', items: [] }),
});

export type CodeExample = z.infer<typeof CodeExampleSchema>;
export type ImplementationPerspective = z.infer<typeof ImplementationPerspectiveSchema>;
