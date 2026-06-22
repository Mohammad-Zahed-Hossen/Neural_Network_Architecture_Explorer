'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Zap, ArrowRight, RotateCcw, CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import advisorQuestions from '@/data/advisor.json';
import modelsSummary from '@/data/models.json';
import { formatShortNumber, formatAccuracy, formatMemory } from '@/lib/utils/formatters';

interface Question {
  id: string;
  text: string;
  description: string;
  options: {
    value: string;
    label: string;
    description: string;
  }[];
}

interface Selection {
  goal: string;
  hardware: string;
  budget: string;
}

export default function ModelAdvisor() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selections, setSelections] = useState<Selection>({
    goal: '',
    hardware: '',
    budget: ''
  });
  const [showResults, setShowResults] = useState<boolean>(false);

  const questions = advisorQuestions.questions as Question[];

  const handleSelect = (questionId: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [questionId]: value
    }));

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setSelections({
      goal: '',
      hardware: '',
      budget: ''
    });
    setCurrentStep(0);
    setShowResults(false);
  };

  // Rule-based scoring engine running client-side
  const recommendedModels = useMemo(() => {
    if (!showResults) return [];

    const { goal, hardware, budget } = selections;

    const scored = modelsSummary.map(model => {
      let score = 50; // Base score
      const reasons: string[] = [];
      const tradeOffs: string[] = [];

      const paramsInM = model.params / 1e6;
      const flopsInG = model.flops / 1e9;
      const top1 = model.top1;

      // 1. Goal constraints scoring
      if (goal === 'accuracy') {
        score += top1 * 0.8; // Heavily reward accuracy
        reasons.push(`Achieves high accuracy (${formatAccuracy(model.top1Accuracy)} Top-1)`);
        
        if (model.params > 40e6) {
          tradeOffs.push("High parameter footprint requires more storage");
        }
        if (model.flops > 10e9) {
          tradeOffs.push("Demanding FLOP count can cause slow CPU execution");
        }
      } else if (goal === 'latency') {
        // Reward low FLOPs
        if (flopsInG < 1) {
          score += 40;
          reasons.push(`Extremely fast, requiring under 1 GFLOP (${flopsInG.toFixed(2)} GFLOPs)`);
        } else if (flopsInG < 5) {
          score += 20;
          reasons.push(`Moderate latency with ${flopsInG.toFixed(1)} GFLOPs`);
        } else {
          score -= 30;
          tradeOffs.push(`High computational overhead (${flopsInG.toFixed(1)} GFLOPs) slows inference`);
        }
      } else if (goal === 'memory') {
        // Reward low memory usage
        if (model.memory_mb < 30) {
          score += 40;
          reasons.push(`Ultra-low memory footprint (${formatMemory(model.memory_mb)})`);
        } else if (model.memory_mb < 100) {
          score += 20;
          reasons.push(`Balanced memory footprints (${formatMemory(model.memory_mb)})`);
        } else {
          score -= 40;
          tradeOffs.push(`Large memory footprint (${formatMemory(model.memory_mb)}) may exceed edge limits`);
        }
      } else if (goal === 'education') {
        // Reward classic, representative paradigm models
        const educationalIds = ['vgg16', 'resnet50', 'densenet121', 'mobilenet', 'inceptionv3'];
        if (educationalIds.includes(model.id)) {
          score += 35;
          reasons.push("Foundational architecture key to deep learning history");
        }
      }

      // 2. Hardware environment constraints scoring
      if (hardware === 'mobile') {
        if (model.id.includes('mobilenet')) {
          score += 40;
          reasons.push("Designed specifically for mobile devices with depthwise separable layers");
        } else if (model.id.includes('efficientnetb0') || model.id.includes('efficientnetb1')) {
          score += 25;
          reasons.push("Small EfficientNet variant suitable for modern mobile cores");
        } else if (model.id === 'nasnetmobile') {
          score += 30;
          reasons.push("Mobile-specific model discovered via architecture search");
        }

        if (model.params > 30e6 || model.memory_mb > 150) {
          score -= 40;
          tradeOffs.push("Model package or VRAM size is heavy for mobile runtime bundles");
        }
      } else if (hardware === 'embedded') {
        if (model.id === 'mobilenetv3small' || model.id === 'mobilenetv3large') {
          score += 45;
          reasons.push("Highly optimized TinyML target with negligible resource footprint");
        } else if (model.id === 'nasnetmobile') {
          score += 30;
          reasons.push("Lightweight search configuration fits microcontroller limits");
        } else if (model.id === 'efficientnetb0') {
          score += 25;
          reasons.push("Smallest EfficientNet matches embedded CPU bounds");
        }

        if (model.params > 10e6 || model.memory_mb > 50) {
          score -= 60;
          tradeOffs.push("Requires too much memory for basic microcontroller nodes");
        }
      } else if (hardware === 'server') {
        // Servers can handle heavy models easily
        if (model.params > 40e6 || model.id.includes('b6') || model.id.includes('b7')) {
          score += 25;
          reasons.push("Maximizes representation capacity by utilizing high-end GPU threads");
        }
      }

      // 3. Compute Budget constraints scoring
      if (budget === 'low') {
        if (flopsInG < 0.5) {
          score += 30;
        } else if (flopsInG > 8) {
          score -= 45;
          tradeOffs.push("FLOP overhead exceeds battery/power limits");
        }
      } else if (budget === 'high') {
        // High budget means we can afford larger FLOPs
        if (flopsInG > 8) {
          score += 20;
          reasons.push("Uses high-FLOP processing to unlock fine feature dimensions");
        }
      }

      // Cap scores between 0 and 100
      const finalScore = Math.max(0, Math.min(100, Math.round(score)));

      return {
        ...model,
        matchScore: finalScore,
        reasons: reasons.slice(0, 2),
        tradeOffs: tradeOffs.slice(0, 2)
      };
    });

    // Sort by match score descending
    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
  }, [showResults, selections, questions.length]);

  // Questions configuration accessor
  const currentQuestion = questions[currentStep] || questions[0];

  return (
    <div className="relative flex flex-col items-center">
      {/* Wizard Container */}
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl glass-card rounded-3xl p-6 md:p-8 relative"
            >
              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-6 flex">
                {questions.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-full flex-1 border-r border-slate-950 last:border-0 transition-all duration-300 ${
                      idx <= currentStep ? 'bg-primary' : 'bg-slate-800'
                    }`} 
                  />
                ))}
              </div>

              {/* Step indicator */}
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">
                Question {currentStep + 1} of {questions.length}
              </span>

              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mb-2">
                {currentQuestion.text}
              </h2>
              <p className="text-xs text-slate-450 mb-6 font-medium leading-relaxed">
                {currentQuestion.description}
              </p>

              {/* Options grid */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(currentQuestion.id, opt.value)}
                    className="w-full text-left px-5 py-4 rounded-2xl border border-border/20 bg-slate-900/20 hover:bg-slate-900/50 hover:border-primary/40 text-slate-300 hover:text-white transition-all cursor-pointer group flex flex-col gap-1.5"
                  >
                    <span className="text-xs font-extrabold text-slate-200 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {opt.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </span>
                    <span className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Back button */}
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Go Back
                </button>
              )}
            </motion.div>
          ) : (
            // RESULTS PAGE
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-8"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="h-5.5 w-5.5 text-primary" />
                  Recommended Architectures
                </h2>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 border border-border/30 bg-slate-900/40 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer hover:border-primary/20"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart Advisor
                </button>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedModels.map((rec, idx) => {
                  const isBest = idx === 0;

                  return (
                    <div
                      key={rec.id}
                      className={`glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden ${
                        isBest 
                          ? 'border-primary/45 bg-slate-950/60 shadow-lg shadow-primary/5' 
                          : ''
                      }`}
                    >
                      {/* Best match overlay badge */}
                      {isBest && (
                        <div className="absolute top-0 right-0 bg-primary text-slate-950 font-black uppercase text-[8px] tracking-widest px-3 py-1 rounded-bl-xl">
                          Best Match
                        </div>
                      )}

                      <div>
                        {/* Title & Match score */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-black text-white">{rec.name}</h3>
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                              {rec.family} Family
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-primary block">
                              {rec.matchScore}%
                            </span>
                            <span className="text-[9px] text-slate-500 font-semibold block uppercase">
                              Match Rating
                            </span>
                          </div>
                        </div>

                        {/* Dynamic specifications list */}
                        <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-white/5 bg-slate-950/40 my-4 text-center rounded-xl">
                          <div>
                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider block">Accuracy</span>
                            <span className="text-xs font-extrabold text-slate-200 block mt-0.5">
                              {formatAccuracy(rec.top1Accuracy)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider block">Params</span>
                            <span className="text-xs font-extrabold text-slate-200 block mt-0.5">
                              {formatShortNumber(rec.totalParameters)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider block">Memory</span>
                            <span className="text-xs font-extrabold text-slate-200 block mt-0.5">
                              {formatMemory(rec.memoryUsage)}
                            </span>
                          </div>
                        </div>

                        {/* Match reasons */}
                        <div className="space-y-2 mb-6 font-semibold">
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                            Why it matches:
                          </span>
                          {rec.reasons.map((r, rIdx) => (
                            <div key={rIdx} className="text-xs text-slate-350 flex items-start gap-1.5 leading-relaxed font-semibold">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              <span>{r}</span>
                            </div>
                          ))}
                          {rec.tradeOffs.map((t, tIdx) => (
                            <div key={tIdx} className="text-xs text-slate-450 flex items-start gap-1.5 leading-relaxed font-medium italic">
                              <span className="text-amber-500 mt-0.5 shrink-0 flex items-center justify-center font-bold">!</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card CTA links */}
                      <div className="flex gap-2 border-t border-white/5 pt-4">
                        <Link
                          href={`/models/${rec.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/20 transition-all rounded-xl cursor-pointer"
                        >
                          Interactive Explorer <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href={rec.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-white/10 hover:border-slate-500 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer bg-slate-950/20"
                          title="Read research paper"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
