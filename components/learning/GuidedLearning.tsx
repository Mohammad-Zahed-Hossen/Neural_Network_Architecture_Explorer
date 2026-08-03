'use client';

import React, { useState } from 'react';
import type { LearningCheckpointState, LearningSession } from '@/lib/learning/types';
import { learningService } from '@/lib/learning/learning-service';
import { defaultLearningEngine } from '@/lib/learning/learning-engine';
import { LearningProgress } from './LearningProgress';
import { WalkthroughPanel } from './WalkthroughPanel';
import { PredictionPanel } from './PredictionPanel';
import { LearningCheckpointComponent } from './LearningCheckpoint';
import { LearningNavigator } from './LearningNavigator';
import { LearningSummary } from './LearningSummary';
import { LearningSidebar } from './LearningSidebar';

interface GuidedLearningProps {
  objectId?: string;
}

export const GuidedLearning: React.FC<GuidedLearningProps> = ({ objectId = 'resnet50' }) => {
  const [session, setSession] = useState<LearningSession>(() => learningService.startSession(objectId));

  const currentStep = session.steps[session.currentStepIndex];
  const isSummaryStep = session.currentStepIndex === session.steps.length - 1;

  const handleNext = () => {
    const updated = defaultLearningEngine.nextStep(session);
    setSession(updated);
    learningService.saveSession(updated);
  };

  const handlePrevious = () => {
    const updated = defaultLearningEngine.previousStep(session);
    setSession(updated);
    learningService.saveSession(updated);
  };

  const handleSelectStep = (index: number) => {
    const updated = { ...session, currentStepIndex: index };
    setSession(updated);
    learningService.saveSession(updated);
  };

  const handleCheckpointChange = (state: LearningCheckpointState) => {
    if (!currentStep) return;
    const updated = defaultLearningEngine.completeCheckpoint(session, currentStep.id, state);
    setSession(updated);
    learningService.saveSession(updated);
  };

  const handlePredictionAnswer = (selectedIndex: number) => {
    if (!currentStep) return;
    const { session: updated } = defaultLearningEngine.answerPrediction(session, currentStep.id, selectedIndex);
    setSession(updated);
    learningService.saveSession(updated);
  };

  const handleRestart = () => {
    const fresh = learningService.restartSession(objectId);
    setSession(fresh);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 text-[10px] font-mono uppercase">
              Phase 5.2 — Guided Learning
            </span>
            <span className="text-xs text-slate-500">• Deterministic Graph Walkthrough</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Guided Walkthrough: {session.targetObjectTitle}
          </h1>
        </div>

        <button
          onClick={handleRestart}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 self-start md:self-auto"
        >
          Restart Session
        </button>
      </div>

      {/* Progress Bar */}
      <LearningProgress
        progress={session.progress}
        currentStepIndex={session.currentStepIndex}
        totalSteps={session.steps.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <LearningSidebar
            session={session}
            currentStepIndex={session.currentStepIndex}
            onSelectStep={handleSelectStep}
          />
        </div>

        {/* Main Content Viewer */}
        <div className="lg:col-span-3">
          {isSummaryStep ? (
            <LearningSummary session={session} onRestart={handleRestart} />
          ) : (
            currentStep && (
              <>
                <WalkthroughPanel step={currentStep} />

                {/* Prediction Panel if step has exercise */}
                {currentStep.predictionQuestion && (
                  <PredictionPanel
                    predictionQuestion={currentStep.predictionQuestion}
                    onAnswer={handlePredictionAnswer}
                  />
                )}

                {/* Checkpoint Status Selection */}
                <LearningCheckpointComponent
                  checkpointId={currentStep.checkpointId}
                  currentState={session.checkpoints[currentStep.checkpointId]?.state || 'needs_review'}
                  onStateChange={handleCheckpointChange}
                />
              </>
            )
          )}

          {/* Stepper Navigator */}
          <div className="mt-6">
            <LearningNavigator
              currentStepIndex={session.currentStepIndex}
              totalSteps={session.steps.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
