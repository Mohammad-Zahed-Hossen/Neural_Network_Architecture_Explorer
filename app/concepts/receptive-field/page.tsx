'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Info, Layers,
  ChevronRight, Grid
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getModelSummaries } from '@/lib/data-access/models';
import { calculateReceptiveFields } from '@/lib/utils/rf-math';
import { NeuralNetworkModel } from '@/lib/schema/model.schema';
import ContinueLearning from '@/components/ui/continue-learning';
import MathFormula from '@/components/ui/math-formula';
import ModelSelectorDropdown from '@/components/ui/model-selector-dropdown';

// Code-split dynamic loaders for all models' detailed configurations

// Code-split dynamic loaders for all models' detailed configurations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modelLoaders: Record<string, () => Promise<any>> = {
  lenet: () => import('@/data/models/lenet.json'),
  alexnet: () => import('@/data/models/alexnet.json'),
  vgg16: () => import('@/data/models/vgg16.json'),
  vgg19: () => import('@/data/models/vgg19.json'),
  resnet50: () => import('@/data/models/resnet50.json'),
  resnet101: () => import('@/data/models/resnet101.json'),
  resnet152: () => import('@/data/models/resnet152.json'),
  resnet50v2: () => import('@/data/models/resnet50v2.json'),
  resnet101v2: () => import('@/data/models/resnet101v2.json'),
  resnet152v2: () => import('@/data/models/resnet152v2.json'),
  densenet121: () => import('@/data/models/densenet121.json'),
  densenet169: () => import('@/data/models/densenet169.json'),
  densenet201: () => import('@/data/models/densenet201.json'),
  mobilenet: () => import('@/data/models/mobilenet.json'),
  mobilenetv2: () => import('@/data/models/mobilenetv2.json'),
  mobilenetv3small: () => import('@/data/models/mobilenetv3small.json'),
  mobilenetv3large: () => import('@/data/models/mobilenetv3large.json'),
  inceptionv3: () => import('@/data/models/inceptionv3.json'),
  inceptionresnetv2: () => import('@/data/models/inceptionresnetv2.json'),
  xception: () => import('@/data/models/xception.json'),
  efficientnetb0: () => import('@/data/models/efficientnetb0.json'),
  efficientnetb1: () => import('@/data/models/efficientnetb1.json'),
  efficientnetb2: () => import('@/data/models/efficientnetb2.json'),
  efficientnetb3: () => import('@/data/models/efficientnetb3.json'),
  efficientnetb4: () => import('@/data/models/efficientnetb4.json'),
  efficientnetb5: () => import('@/data/models/efficientnetb5.json'),
  efficientnetb6: () => import('@/data/models/efficientnetb6.json'),
  efficientnetb7: () => import('@/data/models/efficientnetb7.json'),
  nasnetmobile: () => import('@/data/models/nasnetmobile.json'),
  nasnetlarge: () => import('@/data/models/nasnetlarge.json'),
  vit: () => import('@/data/models/vit.json'),
  swin: () => import('@/data/models/swin.json'),
  convnext: () => import('@/data/models/convnext.json'),
  maxvit: () => import('@/data/models/maxvit.json'),
};

export default function ReceptiveFieldExplorer() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get('model');
  const [selectedModelId, setSelectedModelId] = useState(
    initialModel && modelLoaders[initialModel] ? initialModel : 'resnet50'
  );
  const [modelData, setModelData] = useState<NeuralNetworkModel | null>(null);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(-1);

  // Load selected model layers dynamically
  useEffect(() => {
    const loader = modelLoaders[selectedModelId];
    if (loader) {
      loader()
        .then((data) => {
          setModelData(data.default || data);
          setActiveLayerIndex(0);
        })
        .catch((err) => console.error('Failed to dynamically load model json:', err));
    }
  }, [selectedModelId]);

  // Derived loading state - true when modelData is null but we have a selected model
  const isLoading = modelData === null && selectedModelId !== '';

  // Calculate RF growth
  const rfData = useMemo(() => {
    if (!modelData?.architecture?.layers) return [];
    return calculateReceptiveFields(modelData.architecture.layers);
  }, [modelData]);

  // Filters only layers that have spatial operations (Conv, Pooling, Input) to keep display compact
  const spatialLayers = useMemo(() => {
    return rfData.filter((layer, idx) => {
      // Always include input, output, and spatial kernels
      return (
        idx === 0 ||
        layer.layerType === 'conv2d' ||
        layer.layerType === 'max_pooling2d' ||
        layer.layerType === 'average_pooling2d' ||
        idx === rfData.length - 1
      );
    });
  }, [rfData]);

  // Current active layer details
  const activeLayer = useMemo(() => {
    if (activeLayerIndex === -1 || spatialLayers.length === 0) return null;
    return spatialLayers[activeLayerIndex] || null;
  }, [spatialLayers, activeLayerIndex]);

  // Calculate percentage of 224x224 grid covered
  const coveragePercent = useMemo(() => {
    if (!activeLayer) return 0;
    const rf = activeLayer.effectiveRF;
    return Math.min(100, Math.round((rf / 224) * 100));
  }, [activeLayer]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24 overflow-x-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-cyan-500 z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-indigo-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9 w-full flex-1 flex flex-col gap-4 sm:gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border-b border-border/10 pb-4 sm:pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Compass className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              Receptive Field Explorer
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium max-w-2xl leading-snug mt-1">
              The Receptive Field (RF) represents the spatial area in the input image that influences a particular network unit. Watch it grow layer-by-layer.
            </p>
          </div>

          {/* Model Selector Dropdown */}
          <div className="min-w-[220px] w-full">
            <ModelSelectorDropdown
              models={getModelSummaries()}
              selectedModelId={selectedModelId}
              onSelect={(id) => setSelectedModelId(id)}
            />
          </div>
        </div>

        {/* Content Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT PANEL: Interactive Receptive Field Size Visualizer (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6">
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col items-center justify-center min-h-[400px]">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-6 self-start flex items-center gap-1.5">
                <Grid className="h-4 w-4 text-primary" />
                Input Space Projection (224x224 Grid)
              </span>

              {/* Grid Simulator Area */}
              <div className="relative w-full max-w-[300px] aspect-square rounded-xl bg-slate-950 border border-border/40 overflow-hidden shadow-inner flex items-center justify-center">
                {/* Simulated Grid Overlay lines */}
                <div className="absolute inset-0 grid grid-cols-14 grid-rows-14 opacity-[0.03]">
                  {Array.from({ length: 196 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-slate-200" />
                  ))}
                </div>

                {/* Central Target Circle */}
                <div className="absolute w-2 h-2 bg-primary rounded-full z-20 shadow-glow" />

                {/* Receptive Field Projection Box overlay */}
                <AnimatePresence mode="wait">
                  {activeLayer && (
                    <motion.div
                      key={`${selectedModelId}-${activeLayer.layerId}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: activeLayer.effectiveRF > 224 ? 0.3 : 0.15,
                        width: `${Math.min(100, (activeLayer.effectiveRF / 224) * 100)}%`,
                        height: `${Math.min(100, (activeLayer.effectiveRF / 224) * 100)}%`
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className={`absolute border-2 rounded-lg flex items-center justify-center pointer-events-none ${
                        activeLayer.effectiveRF > 224 
                          ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                          : 'border-primary bg-primary/20 shadow-glow'
                      }`}
                    >
                      {activeLayer.effectiveRF > 224 && (
                        <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest bg-slate-950/90 px-2 py-0.5 rounded border border-amber-500/40">
                          Out-of-Bounds ({Math.round((activeLayer.effectiveRF / 224) * 100)}% grid)
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Corner annotations showing boundary */}
                <span className="absolute bottom-2 left-3 text-[9px] font-bold text-slate-500">224px input size</span>
              </div>

              {/* Receptive Field Size Readout */}
              <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-border/10 pt-5 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Effective Receptive Field</span>
                  <span className="text-2xl font-black text-primary mt-1 block">
                    {activeLayer ? `${activeLayer.effectiveRF} × ${activeLayer.effectiveRF}` : '1 × 1'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">pixels</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Input Space Covered</span>
                  <span className={`text-2xl font-black mt-1 block ${activeLayer && activeLayer.effectiveRF > 224 ? 'text-amber-400' : 'text-slate-250'}`}>
                    {coveragePercent}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">of image height</span>
                </div>
              </div>
            </div>

            {/* Quick Educational Note */}
            <div className="bg-slate-900/20 border border-border/25 rounded-2xl p-5 backdrop-blur-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Info className="h-4 w-4 text-cyan-400" />
                How Receptive Field Grows
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Early convolutional layers look at small, local patches (e.g. edges, shapes). As signals flow through strided convolutions or pooling layers, the stride scales the size of subsequent layers&#39; kernels in the input space, causing the receptive field to expand exponentially.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Cumulative Stride & Layer Stack calculations (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-md flex flex-col h-auto md:h-[680px] lg:h-[760px] xl:h-[820px] overflow-hidden">
              {/* Controls Header */}
              <div className="flex items-center justify-between border-b border-border/10 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      Spatial Layer Stack Calculations
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Select a layer to inspect its mathematical receptive field expansion
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-slate-900 border border-border/20 px-2.5 py-1 rounded-full shrink-0">
                  {spatialLayers.length} spatial units
                </span>
              </div>

              <div className="grid flex-1 min-h-0 gap-4 grid-cols-1 md:grid-cols-12">
                {/* Table Container - Scrollable layer list with sticky header (7 cols on md+) */}
                <div className="md:col-span-7 flex min-h-0 flex-col rounded-xl bg-slate-950/50 border border-border/20 overflow-hidden h-[320px] sm:h-[360px] md:h-full">
                  <div className="flex-1 overflow-y-auto overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center py-20 gap-2">
                        <span className="text-xs text-primary font-extrabold uppercase tracking-widest animate-pulse">
                          Loading model layer details...
                        </span>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-md z-10 border-b border-border/20 shadow-sm">
                          <tr className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                            <th className="py-2.5 px-3.5">Layer Name</th>
                            <th className="py-2.5 px-2 text-center">Layer Type</th>
                            <th className="py-2.5 px-2 text-center">Kernel</th>
                            <th className="py-2.5 px-2 text-center">Stride</th>
                            <th className="py-2.5 px-3.5 text-right">Receptive Field</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-medium">
                          {spatialLayers.map((layer, index) => {
                            const isActive = activeLayerIndex === index;
                            return (
                              <tr
                                key={layer.layerId}
                                onClick={() => setActiveLayerIndex(index)}
                                className={`cursor-pointer transition-all duration-150 relative group ${
                                  isActive 
                                    ? 'bg-cyan-500/10 text-cyan-200 font-semibold shadow-[inset_0_0_12px_rgba(6,182,212,0.08)]' 
                                    : 'hover:bg-slate-900/40 text-slate-350 hover:text-white'
                                }`}
                              >
                                <td className="py-2.5 px-3.5 font-semibold flex items-center gap-2 relative">
                                  {/* Left active indicator line */}
                                  <div 
                                    className={`absolute left-0 top-1 bottom-1 w-1 rounded-r-full transition-colors duration-150 ${
                                      isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-transparent group-hover:bg-slate-700'
                                    }`} 
                                  />
                                  <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-150 shrink-0 ${isActive ? 'rotate-90 text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                  <span className="truncate">{layer.layerName}</span>
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                                    layer.layerType === 'conv2d' 
                                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                      : layer.layerType === 'max_pooling2d' || layer.layerType === 'average_pooling2d'
                                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                      : 'bg-slate-500/10 text-slate-350 border-slate-500/20'
                                  }`}>
                                    {layer.layerType.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                                  {layer.kernelSize ? `${layer.kernelSize[0]}×${layer.kernelSize[1]}` : '—'}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                                  {layer.strides ? `${layer.strides[0]}×${layer.strides[1]}` : '—'}
                                </td>
                                <td className={`py-2.5 px-3.5 text-right font-mono font-bold tabular-nums ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                                  {layer.effectiveRF} <span className="text-[10px] font-normal text-slate-400">px</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Mathematical Breakdown (5 cols on md+) */}
                <div className="md:col-span-5 flex min-h-0 flex-col h-auto md:h-full">
                  {activeLayer ? (
                    <div className="h-full rounded-xl border border-border/20 bg-slate-900/80 p-4 text-xs text-slate-300 leading-relaxed font-medium space-y-3 backdrop-blur-md shadow-md flex flex-col justify-between overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/10 pb-2">
                          <span className="text-xs text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 text-cyan-400" />
                            Mathematical Breakdown
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                          <span className="bg-slate-950/80 border border-border/30 text-slate-350 px-2 py-1 rounded-md flex-1 text-center">
                            Layer Stride: <strong className="text-cyan-300 font-bold">{activeLayer.strides ? activeLayer.strides[0] : 1}</strong>
                          </span>
                          <span className="bg-slate-950/80 border border-border/30 text-slate-350 px-2 py-1 rounded-md flex-1 text-center">
                            Cumulative Stride: <strong className="text-cyan-300 font-bold">{activeLayer.effectiveStride}</strong>
                          </span>
                        </div>

                        <p className="text-slate-300 text-xs leading-snug">
                          Receptive Field size at layer <strong className="text-white font-semibold">{activeLayer.layerName}</strong> grows using the recurrence equation:
                        </p>

                        <MathFormula 
                          formula="RF_l = RF_{l-1} + (k_l - 1) \times S_{l-1}" 
                          className="my-1.5 py-2 border-cyan-500/20 bg-slate-950/90 shadow-inner text-cyan-300 font-mono text-xs sm:text-sm"
                        />
                      </div>

                      {activeLayer.kernelSize ? (
                        <div className="bg-slate-950/60 px-3 py-2.5 rounded-lg border border-border/20 font-mono text-[11px] sm:text-xs text-slate-300 flex items-center gap-2 mt-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>
                            Substituted: <strong className="text-cyan-300 font-bold">{activeLayer.effectiveRF}</strong> = (Previous RF) + ({activeLayer.kernelSize[0]} - 1) × {activeLayer.effectiveStride / (activeLayer.strides ? activeLayer.strides[0] : 1)}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-slate-950/60 px-3 py-2.5 rounded-lg border border-border/20 font-mono text-[11px] sm:text-xs text-slate-400 flex items-center gap-2 mt-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                          <span>Initial input layer representation. Receptive field starts at 1 px.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full rounded-xl border border-border/20 bg-slate-900/60 p-4 text-xs text-slate-400 backdrop-blur-md flex items-center justify-center">
                      Select a spatial unit to view the breakdown.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning section */}
        <ContinueLearning
          items={[
            { title: 'Training Dynamics Simulator', type: 'concept', href: '/concepts/training-dynamics', description: 'Simulate backpropagation gradient flows.' },
            { title: 'Depthwise Separable Pattern', type: 'pattern', href: '/architecture-patterns?pattern=depthwise', description: 'Learn how MobileNet & Xception optimize spatial filters.' },
            { title: 'ResNet-50 Explorer', type: 'model', href: '/models/resnet50', description: 'Inspect full 50-layer architecture topology.' },
            { title: 'Evolution Timeline', type: 'evolution', href: '/evolution', description: 'Trace milestone breakthroughs from 1998 to 2022.' },
            { title: 'Compare Key Architectures', type: 'compare', href: '/compare?models=resnet50,densenet121,mobilenet', description: 'Side-by-side comparison of depth vs accuracy.' }
          ]}
        />
      </section>
    </div>
  );
}
