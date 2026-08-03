#!/usr/bin/env tsx

/**
 * Migration Adapter & KnowledgeRepository Regression Test Suite
 * 
 * Verifies that:
 * 1. Legacy datasets convert to valid Canonical Knowledge Objects.
 * 2. ID, slug, and relationship metadata are strictly preserved.
 * 3. Extra/unknown legacy properties are ignored gracefully.
 * 4. The KnowledgeRepository provides unified read-only access.
 * 5. Phase 2.4 Relationships (Evolution, Research, Related Objects) resolve cleanly without duplication.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  AdapterRegistry,
  InMemoryRawDataLoader,
  ModelAdapter,
  PaperAdapter,
  PatternAdapter,
  StaticKnowledgeRepository,
  TrainingAdapter,
  getPatternEvolution,
  getPatternResearch,
  knowledgeRepository,
} from '../lib/knowledge';
import { comparisonService } from '../lib/comparison';
import { defaultLearningEngine, learningService } from '../lib/learning';

const root = process.cwd();

function loadFixture(filename: string): Record<string, unknown> {
  const filePath = join(root, 'tests/adapter-fixtures', filename);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function runAdapterTests(): void {
  console.log('\nRunning Adapter & Repository Regression Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✔ [PASS] ${name}`);
    } else {
      console.error(`❌ [FAIL] ${name}`);
      if (details) console.error(`   Details: ${details}`);
    }
  }

  // Test 1: ModelAdapter
  const modelRaw = loadFixture('model.json');
  const modelAdapter = new ModelAdapter();
  assert(modelAdapter.supports(modelRaw), 'ModelAdapter supports legacy model fixture');
  const modelKO = modelAdapter.toKnowledgeObject(modelRaw);
  assert(modelKO.identity.id === 'model:resnet50', 'ModelAdapter preserves ID namespace ("model:resnet50")');
  assert(modelKO.identity.slug === 'resnet50', 'ModelAdapter preserves slug ("resnet50")');
  assert(modelKO.identity.type === 'model', 'ModelAdapter assigns type "model"');
  assert(modelKO.relationships.relatedObjects.includes('alexnet'), 'ModelAdapter preserves relatedObjects');

  // Test 2: PaperAdapter
  const paperRaw = loadFixture('paper.json');
  const paperAdapter = new PaperAdapter();
  assert(paperAdapter.supports(paperRaw), 'PaperAdapter supports paper fixture');
  const paperKO = paperAdapter.toKnowledgeObject(paperRaw);
  assert(paperKO.identity.id === 'paper:he-2015-resnet', 'PaperAdapter preserves ID namespace ("paper:he-2015-resnet")');
  assert(paperKO.identity.type === 'paper', 'PaperAdapter assigns type "paper"');
  assert(paperKO.metadata.authors?.includes('Kaiming He') ?? false, 'PaperAdapter extracts authors array');

  // Test 3: PatternAdapter
  const patternRaw = loadFixture('pattern.json');
  const patternAdapter = new PatternAdapter();
  assert(patternAdapter.supports(patternRaw), 'PatternAdapter supports pattern fixture');
  const patternKO = patternAdapter.toKnowledgeObject(patternRaw);
  assert(patternKO.identity.id === 'pattern:skip-connection', 'PatternAdapter preserves ID namespace');
  assert(patternKO.identity.type === 'pattern', 'PatternAdapter assigns type "pattern"');

  // Test 3b: PatternAdapter Rich Legacy Migration
  const legacyPatternRaw = {
    id: 'residual',
    name: 'Residual Connections (Skip Mappings)',
    icon: 'GitCommit',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    math: 'H(x) = F(x) + x',
    problem: 'Vanishing gradient problem',
    solution: 'Skip connection identity mapping',
    tradeoffs: { pros: ['Pros test'], cons: ['Cons test'] },
    models: ['resnet50'],
    prerequisiteObjects: [],
    successorObjects: ['pattern:dense', 'pattern:attention'],
    relatedObjects: ['model:resnet50', 'paper:resnet'],
    unknownExtraField: 'should be ignored',
  };
  assert(patternAdapter.supports(legacyPatternRaw), 'PatternAdapter supports legacy pattern format');
  const legacyPatternKO = patternAdapter.toKnowledgeObject(legacyPatternRaw);
  assert(legacyPatternKO.identity.id === 'pattern:residual', 'PatternAdapter preserves legacy pattern ID');
  assert(legacyPatternKO.identity.slug === 'residual', 'PatternAdapter preserves legacy pattern slug');
  assert(legacyPatternKO.metadata.summary === 'Vanishing gradient problem', 'PatternAdapter converts problem to summary');
  assert(legacyPatternKO.metadata.description === 'Skip connection identity mapping', 'PatternAdapter converts solution to description');
  assert(legacyPatternKO.relationships.relatedObjects.includes('model:resnet50'), 'PatternAdapter maps model IDs to relationships');
  assert(legacyPatternKO.relationships.successorObjects.includes('pattern:dense'), 'PatternAdapter maps successor pattern IDs');
  assert(legacyPatternKO.extensibility.domainMetadata.math === 'H(x) = F(x) + x', 'PatternAdapter preserves math formula in domainMetadata');
  assert(
    (legacyPatternKO as Record<string, unknown>).unknownExtraField === undefined,
    'PatternAdapter ignores unknown extra fields gracefully'
  );

  // Test 4: TrainingAdapter
  const trainingRaw = loadFixture('training.json');
  const trainingAdapter = new TrainingAdapter();
  assert(trainingAdapter.supports(trainingRaw), 'TrainingAdapter supports training fixture');
  const trainingKO = trainingAdapter.toKnowledgeObject(trainingRaw);
  assert(trainingKO.identity.id === 'concept:vanishing-gradient', 'TrainingAdapter preserves ID namespace');
  assert(trainingKO.identity.type === 'concept', 'TrainingAdapter assigns type "concept"');

  // Test 5: AdapterRegistry & Conversion
  const registry = new AdapterRegistry();
  const convertedModel = registry.convert(modelRaw);
  assert(convertedModel.identity.slug === 'resnet50', 'AdapterRegistry converts model data via ModelAdapter');

  // Test 6: StaticKnowledgeRepository with InMemoryRawDataLoader & Architecture Perspective
  const memoryLoader = new InMemoryRawDataLoader([modelRaw, paperRaw, patternRaw, legacyPatternRaw, trainingRaw]);
  const repo = new StaticKnowledgeRepository(memoryLoader, registry);
  const objects = repo.getKnowledgeObjects();
  assert(objects.length === 5, 'KnowledgeRepository loads all 5 converted Knowledge Objects');
  assert(repo.getKnowledgeObject('residual') !== undefined, 'Repository queries pattern by slug ("residual")');
  assert(repo.getKnowledgeObject('pattern:residual') !== undefined, 'Repository queries pattern by ID ("pattern:residual")');
  assert(repo.getObjectsByType('pattern').length === 2, 'Repository filters objects by type "pattern"');
  
  const archPerspective = repo.getPerspective('residual', 'architecture');
  assert(archPerspective !== undefined, 'Repository getPerspective returns valid architecture perspective for pattern');
  assert(archPerspective?.perspective === 'architecture', 'Returned perspective has perspective === "architecture"');

  // Test 7: Phase 2.4 Pattern Evolution Query
  const evolution = getPatternEvolution('residual');
  assert(Array.isArray(evolution.successors), 'getPatternEvolution returns successors array');
  assert(Array.isArray(evolution.predecessors), 'getPatternEvolution returns predecessors array');

  // Test 8: Phase 2.4 Pattern Research Query
  const research = getPatternResearch('residual');
  assert(Array.isArray(research.papers), 'getPatternResearch returns papers array');

  // Test 9: Duplicate Relationship Validation
  const patterns = knowledgeRepository.getObjectsByType('pattern');
  const hasDuplicatesInSamePattern = patterns.every((p) => {
    const rels = p.relationships.relatedObjects;
    return new Set(rels).size === rels.length;
  });
  assert(hasDuplicatesInSamePattern, 'No duplicate relationship definitions inside individual pattern Knowledge Objects');

  // Test 10: Phase 5.1 Comparison Studio Framework
  const compResult = comparisonService.compareObjects(['model:resnet50', 'model:vgg16']);
  assert(compResult !== undefined, 'ComparisonService generates valid ComparisonResult');
  assert(compResult.objects.length >= 2, 'ComparisonResult contains normalized ComparisonObjects');
  assert(Array.isArray(compResult.metrics), 'ComparisonResult contains quantitative ComparisonMetric list');
  assert(compResult.metricMatrix !== undefined, 'ComparisonResult builds metric matrix');

  // Test 11: Phase 5.2 Guided Learning Framework
  const session = learningService.startSession('resnet50');
  assert(session !== undefined, 'LearningService initializes deterministic LearningSession');
  assert(session.steps.length === 7, 'Guided Learning walkthrough contains all 7 deterministic stages');
  assert(session.progress.percentage > 0, 'LearningSession computes initial progress');
  
  const step2Session = defaultLearningEngine.nextStep(session);
  assert(step2Session.currentStepIndex === 1, 'LearningEngine advances session to next step');

  // Test 12: Phase 6.1 Pilot Domain 1 — Transformer & Self-Attention
  const transformerObjects = knowledgeRepository.getObjectsByDomain('transformer');
  assert(transformerObjects.length >= 13, 'KnowledgeRepository queries all Transformer domain objects');
  assert(knowledgeRepository.getKnowledgeObject('transformer:encoder') !== undefined, 'Repository queries transformer encoder by ID');
  assert(knowledgeRepository.getKnowledgeObject('transformer:multi-head-attention') !== undefined, 'Repository queries multi-head attention');
  
  const tfComp = comparisonService.compareObjects(['transformer:encoder', 'transformer:decoder']);
  assert(tfComp.objects.length === 2, 'ComparisonStudio supports Transformer entity comparison');

  const tfSession = learningService.startSession('transformer:encoder');
  assert(tfSession.steps.length === 7, 'Guided Learning supports Transformer walkthroughs');

  // Test 13: Phase 6.1 Pilot Domain 2 — Classical Graph Algorithms
  const graphAlgObjects = knowledgeRepository.getObjectsByDomain('graph-algorithms');
  assert(graphAlgObjects.length === 9, 'KnowledgeRepository queries all 9 Graph Algorithm domain objects');
  assert(knowledgeRepository.getKnowledgeObject('graph:bfs') !== undefined, 'Repository queries BFS algorithm by ID');
  assert(knowledgeRepository.getKnowledgeObject('graph:dijkstra') !== undefined, 'Repository queries Dijkstra algorithm by ID');

  const graphComp = comparisonService.compareObjects(['graph:bfs', 'graph:dijkstra']);
  assert(graphComp.objects.length === 2, 'ComparisonStudio supports Graph Algorithm entity comparison');

  const graphSession = learningService.startSession('graph:bfs');
  assert(graphSession.steps.length === 7, 'Guided Learning supports Graph Algorithm walkthroughs');

  console.log(`\nAdapter & Repository Test Summary: ${passed}/${total} tests passed.\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAdapterTests();
