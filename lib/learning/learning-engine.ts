import type {
  LearningCheckpoint,
  LearningCheckpointState,
  LearningProgress,
  LearningSession,
} from './types';

/**
 * Pure TypeScript Learning Engine
 * Manages deterministic walkthrough steps, checkpoints, prediction answers, and session state.
 */
export class LearningEngine {
  /**
   * Advances session to the next step.
   */
  public nextStep(session: LearningSession): LearningSession {
    if (session.currentStepIndex >= session.steps.length - 1) {
      return session;
    }
    const nextIndex = session.currentStepIndex + 1;
    const currentStep = session.steps[session.currentStepIndex];

    // Automatically set current checkpoint state to completed if unvisited
    const updatedCheckpoints = { ...session.checkpoints };
    if (currentStep && (!updatedCheckpoints[currentStep.checkpointId] || updatedCheckpoints[currentStep.checkpointId].state === 'needs_review')) {
      updatedCheckpoints[currentStep.checkpointId] = {
        id: currentStep.checkpointId,
        stepId: currentStep.id,
        targetObjectId: session.targetObjectId,
        state: 'completed',
        updatedAt: new Date().toISOString(),
      };
    }

    const updatedSession: LearningSession = {
      ...session,
      currentStepIndex: nextIndex,
      checkpoints: updatedCheckpoints,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...updatedSession,
      progress: this.getProgress(updatedSession),
    };
  }

  /**
   * Navigates session to the previous step.
   */
  public previousStep(session: LearningSession): LearningSession {
    if (session.currentStepIndex <= 0) {
      return session;
    }
    const prevIndex = session.currentStepIndex - 1;
    const updatedSession: LearningSession = {
      ...session,
      currentStepIndex: prevIndex,
      updatedAt: new Date().toISOString(),
    };
    return {
      ...updatedSession,
      progress: this.getProgress(updatedSession),
    };
  }

  /**
   * Updates state of a specific checkpoint ('completed' | 'reviewed' | 'needs_review').
   */
  public completeCheckpoint(
    session: LearningSession,
    stepId: string,
    state: LearningCheckpointState
  ): LearningSession {
    const step = session.steps.find((s) => s.id === stepId || s.checkpointId === stepId);
    if (!step) return session;

    const checkpointId = step.checkpointId;
    const updatedCheckpoints: Record<string, LearningCheckpoint> = {
      ...session.checkpoints,
      [checkpointId]: {
        id: checkpointId,
        stepId: step.id,
        targetObjectId: session.targetObjectId,
        state,
        updatedAt: new Date().toISOString(),
      },
    };

    const updatedSession: LearningSession = {
      ...session,
      checkpoints: updatedCheckpoints,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...updatedSession,
      progress: this.getProgress(updatedSession),
    };
  }

  /**
   * Validates a prediction exercise choice deterministically.
   */
  public answerPrediction(
    session: LearningSession,
    stepId: string,
    selectedIndex: number
  ): { session: LearningSession; isCorrect: boolean; explanation: string } {
    const stepIndex = session.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) {
      return { session, isCorrect: false, explanation: 'Step not found.' };
    }

    const step = session.steps[stepIndex];
    if (!step.predictionQuestion) {
      return { session, isCorrect: false, explanation: 'No prediction exercise for this step.' };
    }

    const pq = step.predictionQuestion;
    const isCorrect = selectedIndex === pq.correctOptionIndex;

    const updatedSteps = [...session.steps];
    updatedSteps[stepIndex] = {
      ...step,
      predictionQuestion: {
        ...pq,
        userSelectedIndex: selectedIndex,
        isAnswered: true,
      },
    };

    const updatedSession: LearningSession = {
      ...session,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    return {
      session: updatedSession,
      isCorrect,
      explanation: pq.explanation,
    };
  }

  /**
   * Recalculates progress metrics.
   */
  public getProgress(session: LearningSession): LearningProgress {
    const totalSteps = session.steps.length;
    if (totalSteps === 0) {
      return { totalSteps: 0, completedSteps: 0, reviewedSteps: 0, needsReviewSteps: 0, percentage: 100, isComplete: true };
    }

    let completedSteps = 0;
    let reviewedSteps = 0;
    let needsReviewSteps = 0;

    for (const step of session.steps) {
      const cp = session.checkpoints[step.checkpointId];
      if (cp) {
        if (cp.state === 'completed') completedSteps++;
        else if (cp.state === 'reviewed') reviewedSteps++;
        else if (cp.state === 'needs_review') needsReviewSteps++;
      }
    }

    const activeDone = completedSteps + reviewedSteps;
    const percentage = Math.round((activeDone / totalSteps) * 100);
    const isComplete = activeDone >= totalSteps;

    return {
      totalSteps,
      completedSteps,
      reviewedSteps,
      needsReviewSteps,
      percentage,
      isComplete,
    };
  }
}

export const defaultLearningEngine = new LearningEngine();
