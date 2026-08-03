export type LearningCheckpointState = 'completed' | 'reviewed' | 'needs_review';

export type WalkthroughStageId =
  | 'introduction'
  | 'core_concept'
  | 'relationships'
  | 'training'
  | 'research'
  | 'implementation'
  | 'summary';

export interface PredictionQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  userSelectedIndex?: number;
  isAnswered?: boolean;
}

export interface LearningStep {
  id: string;
  stageId: WalkthroughStageId;
  title: string;
  summary: string;
  content: string;
  mathFormula?: string;
  perspectiveId?: string;
  targetObjectId: string;
  predictionQuestion?: PredictionQuestion;
  checkpointId: string;
}

export interface WalkthroughStage {
  stageId: WalkthroughStageId;
  title: string;
  description: string;
  stepIds: string[];
}

export interface LearningCheckpoint {
  id: string;
  stepId: string;
  targetObjectId: string;
  state: LearningCheckpointState;
  updatedAt: string;
}

export interface LearningProgress {
  totalSteps: number;
  completedSteps: number;
  reviewedSteps: number;
  needsReviewSteps: number;
  percentage: number;
  isComplete: boolean;
}

export interface LearningSession {
  id: string;
  targetObjectId: string;
  targetObjectTitle: string;
  targetObjectType: string;
  currentStepIndex: number;
  stages: WalkthroughStage[];
  steps: LearningStep[];
  checkpoints: Record<string, LearningCheckpoint>;
  progress: LearningProgress;
  startedAt: string;
  updatedAt: string;
}
