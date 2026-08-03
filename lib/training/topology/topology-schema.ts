/**
 * @module TopologySchema
 * @purpose Zod runtime schemas for network DAG topology entities.
 * @layer Layer 2 Schema
 * @dependencies zod, topology-types
 * @api TopologyPortSchema, TopologyNodeSchema, TopologyEdgeSchema, TopologyGraphSchema
 * @limitations Integrates with platform validation pipeline.
 */

import { z } from 'zod';

export const TopologyPortSchema = z.object({
  id: z.string().min(1, 'Port ID is required'),
  name: z.string().optional(),
  type: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const TopologyNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  type: z.string().min(1, 'Node type is required'),
  label: z.string().min(1, 'Node label is required'),
  inputs: z.array(TopologyPortSchema).default([]),
  outputs: z.array(TopologyPortSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const TopologyEdgeSchema = z.object({
  id: z.string().min(1, 'Edge ID is required'),
  source: z.string().min(1, 'Source node ID is required'),
  target: z.string().min(1, 'Target node ID is required'),
  sourcePort: z.string().optional(),
  targetPort: z.string().optional(),
  type: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const TopologyGraphSchema = z.object({
  id: z.string().min(1, 'Graph ID is required'),
  name: z.string().min(1, 'Graph name is required'),
  nodes: z.array(TopologyNodeSchema).default([]),
  edges: z.array(TopologyEdgeSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TopologyPortZod = z.infer<typeof TopologyPortSchema>;
export type TopologyNodeZod = z.infer<typeof TopologyNodeSchema>;
export type TopologyEdgeZod = z.infer<typeof TopologyEdgeSchema>;
export type TopologyGraphZod = z.infer<typeof TopologyGraphSchema>;
