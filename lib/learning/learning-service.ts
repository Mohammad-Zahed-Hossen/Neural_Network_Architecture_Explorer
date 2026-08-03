import { IKnowledgeRepository, knowledgeRepository } from '../knowledge/repository/repository';
import type { KnowledgeObject } from '../knowledge/schema/knowledge-object.types';
import { defaultLearningEngine, LearningEngine } from './learning-engine';
import type {
  LearningCheckpoint,
  LearningSession,
  LearningStep,
  PredictionQuestion,
  WalkthroughStage,
} from './types';

const LOCAL_STORAGE_KEY_PREFIX = 'nn_explorer_guided_learning_';

/**
 * Repository-backed Guided Learning Service
 */
export class LearningService {
  constructor(
    private readonly repository: IKnowledgeRepository = knowledgeRepository,
    private readonly engine: LearningEngine = defaultLearningEngine
  ) {}

  /**
   * Constructs deterministic walkthrough steps & stages for a given KnowledgeObject.
   */
  public buildWalkthrough(obj: KnowledgeObject): { stages: WalkthroughStage[]; steps: LearningStep[] } {
    const meta = obj.extensibility.domainMetadata || {};
    const title = obj.identity.title;
    const slug = obj.identity.slug;

    const related = this.repository.getRelatedObjects(obj.identity.id);
    const prereqs = this.repository.getPrerequisites(obj.identity.id);
    const succs = this.repository.getSuccessors(obj.identity.id);

    const stages: WalkthroughStage[] = [
      { stageId: 'introduction', title: '1. Introduction', description: 'Overview and motivation of the architecture concept.', stepIds: [`${slug}-intro`] },
      { stageId: 'core_concept', title: '2. Core Concept', description: 'Underlying structural blueprints and mathematical formulations.', stepIds: [`${slug}-concept`] },
      { stageId: 'relationships', title: '3. Knowledge Graph', description: 'Prerequisites, successor architectures, and domain connections.', stepIds: [`${slug}-rel`] },
      { stageId: 'training', title: '4. Training Dynamics', description: 'Optimization behavior, loss trajectories, and stability.', stepIds: [`${slug}-train`] },
      { stageId: 'research', title: '5. Research & Evolution', description: 'Academic papers, citation context, and evolution lineage.', stepIds: [`${slug}-res`] },
      { stageId: 'implementation', title: '6. Implementation', description: 'Practical code references, tensor dimensions, and framework details.', stepIds: [`${slug}-impl`] },
      { stageId: 'summary', title: '7. Summary & Checkpoint', description: 'Key takeaways and final verification.', stepIds: [`${slug}-summary`] },
    ];

    // Predefined prediction questions (deterministic, not AI generated)
    const introPrediction: PredictionQuestion = {
      id: `${slug}-pred-intro`,
      prompt: `Before revealing the core mechanics of ${title}: What key issue in deep network design does this innovation primarily address?`,
      options: [
        'Vanishing or exploding gradients during backpropagation',
        'Overfitting caused by excessive layer parameters',
        'Unbounded computational memory complexity on mobile GPUs',
      ],
      correctOptionIndex: 0,
      explanation: `${title} was introduced to address backpropagation gradient degradation and enable stable deep network optimization.`,
    };

    const trainPrediction: PredictionQuestion = {
      id: `${slug}-pred-train`,
      prompt: `Predicting Training Behavior: What effect will setting an excessively high learning rate have on gradient propagation in ${title}?`,
      options: [
        'Accelerate smooth convergence to global loss minimum',
        'Cause severe loss oscillation and numerical gradient explosion',
        'Have zero effect on optimization stability',
      ],
      correctOptionIndex: 1,
      explanation: 'High learning rates destabilize gradient updates across deep feature representations, leading to numerical divergence.',
    };

    const steps: LearningStep[] = [
      {
        id: `${slug}-intro`,
        stageId: 'introduction',
        title: `Introduction to ${title}`,
        summary: obj.metadata.summary,
        content: `${title} is a ${obj.identity.type} in the ${obj.registry.supportedDomains[0] || 'vision'} domain. ${obj.metadata.description}`,
        perspectiveId: 'overview',
        targetObjectId: obj.identity.id,
        predictionQuestion: introPrediction,
        checkpointId: `cp-${slug}-intro`,
      },
      {
        id: `${slug}-concept`,
        stageId: 'core_concept',
        title: `Core Architectural Principles`,
        summary: `Mathematical formulation and internal feature transformation of ${title}.`,
        content: `Design Rationale: ${meta.designRationale || meta.solution || obj.metadata.summary}\n\nBlueprint Formulation: ${meta.blueprint || meta.math || 'Sequential feature mapping with tensor transformation.'}`,
        mathFormula: typeof meta.math === 'string' ? meta.math : undefined,
        perspectiveId: 'architecture',
        targetObjectId: obj.identity.id,
        checkpointId: `cp-${slug}-concept`,
      },
      {
        id: `${slug}-rel`,
        stageId: 'relationships',
        title: `Knowledge Graph & Relationship Network`,
        summary: `Prerequisites, related entities, and evolutionary successors of ${title}.`,
        content: `Prerequisites: ${prereqs.map((p) => p.identity.title).join(', ') || 'Fundamental neural network concepts'}\nSuccessors: ${succs.map((s) => s.identity.title).join(', ') || 'Next-generation architectures'}\nRelated Entities: ${related.map((r) => r.identity.title).join(', ') || 'Domain components'}`,
        perspectiveId: 'relationships',
        targetObjectId: obj.identity.id,
        checkpointId: `cp-${slug}-rel`,
      },
      {
        id: `${slug}-train`,
        stageId: 'training',
        title: `Training Dynamics & Optimization`,
        summary: `Loss trajectory, gradient stability, and hyperparameter behavior for ${title}.`,
        content: `Training Parameters: Optimizer=${meta.optimizer || 'SGD/Adam'}, Learning Rate=${meta.learningRate || 0.001}.\n\nGradient Stability: ${meta.gradientImpact || 'High stability across deeper layers.'}`,
        perspectiveId: 'training',
        targetObjectId: obj.identity.id,
        predictionQuestion: trainPrediction,
        checkpointId: `cp-${slug}-train`,
      },
      {
        id: `${slug}-res`,
        stageId: 'research',
        title: `Research Foundation & Academic Papers`,
        summary: `Origin literature and research timeline for ${title}.`,
        content: `Literature Citation: ${obj.metadata.authors ? obj.metadata.authors.join(', ') : 'Original Authors'} (${obj.metadata.year || '2015'}).\nSummary: ${obj.metadata.summary}`,
        perspectiveId: 'research',
        targetObjectId: obj.identity.id,
        checkpointId: `cp-${slug}-res`,
      },
      {
        id: `${slug}-impl`,
        stageId: 'implementation',
        title: `Implementation & Reference Code`,
        summary: `PyTorch/TensorFlow execution snippets for ${title}.`,
        content: `Framework Code Reference:\n\`\`\`python\n# Canonical execution structure for ${title}\nimport torch\nimport torch.nn as nn\n\nclass ${title.replace(/\s+/g, '')}Module(nn.Module):\n    def __init__(self):\n        super().__init__()\n        # ${obj.metadata.summary}\n\`\`\``,
        perspectiveId: 'implementation',
        targetObjectId: obj.identity.id,
        checkpointId: `cp-${slug}-impl`,
      },
      {
        id: `${slug}-summary`,
        stageId: 'summary',
        title: `Guided Walkthrough Summary`,
        summary: `Review completed checkpoints and master concepts of ${title}.`,
        content: `Congratulations! You have completed the guided walkthrough for ${title}. Review your checkpoints below to confirm topic mastery.`,
        perspectiveId: 'summary',
        targetObjectId: obj.identity.id,
        checkpointId: `cp-${slug}-summary`,
      },
    ];

    return { stages, steps };
  }

  /**
   * Initializes or returns an existing session for a target object.
   */
  public startSession(objectId: string): LearningSession {
    const saved = this.loadSession(objectId);
    if (saved) return saved;

    const obj = this.repository.getKnowledgeObject(objectId) || this.repository.getKnowledgeObjects()[0];
    const { stages, steps } = this.buildWalkthrough(obj);

    const checkpoints: Record<string, LearningCheckpoint> = {};
    for (const step of steps) {
      checkpoints[step.checkpointId] = {
        id: step.checkpointId,
        stepId: step.id,
        targetObjectId: obj.identity.id,
        state: 'needs_review',
        updatedAt: new Date().toISOString(),
      };
    }

    // Set first checkpoint as completed
    if (steps[0]) {
      checkpoints[steps[0].checkpointId].state = 'completed';
    }

    const session: LearningSession = {
      id: `session-${obj.identity.slug}`,
      targetObjectId: obj.identity.id,
      targetObjectTitle: obj.identity.title,
      targetObjectType: obj.identity.type,
      currentStepIndex: 0,
      stages,
      steps,
      checkpoints,
      progress: { totalSteps: steps.length, completedSteps: 1, reviewedSteps: 0, needsReviewSteps: steps.length - 1, percentage: Math.round((1 / steps.length) * 100), isComplete: false },
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Resumes session or starts fresh if non-existent.
   */
  public resumeSession(objectId: string): LearningSession {
    return this.startSession(objectId);
  }

  /**
   * Restarts session from step 0.
   */
  public restartSession(objectId: string): LearningSession {
    const obj = this.repository.getKnowledgeObject(objectId) || this.repository.getKnowledgeObjects()[0];
    const { stages, steps } = this.buildWalkthrough(obj);

    const checkpoints: Record<string, LearningCheckpoint> = {};
    for (const step of steps) {
      checkpoints[step.checkpointId] = {
        id: step.checkpointId,
        stepId: step.id,
        targetObjectId: obj.identity.id,
        state: 'needs_review',
        updatedAt: new Date().toISOString(),
      };
    }

    if (steps[0]) checkpoints[steps[0].checkpointId].state = 'completed';

    const session: LearningSession = {
      id: `session-${obj.identity.slug}`,
      targetObjectId: obj.identity.id,
      targetObjectTitle: obj.identity.title,
      targetObjectType: obj.identity.type,
      currentStepIndex: 0,
      stages,
      steps,
      checkpoints,
      progress: { totalSteps: steps.length, completedSteps: 1, reviewedSteps: 0, needsReviewSteps: steps.length - 1, percentage: Math.round((1 / steps.length) * 100), isComplete: false },
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Persists session state deterministically to localStorage (browser client side).
   */
  public saveSession(session: LearningSession): void {
    if (typeof window === 'undefined') return;
    try {
      const dataToSave = {
        targetObjectId: session.targetObjectId,
        currentStepIndex: session.currentStepIndex,
        checkpoints: session.checkpoints,
        updatedAt: session.updatedAt,
      };
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${session.targetObjectId}`, JSON.stringify(dataToSave));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  /**
   * Loads saved session from localStorage.
   */
  public loadSession(objectId: string): LearningSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${objectId}`);
      if (!raw) return null;
      const saved = JSON.parse(raw);

      const obj = this.repository.getKnowledgeObject(objectId);
      if (!obj) return null;

      const { stages, steps } = this.buildWalkthrough(obj);
      const checkpoints = saved.checkpoints || {};

      const session: LearningSession = {
        id: `session-${obj.identity.slug}`,
        targetObjectId: obj.identity.id,
        targetObjectTitle: obj.identity.title,
        targetObjectType: obj.identity.type,
        currentStepIndex: typeof saved.currentStepIndex === 'number' ? saved.currentStepIndex : 0,
        stages,
        steps,
        checkpoints,
        progress: this.engine.getProgress({
          id: '', targetObjectId: obj.identity.id, targetObjectTitle: '', targetObjectType: '', currentStepIndex: 0, stages, steps, checkpoints, progress: { totalSteps: 0, completedSteps: 0, reviewedSteps: 0, needsReviewSteps: 0, percentage: 0, isComplete: false }, startedAt: '', updatedAt: ''
        }),
        startedAt: saved.updatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return session;
    } catch {
      return null;
    }
  }
}

export const learningService = new LearningService();
