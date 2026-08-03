/**
 * @module SequentialTopologyAdapter
 * @purpose Converts legacy depth and connection parameters into canonical DAG TopologyGraph objects.
 * @layer Layer 8 Adapters
 * @dependencies topology-types, topology-builder
 * @api createSequentialTopology
 * @limitations Preserves exact legacy connections (sequential, residual, dense, batchnorm) as valid DAG graphs.
 */

import { TopologyGraph } from '../topology/topology-types';
import { TopologyBuilder } from '../topology/topology-builder';

export interface SequentialAdapterOptions {
  readonly id?: string;
  readonly name?: string;
  readonly depth: number;
  readonly connectionType?: 'sequential' | 'residual' | 'dense' | 'batchnorm' | string;
  readonly normalization?: boolean;
  readonly skipProbability?: number;
}

export function createSequentialTopology(options: SequentialAdapterOptions): TopologyGraph {
  const depth = Math.max(1, options.depth);
  const connectionType = options.connectionType || 'sequential';
  const graphId = options.id || `sequential-depth-${depth}-${connectionType}`;
  const graphName = options.name || `Sequential Topology (Depth ${depth}, ${connectionType})`;

  const builder = new TopologyBuilder(graphId, graphName);

  builder.setMetadata('connectionType', connectionType);
  builder.setMetadata('depth', depth);

  // 1. Create Input Node
  builder.createNode('node-0', 'input', 'Input', [], [{ id: 'out-0', name: 'output' }], {
    layerIndex: 0,
    isInput: true,
  });

  // 2. Create Hidden Layer Nodes (or BatchNorm Nodes if batchnorm mode)
  for (let i = 1; i <= depth; i++) {
    const isNorm = connectionType === 'batchnorm' || options.normalization;
    const type = isNorm ? 'norm' : 'layer';
    const label = `Layer ${i}`;

    builder.createNode(
      `node-${i}`,
      type,
      label,
      [{ id: `in-${i}`, name: 'input' }],
      [{ id: `out-${i}`, name: 'output' }],
      {
        layerIndex: i,
        isHidden: true,
      }
    );
  }

  // 3. Create Output Node
  const outputIndex = depth + 1;
  builder.createNode(
    `node-${outputIndex}`,
    'output',
    'Output',
    [{ id: `in-${outputIndex}`, name: 'input' }],
    [],
    {
      layerIndex: outputIndex,
      isOutput: true,
    }
  );

  // 4. Create Edges according to connectionType
  // Primary sequential chain (node-0 -> node-1 -> ... -> node-(depth+1))
  for (let i = 0; i <= depth; i++) {
    builder.connect(`node-${i}`, `node-${i + 1}`, {
      type: 'sequential',
    });
  }

  // Handle Residual Connections (skip arcs e.g. node-i to node-(i+2))
  if (connectionType === 'residual') {
    for (let i = 1; i < depth; i += 2) {
      const target = i + 2 <= depth + 1 ? i + 2 : depth + 1;
      builder.connect(`node-${i}`, `node-${target}`, {
        type: 'skip',
        metadata: { isSkipConnection: true },
      });
    }
  }

  // Handle Dense Connections (connect every layer i to all subsequent layers j > i)
  if (connectionType === 'dense') {
    for (let i = 0; i <= depth; i++) {
      for (let j = i + 2; j <= depth + 1; j++) {
        builder.connect(`node-${i}`, `node-${j}`, {
          type: 'dense',
          metadata: { isDenseArc: true },
        });
      }
    }
  }

  return builder.build(true);
}
