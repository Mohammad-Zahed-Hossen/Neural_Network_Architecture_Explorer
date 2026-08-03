/**
 * Canonical Knowledge Object Vocabulary & Constants
 * 
 * Defines standard educational types, difficulty levels, status flags, and learning stages.
 * Architecture Layer: Canonical Knowledge Layer (Layer 2 Schema & Vocabulary)
 */

export const KNOWLEDGE_OBJECT_TYPES = [
  'model',
  'paper',
  'pattern',
  'concept',
  'implementation',
  'dataset',
  'algorithm',
  'loss-function',
  'optimizer',
  'layer',
  'operation',
  'training-technique',
  'evaluation',
  'benchmark',
  'timeline-event',
] as const;

export type KnowledgeObjectType = (typeof KNOWLEDGE_OBJECT_TYPES)[number];

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const OBJECT_STATUSES = ['stable', 'experimental', 'deprecated', 'planned'] as const;

export type KnowledgeObjectStatus = (typeof OBJECT_STATUSES)[number];

export const LEARNING_STAGES = ['foundation', 'core', 'advanced', 'research'] as const;

export type LearningStage = (typeof LEARNING_STAGES)[number];
