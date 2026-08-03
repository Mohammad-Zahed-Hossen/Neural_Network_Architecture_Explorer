import { z } from 'zod';

export const ReferenceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()).default([]),
  venue: z.string().optional(),
  year: z.number().int().optional(),
  url: z.string().optional(),
  doi: z.string().optional(),
});

export const ReferenceSectionSchema = z.object({
  title: z.string().default('References'),
  items: z.array(ReferenceItemSchema).default([]),
});

export type ReferenceItem = z.infer<typeof ReferenceItemSchema>;
export type ReferenceSection = z.infer<typeof ReferenceSectionSchema>;
