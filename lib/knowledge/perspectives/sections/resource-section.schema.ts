import { z } from 'zod';

export const ResourceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['code', 'dataset', 'weights', 'paper', 'notebook', 'documentation']),
  url: z.string(),
  description: z.string().optional(),
});

export const ResourceSectionSchema = z.object({
  title: z.string().default('Resources'),
  items: z.array(ResourceItemSchema).default([]),
});

export type ResourceItem = z.infer<typeof ResourceItemSchema>;
export type ResourceSection = z.infer<typeof ResourceSectionSchema>;
