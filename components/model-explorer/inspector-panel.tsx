'use client';

import { useState, ComponentType } from 'react';
import { 
  X, Layers, HelpCircle, Activity, Info, 
  Lightbulb, Calculator, Settings, ChevronDown, ChevronUp,
  ArrowRight, Image, Zap, Shrink, AlignJustify, Key, 
  PlusCircle, GitMerge, Award, BarChart3, Eye
} from 'lucide-react';
import { Layer, LayerType, Conv2DConfig, PoolingConfig, DenseConfig, BatchNormConfig, DropoutConfig, ConcatenateConfig, BottleneckConfig, LayerConfig, InputConfig, ActivationConfig } from '@/lib/types/layer';
import { cn } from '@/lib/utils/cn';
import { formatNumber, formatShortNumber } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface InspectorPanelProps {
  layer: Layer | null;
  onClose: () => void;
  totalModelParameters?: number;
}

// Icon mappings based on LayerType
const iconMap: Record<LayerType, ComponentType<{ className?: string }>> = {
  input: Image,
  conv2d: Layers,
  batch_norm: Activity,
  layer_norm: Activity,
  attention: Eye,
  activation: Zap,
  max_pooling2d: Shrink,
  average_pooling2d: Shrink,
  global_average_pooling2d: Shrink,
  flatten: AlignJustify,
  dense: Key,
  dropout: HelpCircle,
  add: PlusCircle,
  concatenate: GitMerge,
  bottleneck: Layers,
  dense_block: Layers,
  transition_block: Shrink,
  output: HelpCircle
};

// Styling profiles based on LayerType for visual coherence
const typeStylesMap: Record<string, { border: string; text: string; bg: string; badge: 'default' | 'secondary' | 'outline' | 'success' | 'indigo' | 'primary'; accentBg: string }> = {
  input: {
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.02]',
    badge: 'success',
    accentBg: 'bg-emerald-500/10'
  },
  layer_norm: {
    border: 'border-slate-500/20',
    text: 'text-slate-400',
    bg: 'bg-slate-500/[0.02]',
    badge: 'secondary',
    accentBg: 'bg-slate-500/10'
  },
  attention: {
    border: 'border-fuchsia-500/20',
    text: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/[0.02]',
    badge: 'indigo',
    accentBg: 'bg-fuchsia-500/10'
  },
  conv2d: {
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    bg: 'bg-blue-500/[0.02]',
    badge: 'primary',
    accentBg: 'bg-blue-500/10'
  },
  bottleneck: {
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    bg: 'bg-blue-500/[0.02]',
    badge: 'primary',
    accentBg: 'bg-blue-500/10'
  },
  dense_block: {
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    bg: 'bg-blue-500/[0.02]',
    badge: 'primary',
    accentBg: 'bg-blue-500/10'
  },
  batch_norm: {
    border: 'border-slate-500/20',
    text: 'text-slate-400',
    bg: 'bg-slate-500/[0.02]',
    badge: 'secondary',
    accentBg: 'bg-slate-500/10'
  },
  activation: {
    border: 'border-pink-500/20',
    text: 'text-pink-400',
    bg: 'bg-pink-500/[0.02]',
    badge: 'outline',
    accentBg: 'bg-pink-500/10'
  },
  max_pooling2d: {
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    accentBg: 'bg-amber-500/10'
  },
  average_pooling2d: {
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    accentBg: 'bg-amber-500/10'
  },
  global_average_pooling2d: {
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    accentBg: 'bg-amber-500/10'
  },
  transition_block: {
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    accentBg: 'bg-amber-500/10'
  },
  flatten: {
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    bg: 'bg-orange-500/[0.02]',
    badge: 'outline',
    accentBg: 'bg-orange-500/10'
  },
  dense: {
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    bg: 'bg-violet-500/[0.02]',
    badge: 'indigo',
    accentBg: 'bg-violet-500/10'
  },
  add: {
    border: 'border-red-500/20',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.02]',
    badge: 'outline',
    accentBg: 'bg-red-500/10'
  },
  concatenate: {
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/[0.02]',
    badge: 'outline',
    accentBg: 'bg-cyan-500/10'
  }
};

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  badge
}: { 
  title: string; 
  icon: ComponentType<{ className?: string }>; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border/20 rounded-xl bg-slate-950/20 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 border-b border-border/15 bg-slate-900/30 cursor-pointer hover:bg-slate-900/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <h4 className="text-xs font-extrabold text-white tracking-tight">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          )}
        </div>
      </button>
      
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-3.5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function InspectorPanel({ layer, onClose, totalModelParameters = 0 }: InspectorPanelProps) {
  // Empty Placeholder state
  if (!layer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center bg-slate-950/30 border border-border/30 rounded-2xl h-[calc(100vh-280px)] min-h-[550px] backdrop-blur-md overflow-y-auto">
        <div className="relative mb-5 shrink-0">
          <div className="absolute inset-0 bg-primary/10 rounded-full filter blur-xl animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-slate-900 text-slate-400">
            <Layers className="h-6 w-6 text-primary/70" />
          </div>
        </div>
        
        <h3 className="text-base font-extrabold text-white tracking-tight shrink-0">Inspect Architecture Details</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed shrink-0">
          Click any layer in the sequence to see its configuration, shape changes, and parameter counts.
        </p>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 w-full mt-6 border-t border-border/10 pt-6">
          <div className="flex flex-col items-center sm:items-start lg:items-center xl:items-start p-3 rounded-xl bg-slate-900/30 border border-border/10 text-center sm:text-left lg:text-center xl:text-left hover:border-primary/20 transition-all duration-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2 shrink-0">
              <Settings className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-[10px] font-extrabold text-slate-200 tracking-wide uppercase">Layer settings</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
              Kernel size, stride, padding, and activation for the selected layer.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start lg:items-center xl:items-start p-3 rounded-xl bg-slate-900/30 border border-border/10 text-center sm:text-left lg:text-center xl:text-left hover:border-primary/20 transition-all duration-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 shrink-0">
              <Calculator className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-[10px] font-extrabold text-slate-200 tracking-wide uppercase">Parameter math</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
              Exact weight and bias counts, with the formula used.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start lg:items-center xl:items-start p-3 rounded-xl bg-slate-900/30 border border-border/10 text-center sm:text-left lg:text-center xl:text-left hover:border-primary/20 transition-all duration-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 shrink-0">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-[10px] font-extrabold text-slate-200 tracking-wide uppercase">Intuition & context</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
              Short explanations and everyday analogies to build intuition.
            </p>
          </div>
        </div>

        {/* Tip Indicator */}
        <p className="text-[10px] text-slate-500 font-semibold italic mt-6 shrink-0">
          Tip: Click layers in the Topology Graph or Layers List to update the details panel.
        </p>
      </div>
    );
  }

  const Icon = iconMap[layer.type] || HelpCircle;
  const styles = typeStylesMap[layer.type] || {
    border: 'border-slate-700',
    text: 'text-slate-300',
    bg: 'bg-slate-800/10',
    badge: 'default',
    accentBg: 'bg-slate-800/20'
  };

  const hasParams = layer.parameters.total > 0;
  const paramPercentage = totalModelParameters > 0 
    ? Math.round((layer.parameters.total / totalModelParameters) * 100) 
    : 0;

  // Formatting shapes
  const formatShape = (dims: (number | null)[]) => {
    const clean = dims.filter(d => d !== null);
    return clean.length > 0 ? clean.join(' × ') : 'Flat';
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950/30 border border-border/30 rounded-2xl h-[calc(100vh-280px)] min-h-[550px] backdrop-blur-md overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 p-4 shrink-0 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-750",
            styles.accentBg,
            styles.text
          )}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm tracking-tight">{layer.name}</h3>
              <Badge variant={styles.badge} className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider">
                {layer.type === 'conv2d' ? 'Conv2D' : layer.type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Layer Inspector</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-900/60 p-1.5 rounded-lg transition-all border border-transparent hover:border-border/30 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {/* Dimension Transition visualizer */}
        <div className="bg-slate-900/40 border border-border/10 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex-1 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Input Dimensions</span>
            <div className="font-mono text-xs font-bold text-slate-300 py-1 bg-slate-950/50 rounded border border-border/10">
              {formatShape(layer.inputShape.dimensions)}
            </div>
            <span className="text-[10px] text-slate-450 mt-1 line-clamp-1 block text-ellipsis truncate px-1">
              {layer.inputShape.description}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-slate-600 shrink-0 gap-1">
            <ArrowRight className="h-4 w-4" />
            <span className="text-[9px] text-slate-500 font-bold uppercase">{layer.type}</span>
          </div>

          <div className="flex-1 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Output Dimensions</span>
            <div className="font-mono text-xs font-bold text-slate-300 py-1 bg-slate-950/50 rounded border border-border/10">
              {formatShape(layer.outputShape.dimensions)}
            </div>
            <span className="text-[10px] text-slate-450 mt-1 line-clamp-1 block text-ellipsis truncate px-1">
              {layer.outputShape.description}
            </span>
          </div>
        </div>

        {/* Configurations list */}
        <CollapsibleSection title="Hyperparameters" icon={Settings} defaultOpen={true}>
          {renderConfigDetails(layer.type, layer.config)}
        </CollapsibleSection>

        {/* Parameter Calculation mathematics section */}
        <CollapsibleSection 
          title="Parameter Calculator" 
          icon={Calculator}
          badge={
            <Badge variant={hasParams ? "indigo" : "secondary"} className="text-[9px] font-bold">
              {formatNumber(layer.parameters.total)} params
            </Badge>
          }
        >
          <div className="space-y-3.5">
            {!hasParams ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Info className="h-5 w-5 text-slate-550 mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">Non-parametric Layer</p>
                <p className="text-[10px] text-slate-500 mt-0.5 max-w-[220px]">
                  This layer modifies inputs routing or spatial sizing without learnable weights.
                </p>
              </div>
            ) : (
              <>
                {/* Parameter Percentage Bar */}
                {totalModelParameters > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Of Total Model</span>
                      <span className="text-xs font-bold text-slate-300">{paramPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${paramPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Weight / Bias Split info */}
                {layer.type === 'batch_norm' && layer.parameters.trainableParameters !== undefined ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 border border-border/10 rounded-lg p-2.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Trainable Params</span>
                        <span className="text-sm font-extrabold text-slate-200 mt-0.5 block">{formatNumber(layer.parameters.trainableParameters)}</span>
                        <span className="text-[9px] text-slate-500 block">gamma & beta scale/shift</span>
                      </div>
                      <div className="bg-slate-900/50 border border-border/10 rounded-lg p-2.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Non-Trainable Params</span>
                        <span className="text-sm font-extrabold text-slate-200 mt-0.5 block">{formatNumber(layer.parameters.nonTrainableParameters || 0)}</span>
                        <span className="text-[9px] text-slate-500 block">moving mean & variance</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-border/10 text-center text-[10px]">
                      <div>
                        <span className="text-[#6b7280] font-bold block uppercase text-[8px]">gamma</span>
                        <span className="font-mono text-slate-250 font-extrabold block mt-0.5">{formatShortNumber(layer.parameters.gamma || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[#6b7280] font-bold block uppercase text-[8px]">beta</span>
                        <span className="font-mono text-slate-250 font-extrabold block mt-0.5">{formatShortNumber(layer.parameters.beta || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[#6b7280] font-bold block uppercase text-[8px]">mean</span>
                        <span className="font-mono text-slate-250 font-extrabold block mt-0.5">{formatShortNumber(layer.parameters.movingMean || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[#6b7280] font-bold block uppercase text-[8px]">var</span>
                        <span className="font-mono text-slate-250 font-extrabold block mt-0.5">{formatShortNumber(layer.parameters.movingVariance || 0)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 border border-border/10 rounded-lg p-2.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Kernel Weights</span>
                      <span className="text-sm font-extrabold text-slate-200 mt-0.5 block">{formatNumber(layer.parameters.weights)}</span>
                      <span className="text-[9px] text-slate-500 block">Trainable matrices</span>
                    </div>
                    <div className="bg-slate-900/50 border border-border/10 rounded-lg p-2.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Biases</span>
                      <span className="text-sm font-extrabold text-slate-200 mt-0.5 block">{formatNumber(layer.parameters.biases)}</span>
                      <span className="text-[9px] text-slate-500 block">Offsets (1 per output filter)</span>
                    </div>
                  </div>
                )}

                {/* Math Formula box */}
                <div className="bg-slate-950/60 border border-border/10 rounded-lg p-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Calculation Formula</span>
                  <code className="text-xs font-bold text-emerald-400 font-mono break-all block">
                    {layer.parameters.formula}
                  </code>
                </div>

                {/* Step by step details */}
                <div className="space-y-2.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block border-b border-border/10 pb-1">Calculation Ledger</span>
                  <div className="space-y-2">
                    {layer.parameters.calculationSteps.map((step, idx) => (
                      <div key={idx} className="text-xs flex flex-col gap-0.5 border-l-2 border-emerald-500/20 pl-2">
                        <div className="flex justify-between items-center font-semibold text-slate-350">
                          <span>{step.label}</span>
                          <span className="font-mono text-emerald-450 font-bold">
                            {step.expression} = {formatNumber(step.result)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-normal font-medium mt-0.5">
                          {step.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* Educational Note insights */}
        <CollapsibleSection title="Educational Guide" icon={Lightbulb} defaultOpen={true}>
          <div className="space-y-4">
            {/* Main detailed text */}
            <div className="space-y-1.5">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {layer.educationalNote.detailed}
              </p>
            </div>

            {/* Analogy Box */}
            {layer.educationalNote.analogy && (
              <div className="border border-amber-500/15 bg-amber-500/[0.01] rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Concept Analogy</span>
                </div>
                <p className="text-xs text-slate-350 italic leading-relaxed font-medium pl-0.5">
                  &ldquo;{layer.educationalNote.analogy}&rdquo;
                </p>
              </div>
            )}

            {/* Why it matters Box */}
            {layer.educationalNote.whyItMatters && (
              <div className="border border-blue-500/15 bg-blue-500/[0.01] rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Activity className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Why It Matters</span>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed font-medium pl-0.5">
                  {layer.educationalNote.whyItMatters}
                </p>
              </div>
            )}

            {/* Key Takeaway Box */}
            <div className="border border-emerald-500/15 bg-emerald-500/[0.01] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Award className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Key Takeaway</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed font-medium pl-0.5">
                {layer.educationalNote.keyTakeaway}
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

// Function to render configuration tables dynamically based on Layer Type
function renderConfigDetails(type: LayerType, config: LayerConfig) {
  if (!config) return null;

  const items: { label: string; value: string | number | boolean }[] = [];

  switch (type) {
    case 'input':
      const inputConf = config as InputConfig;
      if (inputConf.shape) {
        items.push({ label: 'Base Resolution', value: `${inputConf.shape[0]} × ${inputConf.shape[1]}` });
        items.push({ label: 'Color Channels', value: inputConf.shape[2] });
      }
      break;

    case 'conv2d':
      const c2d = config as Conv2DConfig;
      items.push({ label: 'Kernel Sizing', value: `${c2d.kernelSize?.[0] ?? 3} × ${c2d.kernelSize?.[1] ?? 3}` });
      items.push({ label: 'Strides', value: `${c2d.strides?.[0] ?? 1} × ${c2d.strides?.[1] ?? 1}` });
      if (c2d.padding) {
        items.push({ label: 'Padding Strategy', value: c2d.padding.toUpperCase() });
      }
      items.push({ label: 'Feature Filters', value: c2d.filters ?? 0 });
      if (c2d.activation) {
        items.push({ label: 'Activation Function', value: c2d.activation.toUpperCase() });
      }
      items.push({ label: 'Uses Bias Parameter', value: c2d.useBias ? 'Yes' : 'No' });
      break;

    case 'max_pooling2d':
    case 'average_pooling2d':
    case 'global_average_pooling2d':
      const pool = config as PoolingConfig;
      if (pool.poolSize) {
        items.push({ label: 'Pooling Window Size', value: `${pool.poolSize[0]} × ${pool.poolSize[1]}` });
      }
      if (pool.strides) {
        items.push({ label: 'Pooling Strides', value: `${pool.strides[0]} × ${pool.strides[1]}` });
      }
      if (pool.padding) {
        items.push({ label: 'Padding Strategy', value: pool.padding.toUpperCase() });
      }
      break;

    case 'dense':
      const dense = config as DenseConfig;
      items.push({ label: 'Output Nodes (Units)', value: dense.units ?? 0 });
      if (dense.activation) {
        items.push({ label: 'Activation Formula', value: dense.activation.toUpperCase() });
      }
      items.push({ label: 'Uses Bias Parameter', value: dense.useBias ? 'Yes' : 'No' });
      break;

    case 'activation':
      const actConf = config as ActivationConfig;
      if (actConf.activation) {
        items.push({ label: 'Activation Function', value: actConf.activation.toUpperCase() });
      }
      break;

    case 'batch_norm':
      const bn = config as BatchNormConfig;
      items.push({ label: 'Normalization Axis', value: bn.axis ?? 0 });
      items.push({ label: 'Momentum Constant', value: bn.momentum ?? 0 });
      items.push({ label: 'Epsilon (Numerical)', value: bn.epsilon ?? 0 });
      break;

    case 'dropout':
      const dropout = config as DropoutConfig;
      items.push({ label: 'Dropout Rate (P)', value: `${((dropout.rate ?? 0) * 100).toFixed(0)}%` });
      break;

    case 'concatenate':
      const concat = config as ConcatenateConfig;
      items.push({ label: 'Concatenate Axis', value: concat.axis ?? 0 });
      break;

    case 'bottleneck':
      const btnk = config as BottleneckConfig;
      items.push({ label: 'ResNet Expansion Factor', value: btnk.expansion ?? 1 });
      break;

    default:
      // Generic details for composite layers (dense_block, transition_block, add, output)
      break;
  }

  if (items.length === 0) return (
    <p className="text-xs text-slate-500 text-center py-2">No configurable hyperparameters for this layer type.</p>
  );

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center text-xs py-0.5 border-b border-border/5">
          <span className="text-slate-400 font-medium">{item.label}</span>
          <span className="font-bold text-slate-200 font-mono">{item.value.toString()}</span>
        </div>
      ))}
    </div>
  );
}
