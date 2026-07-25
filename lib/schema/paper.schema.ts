import { z } from 'zod';

export const PaperTypeSchema = z.enum([
  'research',
  'thesis',
  'survey',
  'benchmark',
  'notes',
]);

export const ReadingStatusSchema = z.enum([
  'unread',
  'reading',
  'read',
  'bookmarked',
]);

export const PrioritySchema = z.enum([
  'low',
  'medium',
  'high',
]);

export const KeyEquationSchema = z.object({
  id: z.string(),
  name: z.string(),
  formula: z.string(),
  explanation: z.string(),
});

export const KeyFigureSchema = z.object({
  id: z.string(),
  caption: z.string(),
  description: z.string(),
  url: z.string().optional(),
});

export const PaperSchema = z.object({
  id: z.string(),
  modelIds: z.array(z.string()),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number(),
  paperType: PaperTypeSchema.default('research'),
  status: ReadingStatusSchema.default('unread'),
  priority: PrioritySchema.default('medium'),
  contribution: z.string(),
  problem: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  legacy: z.string(),
  relevance: z.string(),
  paperUrl: z.string(),
  doi: z.string().optional(),
  journal: z.string().optional(),
  citationCount: z.number().optional(),
  equations: z.array(KeyEquationSchema).optional(),
  figures: z.array(KeyFigureSchema).optional(),
  datasets: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  personalNotes: z.string().optional(),
  userRating: z.number().min(1).max(5).optional(),
});

export type PaperType = z.infer<typeof PaperTypeSchema>;
export type ReadingStatus = z.infer<typeof ReadingStatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type KeyEquation = z.infer<typeof KeyEquationSchema>;
export type KeyFigure = z.infer<typeof KeyFigureSchema>;
export type PaperEntity = z.infer<typeof PaperSchema>;
