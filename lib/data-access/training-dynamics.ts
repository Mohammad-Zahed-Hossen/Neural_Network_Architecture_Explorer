import rawConceptsData from '../../data/concepts/training-dynamics.json';
import {
  TrainingConcept,
  TrainingConceptCatalogSchema,
  SimulationPreset,
} from '../schema/training-dynamics.schema';

let conceptsCache: TrainingConcept[] | null = null;

/**
 * Parses and validates all training concepts from JSON using Zod runtime validation.
 * Caches the validated results. Fails fast if JSON does not adhere to schema.
 */
export function getTrainingConcepts(): TrainingConcept[] {
  if (conceptsCache) {
    return conceptsCache;
  }

  // Validate entire dataset against Zod schema
  conceptsCache = TrainingConceptCatalogSchema.parse(rawConceptsData);
  return conceptsCache;
}

/**
 * Returns a specific training concept by ID.
 */
export function getTrainingConcept(id: string): TrainingConcept | undefined {
  const concepts = getTrainingConcepts();
  return concepts.find((c) => c.id === id);
}

/**
 * Returns the simulation preset for a concept ID or preset ID.
 */
export function getSimulationPreset(conceptOrPresetId: string): SimulationPreset | undefined {
  const concepts = getTrainingConcepts();
  
  // Try concept id match first
  const concept = concepts.find((c) => c.id === conceptOrPresetId);
  if (concept) {
    return concept.simulationPreset;
  }

  // Try preset id match
  const presetMatch = concepts.find((c) => c.simulationPreset.id === conceptOrPresetId);
  return presetMatch?.simulationPreset;
}

/**
 * Returns all related concepts for a given concept ID.
 */
export function getRelatedConcepts(id: string): TrainingConcept[] {
  const concept = getTrainingConcept(id);
  if (!concept) return [];

  const allConcepts = getTrainingConcepts();
  const relatedIds = new Set(concept.relatedConcepts);

  return allConcepts.filter((c) => relatedIds.has(c.id));
}
