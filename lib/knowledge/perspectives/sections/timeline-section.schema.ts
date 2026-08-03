import { z } from 'zod';

export const TimelineEventSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  title: z.string(),
  summary: z.string(),
  significance: z.string(),
  relatedEntityId: z.string().optional(),
});

export const TimelineSectionSchema = z.object({
  title: z.string().default('Evolution Timeline'),
  events: z.array(TimelineEventSchema).default([]),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type TimelineSection = z.infer<typeof TimelineSectionSchema>;
