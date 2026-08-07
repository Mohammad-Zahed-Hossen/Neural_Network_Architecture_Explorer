'use client';

import React, { useState, useMemo } from 'react';
import type { ComparisonResult, ComparisonObject } from '@/lib/comparison/types';
import { Award, Cpu, Zap, Lightbulb, CheckCircle2, ShieldAlert, Sparkles, Layers } from 'lucide-react';

interface ComparisonSummaryProps {
  result: ComparisonResult;
}

function getParadigm(obj: ComparisonObject): string {
  const p = (obj.rawObject?.extensibility?.domainMetadata as Record<string, unknown> | undefined)?.paradigm ||
            (obj.rawObject?.extensibility?.domainMetadata as Record<string, unknown> | undefined)?.architectureFamily;
  if (p) return String(p);
  const title = obj.title.toLowerCase();
  if (title.includes('resnet')) return 'Residual Connections (Skip-Add)';
  if (title.includes('dense')) return 'Dense Feature Reuse';
  if (title.includes('vit') || title.includes('transformer') || title.includes('attention')) return 'Self-Attention Token Modeling';
  if (title.includes('mobile')) return 'Inverted Residual & Depthwise Separable';
  if (title.includes('convnext')) return 'Modernized Pure Convolutional';
  if (title.includes('vgg') || title.includes('alexnet') || title.includes('lenet')) return 'Sequential Convolutional Stacking';
  return 'Convolutional Neural Network';
}

function getPrimitive(obj: ComparisonObject): string {
  const prim = (obj.rawObject?.extensibility?.domainMetadata as Record<string, unknown> | undefined)?.blockPrimitive;
  if (prim) return String(prim);
  const title = obj.title.toLowerCase();
  if (title.includes('resnet')) return 'Residual Bottleneck [1x1, 3x3, 1x1] + Shortcut';
  if (title.includes('dense')) return 'Dense Block [1x1, 3x3] Concatenation';
  if (title.includes('vit') || title.includes('swin')) return 'Multi-Head Self-Attention (MHSA) + MLP';
  if (title.includes('mobile')) return 'Depthwise Conv 3x3 + Pointwise 1x1';
  if (title.includes('convnext')) return '7x7 Depthwise Conv + Inverted Bottleneck';
  if (title.includes('vgg')) return '3x3 Conv Stack + 2x2 MaxPool';
  return 'Standard Convolutional Block';
}

function getBreakthrough(obj: ComparisonObject): string {
  const b = obj.summary || obj.description || (obj.rawObject?.extensibility?.domainMetadata as Record<string, unknown> | undefined)?.breakthroughSummary;
  if (b) return String(b);
  return 'Foundational architectural innovation in deep learning.';
}

import { CollapsibleText } from './CollapsibleText';

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ result }) => {
  const [showBlueprints, setShowBlueprints] = useState(false);

  // Compute deployment recommendations & automated natural language insight sentences
  const { recommendations, comparativeInsight } = useMemo(() => {
    let bestAccObj: { title: string; formatted: string } | null = null;
    let bestAccVal = -1;

    let minParamObj: { title: string; formatted: string } | null = null;
    let minParamVal = Infinity;

    let minFlopObj: { title: string; formatted: string } | null = null;
    let minFlopVal = Infinity;

    for (const obj of result.objects) {
      const accVal = result.metricMatrix['accuracy']?.[obj.id]?.value;
      if (typeof accVal === 'number' && accVal > bestAccVal) {
        bestAccVal = accVal;
        bestAccObj = { title: obj.title, formatted: result.metricMatrix['accuracy'][obj.id].formatted };
      }

      const paramVal = result.metricMatrix['parameters']?.[obj.id]?.value;
      if (typeof paramVal === 'number' && paramVal > 0 && paramVal < minParamVal) {
        minParamVal = paramVal;
        minParamObj = { title: obj.title, formatted: result.metricMatrix['parameters'][obj.id].formatted };
      }

      const flopVal = result.metricMatrix['flops']?.[obj.id]?.value;
      if (typeof flopVal === 'number' && flopVal > 0 && flopVal < minFlopVal) {
        minFlopVal = flopVal;
        minFlopObj = { title: obj.title, formatted: result.metricMatrix['flops'][obj.id].formatted };
      }
    }

    // Compute automated natural language comparative sentence between first 2 objects
    let insight: string | null = null;
    if (result.objects.length >= 2) {
      const objA = result.objects[0];
      const objB = result.objects[1];

      const pA = result.metricMatrix['parameters']?.[objA.id]?.value;
      const pB = result.metricMatrix['parameters']?.[objB.id]?.value;
      const aA = result.metricMatrix['accuracy']?.[objA.id]?.value;
      const aB = result.metricMatrix['accuracy']?.[objB.id]?.value;

      if (typeof pA === 'number' && typeof pB === 'number' && pA > 0 && pB > 0) {
        const smallerObj = pA < pB ? objA : objB;
        const largerObj = pA < pB ? objB : objA;
        const sP = pA < pB ? pA : pB;
        const lP = pA < pB ? pB : pA;

        const sAcc = pA < pB ? aA : aB;
        const lAcc = pA < pB ? aB : aA;

        const ratio = (lP / sP).toFixed(1);
        const percentSmaller = Math.round((1 - sP / lP) * 100);

        if (typeof sAcc === 'number' && typeof lAcc === 'number') {
          const accDiff = (sAcc - lAcc).toFixed(1);
          const isBetter = sAcc >= lAcc;

          if (isBetter) {
            insight = `${smallerObj.title} requires ${percentSmaller}% fewer parameters (${ratio}× smaller) than ${largerObj.title} while improving Top-1 accuracy by +${accDiff}%.`;
          } else {
            const loss = Math.abs(Number(accDiff)).toFixed(1);
            insight = `${smallerObj.title} operates with ${percentSmaller}% fewer parameters than ${largerObj.title} while retaining ${sAcc.toFixed(1)}% Top-1 accuracy (-${loss}% trade-off).`;
          }
        } else {
          insight = `${smallerObj.title} requires ${percentSmaller}% fewer parameters (${ratio}× smaller) than ${largerObj.title}.`;
        }
      }
    }

    return {
      recommendations: { bestAccObj, minParamObj, minFlopObj },
      comparativeInsight: insight,
    };
  }, [result]);

  return (
    <div className="space-y-8 mb-8" id="comparison-matrix-section">
      {/* 10-Second Executive Takeaway & Automated Rationale Banner */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-purple-950/90 border border-blue-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider font-mono block">
                Executive Takeaway Summary
              </span>
              <span className="text-sm font-bold text-white">
                Comparing {result.objects.map((o) => o.title).join(' vs ')}
              </span>
            </div>
          </div>

          {/* Quick Winner Pill */}
          {recommendations.bestAccObj && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shrink-0">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Overall Accuracy Winner: {recommendations.bestAccObj.title} ({recommendations.bestAccObj.formatted})</span>
            </div>
          )}
        </div>

        {/* Analytical Rationale Sentence */}
        {comparativeInsight && (
          <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-sans">
            💡 <strong className="text-cyan-300">Analytical Rationale:</strong> {comparativeInsight}
          </p>
        )}
      </div>

      {/* Executive Recommendation Cards */}
      {(recommendations.bestAccObj || recommendations.minParamObj || recommendations.minFlopObj) && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase font-mono">
              Deployment Recommendations & Decision Rationale
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-xs">
            {/* Best Accuracy */}
            {recommendations.bestAccObj && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 shadow-md hover:border-emerald-500/50 transition-all">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1.5">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cloud / Peak Accuracy Champion</span>
                </div>
                <div className="font-extrabold text-white text-base">{recommendations.bestAccObj.title}</div>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Achieves top classification accuracy ({recommendations.bestAccObj.formatted}). Ideal for high-precision server-side inference.
                </p>
              </div>
            )}

            {/* Most Parameter Efficient */}
            {recommendations.minParamObj && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/30 shadow-md hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1.5">
                  <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Mobile & Edge AI Deployment</span>
                </div>
                <div className="font-extrabold text-white text-base">{recommendations.minParamObj.title}</div>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Requires lowest memory ({recommendations.minParamObj.formatted} parameters). Optimized for mobile devices and embedded hardware.
                </p>
              </div>
            )}

            {/* Lowest FLOPs */}
            {recommendations.minFlopObj && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 shadow-md hover:border-amber-500/50 transition-all">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Real-Time Low Latency</span>
                </div>
                <div className="font-extrabold text-white text-base">{recommendations.minFlopObj.title}</div>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Lowest compute complexity ({recommendations.minFlopObj.formatted}). Preferred for real-time high-FPS video pipelines.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUALITATIVE ARCHITECTURAL BLUEPRINT CARDS SECTION (Progressive Disclosure) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 tracking-wide uppercase font-mono">
            <Layers className="w-4 h-4 text-purple-400" />
            Architectural Blueprint & Mechanics
          </h3>
          <button
            type="button"
            onClick={() => setShowBlueprints(!showBlueprints)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
            aria-expanded={showBlueprints}
          >
            <span>{showBlueprints ? 'Hide Details' : 'Show Blueprint Details'}</span>
            <span className="text-[10px]">{showBlueprints ? '▲' : '▼'}</span>
          </button>
        </div>

        {showBlueprints && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 animate-fadeIn">
            {result.objects.map((obj, i) => {
              const colors = [
                { border: 'border-blue-500/40', title: 'text-blue-300' },
                { border: 'border-emerald-500/40', title: 'text-emerald-300' },
                { border: 'border-amber-500/40', title: 'text-amber-300' },
                { border: 'border-purple-500/40', title: 'text-purple-300' },
                { border: 'border-rose-500/40', title: 'text-rose-300' },
                { border: 'border-cyan-500/40', title: 'text-cyan-300' },
              ];
              const currentStyle = colors[i % colors.length];

              return (
                <div
                  key={obj.id}
                  className={`bg-slate-950/80 border ${currentStyle.border} rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-all`}
                >
                  <div>
                    <div className={`font-extrabold text-sm ${currentStyle.title}`}>{obj.title}</div>
                    <div className="text-[10px] text-purple-400 font-mono mt-0.5">{getParadigm(obj)}</div>

                    <div className="mt-3.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Block Primitive</span>
                      <p className="text-xs text-slate-200 font-mono mt-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        {getPrimitive(obj)}
                      </p>
                    </div>

                    <div className="mt-3.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Breakthrough Rationale</span>
                      <div className="mt-1">
                        <CollapsibleText
                          text={getBreakthrough(obj)}
                          maxLines={3}
                          className="text-xs text-slate-400 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shared Similarities & Key Differences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Similarities */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-6 backdrop-blur-sm shadow-md">
          <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Shared Architectural Foundations
          </h3>
          {result.keySimilarities.length > 0 ? (
            <div className="space-y-3">
              {result.keySimilarities.map((sim, i) => (
                <div key={i} className="bg-slate-900/80 rounded-lg p-3 border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-300">{sim.feature}</div>
                  <div className="text-xs text-slate-300 mt-1">{sim.description || String(sim.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              All compared entities share foundational neural network mathematical principles and layer compositions.
            </p>
          )}
        </div>

        {/* Key Differences */}
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-6 backdrop-blur-sm shadow-md">
          <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Key Architectural & Operational Trade-Offs
          </h3>
          <div className="space-y-4">
            {result.keyDifferences.slice(0, 4).map((diff, i) => (
              <div key={i} className="bg-slate-900/90 rounded-xl p-3.5 border border-amber-500/30 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                  <span>{diff.feature}</span>
                  <span className="text-[10px] text-amber-400/80 font-mono uppercase bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Trade-Off
                  </span>
                </div>
                {diff.impact && <div className="text-[11px] text-slate-300 mb-2 font-mono leading-tight">⚠️ {diff.impact}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2">
                  {Object.entries(diff.values).map(([objId, val]) => {
                    const obj = result.objects.find((o) => o.id === objId);
                    const title = obj ? obj.title : objId;

                    return (
                      <div key={objId} className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] block">{title}</span>
                          <span className="text-slate-200 font-medium">{String(val)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
