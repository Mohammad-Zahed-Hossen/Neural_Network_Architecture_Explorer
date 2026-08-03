/**
 * Canonical Knowledge Layer Barrel Export
 * 
 * Exposes canonical Knowledge Object schemas, composable Perspective Contracts,
 * Migration Adapters, Knowledge Graph Resolvers, Navigation Services, and the unified read-only KnowledgeRepository.
 * 
 * Architecture Layer: Canonical Knowledge Layer (Layer 2 Foundation)
 */

export * from './schema';
export * from './perspectives';
export * from './adapters';
export * from './repository';
export * from './graph/relationship-resolver';
export * from './navigation/navigation-service';
