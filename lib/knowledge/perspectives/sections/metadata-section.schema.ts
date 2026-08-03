import { z } from 'zod';

export const MetadataSectionSchema = z.object({
  title: z.string().default('Metadata'),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).default({}),
});

export type MetadataSection = z.infer<typeof MetadataSectionSchema>;
