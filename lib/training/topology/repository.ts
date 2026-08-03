/**
 * @module TopologyRepository
 * @purpose Repository layer for registering, caching, and retrieving topology DAG graphs.
 * @layer Layer 4 Data Access / Layer 6 Engine
 * @dependencies topology-types, topology-validator
 * @api getTopology, getTopologyById, getTopologyForModel, registerTopology, validateTopologyGraph
 * @limitations Pure in-memory repository for runtime engines. Zero React/UI dependency.
 */

import { TopologyGraph } from './topology-types';
import { validateTopology, TopologyValidationResult } from './topology-validator';

class TopologyRepositoryImpl {
  private cache: Map<string, TopologyGraph> = new Map();
  private modelMapping: Map<string, string> = new Map(); // modelId -> topologyId

  public registerTopology(graph: TopologyGraph, modelId?: string): void {
    const validation = validateTopology(graph);
    if (!validation.valid) {
      const errMsgs = validation.errors.map((e) => e.message).join('; ');
      throw new Error(`Cannot register invalid topology "${graph.id}": ${errMsgs}`);
    }

    this.cache.set(graph.id, Object.freeze(graph));

    if (modelId) {
      this.modelMapping.set(modelId, graph.id);
    }
  }

  public getTopology(id: string): TopologyGraph | undefined {
    return this.cache.get(id);
  }

  public getTopologyById(id: string): TopologyGraph | undefined {
    return this.getTopology(id);
  }

  public getTopologyForModel(modelId: string): TopologyGraph | undefined {
    const topologyId = this.modelMapping.get(modelId);
    if (topologyId) {
      return this.cache.get(topologyId);
    }
    return this.cache.get(modelId);
  }

  public validateTopologyGraph(graph: TopologyGraph): TopologyValidationResult {
    return validateTopology(graph);
  }

  public clearCache(): void {
    this.cache.clear();
    this.modelMapping.clear();
  }

  public getAllTopologies(): TopologyGraph[] {
    return Array.from(this.cache.values());
  }
}

export const TopologyRepository = new TopologyRepositoryImpl();

export function getTopology(id: string): TopologyGraph | undefined {
  return TopologyRepository.getTopology(id);
}

export function getTopologyById(id: string): TopologyGraph | undefined {
  return TopologyRepository.getTopologyById(id);
}

export function getTopologyForModel(modelId: string): TopologyGraph | undefined {
  return TopologyRepository.getTopologyForModel(modelId);
}

export function validateTopologyGraph(graph: TopologyGraph): TopologyValidationResult {
  return TopologyRepository.validateTopologyGraph(graph);
}
