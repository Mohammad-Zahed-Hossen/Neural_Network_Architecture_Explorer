/**
 * @module ArchitectureTopologyAdapter
 * @purpose Converts canonical NeuralNetworkModel schemas and layer lists into generic DAG TopologyGraphs.
 * @layer Layer 8 Adapters
 * @dependencies topology-types, topology-builder
 * @api createTopologyFromModel, createTopologyFromLayers
 * @limitations Framework-independent conversion supporting CNNs, ResNets, DenseNets, and Transformers.
 */

import { TopologyGraph, NodeType, EdgeType } from '../topology/topology-types';
import { TopologyBuilder } from '../topology/topology-builder';

export interface GenericModelLayer {
  readonly id: string | number;
  readonly name?: string;
  readonly type: string;
  readonly connections?: readonly (string | number)[];
  readonly inputs?: readonly (string | number)[];
  readonly outputs?: readonly (string | number)[];
  readonly params?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

export interface GenericModelData {
  readonly id: string;
  readonly name: string;
  readonly layers: readonly GenericModelLayer[];
  readonly connections?: readonly { source: string | number; target: string | number; type?: string }[];
  readonly metadata?: Record<string, unknown>;
}

export function createTopologyFromModel(model: GenericModelData): TopologyGraph {
  const builder = new TopologyBuilder(`topology-${model.id}`, model.name);
  if (model.metadata) {
    for (const [k, v] of Object.entries(model.metadata)) {
      builder.setMetadata(k, v);
    }
  }

  // Add all layer nodes
  for (const layer of model.layers) {
    const nodeId = String(layer.id);
    const nodeType: NodeType = mapLayerTypeToNodeType(layer.type);
    const label = layer.name || `${layer.type} (${nodeId})`;

    builder.createNode(
      nodeId,
      nodeType,
      label,
      [{ id: `in-${nodeId}`, name: 'in' }],
      [{ id: `out-${nodeId}`, name: 'out' }],
      {
        originalType: layer.type,
        params: layer.params,
        ...layer.metadata,
      }
    );
  }

  // Add connections
  if (model.connections && model.connections.length > 0) {
    for (const conn of model.connections) {
      builder.connect(String(conn.source), String(conn.target), {
        type: (conn.type as EdgeType) || 'sequential',
      });
    }
  } else {
    // Default to sequential and connections declared on individual layers
    for (let i = 0; i < model.layers.length; i++) {
      const layer = model.layers[i];
      const sourceId = String(layer.id);

      if (layer.connections && layer.connections.length > 0) {
        for (const targetRef of layer.connections) {
          builder.connect(sourceId, String(targetRef), { type: 'sequential' });
        }
      } else if (i < model.layers.length - 1) {
        const nextId = String(model.layers[i + 1].id);
        builder.connect(sourceId, nextId, { type: 'sequential' });
      }
    }
  }

  return builder.build(true);
}

function mapLayerTypeToNodeType(layerType: string): NodeType {
  const typeStr = layerType.toLowerCase();
  if (typeStr.includes('input')) return 'input';
  if (typeStr.includes('output')) return 'output';
  if (typeStr.includes('conv')) return 'conv';
  if (typeStr.includes('dense') || typeStr.includes('linear')) return 'linear';
  if (typeStr.includes('norm')) return 'norm';
  if (typeStr.includes('attention')) return 'attention';
  if (typeStr.includes('pooling')) return 'pooling';
  if (typeStr.includes('activation') || typeStr.includes('relu')) return 'activation';
  if (typeStr.includes('add') || typeStr.includes('residual')) return 'residual';
  return 'layer';
}
