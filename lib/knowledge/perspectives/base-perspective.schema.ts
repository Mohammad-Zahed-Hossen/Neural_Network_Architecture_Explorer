import { z } from 'zod';
import { MetadataSectionSchema } from './sections/metadata-section.schema';
import { ReferenceSectionSchema } from './sections/reference-section.schema';

export const SectionBlockSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export const BasePerspectiveSchema = z.object({
  perspective: z.string().min(1, 'Perspective ID must be declared'),
  version: z.string().default('1.0.0'),
  summary: z.string().min(1, 'Summary must be non-empty'),
  sections: z.array(SectionBlockSchema).default([]),
  references: ReferenceSectionSchema.default({ title: 'References', items: [] }),
  metadata: MetadataSectionSchema.default({ title: 'Metadata', attributes: {} }),
});

export type SectionBlock = z.infer<typeof SectionBlockSchema>;
export type BasePerspective = z.infer<typeof BasePerspectiveSchema>;
