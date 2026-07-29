'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Code2, Sparkles, CheckCircle2, AlertTriangle, 
  Activity, Server, ArrowRight, Network, BookOpen, 
  BarChart3, Cpu, Clock, HardDrive, Layers
} from 'lucide-react';
import { CodeBlock } from '@/components/code-block';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import { CollapsibleCard } from './implementation/collapsible-card';
import { ImplementationStrategyCard } from './implementation/implementation-strategy-card';
import { InputOutputSpecificationCard } from './implementation/input-output-specification-card';
import { TrainingConfigurationCard } from './implementation/training-configuration-card';
import { InferencePipelineCard } from './implementation/inference-pipeline-card';
import { PerformanceNotesCard } from './implementation/performance-notes-card';
import { ProductionChecklistCard } from './implementation/production-checklist-card';

interface ImplementationTabProps {
  modelId: string;
  modelName: string;
  paperUrl?: string;
  implementation: ModelImplementationData | null;
  onNavigateToTopology?: () => void;
}

export default function ImplementationTab({
  modelId,
  modelName,
  paperUrl,
  implementation,
  onNavigateToTopology,
}: ImplementationTabProps) {
  const shouldReduceMotion = useReducedMotionPreference();

  // Handle Empty State when model implementation JSON does not exist yet
  if (!implementation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
        className="flex flex-col items-center justify-center min-h-[480px] p-8 text-center bg-[#020617] border border-[#1f2937] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-4 shadow-lg shadow-cyan-950/50">
          <Code2 className="h-8 w-8 text-cyan-400" />
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Implementation Example Coming Soon</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight max-w-md">
          Code Implementation for {modelName} is in Development
        </h2>

        <p className="mt-2 text-sm text-slate-400 max-w-lg leading-relaxed">
          Curated production-ready implementations for {modelName} are scheduled for the next release.
        </p>

        <div className="mt-6">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Supported Frameworks (Planned)</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-md">TensorFlow</span>
            <span className="text-[10px] font-semibold text-orange-300 bg-orange-950/40 border border-orange-500/20 px-2.5 py-1 rounded-md">PyTorch</span>
            <span className="text-[10px] font-semibold text-yellow-300 bg-yellow-950/40 border border-yellow-500/20 px-2.5 py-1 rounded-md">Hugging Face</span>
            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md">JAX</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onNavigateToTopology && (
            <button
              onClick={onNavigateToTopology}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-950/50 cursor-pointer"
            >
              <Network className="h-4 w-4" />
              Explore Topology Graph
            </button>
          )}

          <Link
            href="/models/resnet50"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-800 hover:border-slate-700 transition-colors"
          >
            <Code2 className="h-4 w-4 text-cyan-400" />
            View ResNet-50 Implementation
          </Link>
        </div>
      </motion.div>
    );
  }

  const { metadata, summary } = implementation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      className="space-y-6"
    >
      {/* 1. Implementation Header Banner */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950">
            <Code2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                Practical Learning Stage
              </span>
              {implementation.difficulty && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {implementation.difficulty}
                </span>
              )}
              {implementation.implementationType && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {implementation.implementationType}
                </span>
              )}
              {implementation.exampleCategory && (
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md">
                  {implementation.exampleCategory}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {implementation.headerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {implementation.headerDescription}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Compact Specification Overview Card */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          Engineering Setup Specifications
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metadata.frameworkVersion && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Framework</span>
              <span className="text-xs font-semibold text-slate-200 block truncate mt-0.5" title={metadata.frameworkVersion}>
                {metadata.frameworkVersion}
              </span>
            </div>
          )}

          {metadata.pythonVersion && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Python Version</span>
              <span className="text-xs font-semibold text-slate-200 block mt-0.5">
                v{metadata.pythonVersion}
              </span>
            </div>
          )}

          {metadata.inputResolution && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Input Shape</span>
              <span className="text-xs font-semibold text-cyan-300 font-mono block mt-0.5">
                {metadata.inputResolution}
              </span>
            </div>
          )}

          {metadata.dataset && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Pretrained Dataset</span>
              <span className="text-xs font-semibold text-slate-200 block truncate mt-0.5" title={metadata.dataset}>
                {metadata.dataset}
              </span>
            </div>
          )}

          {metadata.gpuRequirement && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">GPU Requirement</span>
              <span className="text-xs font-semibold text-emerald-400 block mt-0.5 flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {metadata.gpuRequirement}
              </span>
            </div>
          )}

          {metadata.estimatedRuntime && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Est. Runtime</span>
              <span className="text-xs font-semibold text-slate-300 block mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" />
                {metadata.estimatedRuntime}
              </span>
            </div>
          )}
        </div>

        {/* Verification Metadata */}
        {implementation.verification && (implementation.verification.lastVerifiedDate || implementation.verification.verifiedFrameworkVersions?.length) && (
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500">
              {implementation.verification.lastVerifiedDate && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Last verified: {implementation.verification.lastVerifiedDate}</span>
                </span>
              )}
              {implementation.verification.verifiedFrameworkVersions && implementation.verification.verifiedFrameworkVersions.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Server className="h-3 w-3 text-cyan-400" />
                  <span>Tested with: {implementation.verification.verifiedFrameworkVersions.join(', ')}</span>
                </span>
              )}
              {implementation.verification.verifiedPythonVersion && (
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-purple-400" />
                  <span>Python {implementation.verification.verifiedPythonVersion}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2.5. Prerequisites Card */}
      {implementation.prerequisites && (
        <CollapsibleCard
          title="Prerequisites"
          icon={<BookOpen className="h-4 w-4 text-cyan-400 shrink-0" />}
          defaultExpandedDesktop={true}
          defaultExpandedMobile={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {implementation.prerequisites.minimumPythonVersion && (
              <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Minimum Python</span>
                <span className="text-xs font-semibold text-slate-200 block mt-0.5">
                  {implementation.prerequisites.minimumPythonVersion}
                </span>
              </div>
            )}

            {implementation.prerequisites.frameworkVersion && (
              <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Framework Version</span>
                <span className="text-xs font-semibold text-slate-200 block mt-0.5">
                  {implementation.prerequisites.frameworkVersion}
                </span>
              </div>
            )}

            {implementation.prerequisites.hardwareRecommendation && (
              <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Hardware</span>
                <span className="text-xs font-semibold text-slate-200 block mt-0.5">
                  {implementation.prerequisites.hardwareRecommendation}
                </span>
              </div>
            )}

            {implementation.prerequisites.knowledgePrerequisites && implementation.prerequisites.knowledgePrerequisites.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">Knowledge Prerequisites</span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {implementation.prerequisites.knowledgePrerequisites.map((item, idx) => (
                    <span key={idx} className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {implementation.prerequisites.expectedFamiliarity && implementation.prerequisites.expectedFamiliarity.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">Expected Familiarity</span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {implementation.prerequisites.expectedFamiliarity.map((item, idx) => (
                    <span key={idx} className="text-[10px] font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-md">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* 2.6. Implementation Strategy & Rationale Card */}
      {implementation.strategy && (
        <ImplementationStrategyCard strategy={implementation.strategy} />
      )}

      {/* 2.7. Input / Output Specification Card */}
      {implementation.ioSpecification && (
        <InputOutputSpecificationCard ioSpecification={implementation.ioSpecification} />
      )}

      {/* 2.8. Recommended Training Configuration Card */}
      {implementation.trainingConfig && (
        <TrainingConfigurationCard trainingConfig={implementation.trainingConfig} />
      )}

      {/* 2.9. Inference Pipeline Architecture Flow */}
      {implementation.inferencePipeline && (
        <InferencePipelineCard pipeline={implementation.inferencePipeline} />
      )}

      {/* 3. CodeBlock Integration Component */}
      <CodeBlock
        modelName={implementation.subtitle ? `${modelName} (${implementation.subtitle})` : modelName}
        subtitle={implementation.headerDescription}
        difficulty={implementation.difficulty}
        isTransferLearning={implementation.isTransferLearning}
        implementationType={implementation.implementationType}
        exampleCategory={implementation.exampleCategory}
        isProductionReady={implementation.isProductionReady}
        metadata={implementation.metadata}
        variants={implementation.variants}
        callouts={implementation.callouts}
        footer={implementation.footer}
        className="my-0 shadow-2xl"
      />

      {/* 3.5. Performance & Engineering Characteristics Card */}
      {implementation.performanceNotes && (
        <PerformanceNotesCard performanceNotes={implementation.performanceNotes} />
      )}

      {/* 4. Engineering Summary Section */}
      {summary && (
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-[#1f2937] pb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Engineering Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Used When */}
            {summary.bestUsedWhen && summary.bestUsedWhen.length > 0 && (
              <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Best Used When</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {summary.bestUsedWhen.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Architectural Tradeoffs */}
            {summary.tradeoffs && summary.tradeoffs.length > 0 && (
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Architectural Tradeoffs</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {summary.tradeoffs.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expected Training Behavior */}
            {summary.expectedBehavior && summary.expectedBehavior.length > 0 && (
              <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>Expected Training Behavior</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {summary.expectedBehavior.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Production Deployment Notes */}
            {summary.deploymentNotes && summary.deploymentNotes.length > 0 && (
              <div className="bg-slate-950/60 border border-purple-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Server className="h-4 w-4 shrink-0" />
                  <span>Production & Serving Notes</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {summary.deploymentNotes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4.5. Production Readiness & Serving Checklist */}
      {implementation.productionChecklist && (
        <ProductionChecklistCard productionChecklist={implementation.productionChecklist} />
      )}

      {/* 5. Next Learning Step Navigation */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
          Next Learning Steps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {onNavigateToTopology && (
            <button
              onClick={onNavigateToTopology}
              className="flex items-center justify-between min-h-[44px] p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-cyan-500/40 transition-all font-bold text-xs text-slate-300 hover:text-white cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Network className="h-4 w-4 text-cyan-400" />
                Explore Topology Graph
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          )}

          {paperUrl && (
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between min-h-[44px] p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-cyan-500/40 transition-all font-bold text-xs text-slate-300 hover:text-white group"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Read Original Paper
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </a>
          )}

          <Link
            href="/compare"
            className="flex items-center justify-between min-h-[44px] p-3.5 rounded-xl border border-[#1f2937] bg-[#020617] hover:bg-[#0a0f1e] hover:border-cyan-500/40 transition-all font-bold text-xs text-slate-300 hover:text-white group"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Compare Model Benchmarks
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
