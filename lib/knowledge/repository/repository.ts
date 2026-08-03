import { AdapterRegistry, defaultAdapterRegistry } from '../adapters';
import { ArchitecturePerspectiveSchema } from '../perspectives/architecture.schema';
import type { BasePerspective } from '../perspectives/base-perspective.schema';
import type { DifficultyLevel, KnowledgeObject, KnowledgeObjectType, LearningStage } from '../schema/knowledge-object.types';
import { filterByDifficulty, filterByDomain, filterByLearningStage, filterByType } from './filters';
import { IRawDataLoader, StaticFileRawDataLoader } from './loader';
import { RelationshipResolver, CrossDomainConnections } from '../graph/relationship-resolver';
import { NavigationService, PerspectiveLink, LearningPathStep } from '../navigation/navigation-service';

/**
 * Interface contract for unified read-only Knowledge Repository.
 */
export interface IKnowledgeRepository {
  getKnowledgeObject(id: string): KnowledgeObject | undefined;
  getKnowledgeObjects(): readonly KnowledgeObject[];
  getPerspective(id: string, perspectiveId: string): BasePerspective | undefined;
  getRelatedObjects(id: string): readonly KnowledgeObject[];
  getPrerequisites(id: string): readonly KnowledgeObject[];
  getSuccessors(id: string): readonly KnowledgeObject[];
  getObjectsByDomain(domainId: string): readonly KnowledgeObject[];
  getObjectsByType(type: KnowledgeObjectType): readonly KnowledgeObject[];
  getObjectsByDifficulty(difficulty: DifficultyLevel): readonly KnowledgeObject[];
  getObjectsByLearningStage(stage: LearningStage): readonly KnowledgeObject[];

  // Phase 4 Navigation APIs
  getPerspectiveLinks(id: string): readonly PerspectiveLink[];
  getLearningPath(id: string): LearningPathStep | null;
  getCrossDomainConnections(id: string): CrossDomainConnections;
  findResearchConnections(id: string): readonly KnowledgeObject[];
  findImplementationExamples(id: string): readonly KnowledgeObject[];
  findShortestLearningPath(startId: string, endId: string): readonly KnowledgeObject[];
}

/**
 * Static Implementation of IKnowledgeRepository using IRawDataLoader and AdapterRegistry.
 */
export class StaticKnowledgeRepository implements IKnowledgeRepository {
  private cachedObjects: readonly KnowledgeObject[] | null = null;

  constructor(
    private readonly loader: IRawDataLoader = new StaticFileRawDataLoader(),
    private readonly registry: AdapterRegistry = defaultAdapterRegistry
  ) {}

  /**
   * Lazily loads and adapts raw data items into Knowledge Objects.
   */
  private getObjects(): readonly KnowledgeObject[] {
    if (!this.cachedObjects) {
      const rawData = this.loader.loadAllRawData();
      this.cachedObjects = this.registry.convertAll(rawData);
    }
    return this.cachedObjects;
  }

  public getKnowledgeObject(id: string): KnowledgeObject | undefined {
    const objects = this.getObjects();
    return objects.find(
      (obj) =>
        obj.identity.id === id ||
        obj.identity.slug === id ||
        obj.identity.id === `pattern:${id}` ||
        obj.identity.id === `model:${id}` ||
        obj.identity.id === `paper:${id}` ||
        obj.identity.id === `concept:${id}`
    );
  }

  public getKnowledgeObjects(): readonly KnowledgeObject[] {
    return this.getObjects();
  }

  public getPerspective(id: string, perspectiveId: string): BasePerspective | undefined {
    const target = this.getKnowledgeObject(id);
    if (!target || !perspectiveId) return undefined;

    if (perspectiveId === 'architecture') {
      const meta = target.extensibility.domainMetadata;
      const rawTradeoffs = meta.tradeoffs as { pros?: string[]; cons?: string[] } | string[] | undefined;
      let pros: string[] = [];
      let cons: string[] = [];

      if (rawTradeoffs && typeof rawTradeoffs === 'object') {
        if (Array.isArray(rawTradeoffs)) {
          pros = rawTradeoffs;
        } else {
          pros = Array.isArray(rawTradeoffs.pros) ? rawTradeoffs.pros : [];
          cons = Array.isArray(rawTradeoffs.cons) ? rawTradeoffs.cons : [];
        }
      }

      return ArchitecturePerspectiveSchema.parse({
        id: `perspective:architecture:${target.identity.slug}`,
        targetId: target.identity.id,
        perspective: 'architecture',
        title: `${target.identity.title} Architecture Perspective`,
        summary: target.metadata.summary,
        designGoals: [String(meta.designRationale || target.metadata.summary)],
        coreComponents: Array.isArray(meta.models) ? meta.models : [],
        informationFlow: String(meta.math || meta.blueprint || ''),
        advantages: pros,
        limitations: cons,
        tradeoffs: Array.isArray(rawTradeoffs) ? rawTradeoffs : [...pros, ...cons],
        resources: { title: 'Architecture Resources', items: [] },
      });
    }

    return undefined;
  }

  public getRelatedObjects(id: string): readonly KnowledgeObject[] {
    const target = this.getKnowledgeObject(id);
    if (!target) return [];
    return RelationshipResolver.resolveRelated(target, this.getObjects());
  }

  public getPrerequisites(id: string): readonly KnowledgeObject[] {
    const target = this.getKnowledgeObject(id);
    if (!target) return [];
    return RelationshipResolver.resolvePrerequisites(target, this.getObjects());
  }

  public getSuccessors(id: string): readonly KnowledgeObject[] {
    const target = this.getKnowledgeObject(id);
    if (!target) return [];
    return RelationshipResolver.resolveSuccessors(target, this.getObjects());
  }

  public getObjectsByDomain(domainId: string): readonly KnowledgeObject[] {
    return filterByDomain(this.getObjects(), domainId);
  }

  public getObjectsByType(type: KnowledgeObjectType): readonly KnowledgeObject[] {
    return filterByType(this.getObjects(), type);
  }

  public getObjectsByDifficulty(difficulty: DifficultyLevel): readonly KnowledgeObject[] {
    return filterByDifficulty(this.getObjects(), difficulty);
  }

  public getObjectsByLearningStage(stage: LearningStage): readonly KnowledgeObject[] {
    return filterByLearningStage(this.getObjects(), stage);
  }

  // Phase 4 Navigation APIs
  public getPerspectiveLinks(id: string): readonly PerspectiveLink[] {
    const target = this.getKnowledgeObject(id);
    if (!target) return [];
    return NavigationService.getPerspectiveLinks(target);
  }

  public getLearningPath(id: string): LearningPathStep | null {
    return NavigationService.getLearningPath(this, id);
  }

  public getCrossDomainConnections(id: string): CrossDomainConnections {
    return NavigationService.getCrossDomainConnections(this, id);
  }

  public findResearchConnections(id: string): readonly KnowledgeObject[] {
    return NavigationService.findResearchConnections(this, id);
  }

  public findImplementationExamples(id: string): readonly KnowledgeObject[] {
    return NavigationService.findImplementationExamples(this, id);
  }

  public findShortestLearningPath(startId: string, endId: string): readonly KnowledgeObject[] {
    return NavigationService.findShortestLearningPath(this, startId, endId);
  }
}

/**
 * Default global KnowledgeRepository instance.
 */
export const knowledgeRepository: IKnowledgeRepository = new StaticKnowledgeRepository();
