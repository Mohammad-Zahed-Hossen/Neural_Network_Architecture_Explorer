'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Info, Sliders, Play, Layers, 
  HelpCircle, ChevronRight, Eye, Grid
} from 'lucide-react';
import Link from 'next/link';
import modelsSummary from '@/data/models.json';
import { calculateReceptiveFields, LayerRFInfo } from '@/lib/utils/rf-math';

// Code-split dynamic loaders for all 28 models' detailed configurations
const modelLoaders: Record<string, () => Promise<any>> = {
  lenet: () => import('@/lib/data/lenet.json'),
  alexnet: () => import('@/lib/data/alexnet.json'),
  vgg16: () => import('@/lib/data/vgg16.json'),
  vgg19: () => import('@/lib/data/vgg19.json'),
  resnet50: () => import('@/lib/data/resnet50.json'),
  resnet101: () => import('@/lib/data/resnet101.json'),
  resnet152: () => import('@/lib/data/resnet152.json'),
  resnet50v2: () => import('@/lib/data/resnet50v2.json'),
  resnet101v2: () => import('@/lib/data/resnet101v2.json'),
  resnet152v2: () => import('@/lib/data/resnet152v2.json'),
  densenet121: () => import('@/lib/data/densenet121.json'),
  densenet169: () => import('@/lib/data/densenet169.json'),
  densenet201: () => import('@/lib/data/densenet201.json'),
  mobilenet: () => import('@/lib/data/mobilenet.json'),
  mobilenetv2: () => import('@/lib/data/mobilenetv2.json'),
  mobilenetv3small: () => import('@/lib/data/mobilenetv3small.json'),
  mobilenetv3large: () => import('@/lib/data/mobilenetv3large.json'),
  inceptionv3: () => import('@/lib/data/inceptionv3.json'),
  inceptionresnetv2: () => import('@/lib/data/inceptionresnetv2.json'),
  xception: () => import('@/lib/data/xception.json'),
  efficientnetb0: () => import('@/lib/data/efficientnetb0.json'),
  efficientnetb1: () => import('@/lib/data/efficientnetb1.json'),
  efficientnetb2: () => import('@/lib/data/efficientnetb2.json'),
  efficientnetb3: () => import('@/lib/data/efficientnetb3.json'),
  efficientnetb4: () => import('@/lib/data/efficientnetb4.json'),
  efficientnetb5: () => import('@/lib/data/efficientnetb5.json'),
  efficientnetb6: () => import('@/lib/data/efficientnetb6.json'),
  efficientnetb7: () => import('@/lib/data/efficientnetb7.json'),
  nasnetmobile: () => import('@/lib/data/nasnetmobile.json'),
  nasnetlarge: () => import('@/lib/data/nasnetlarge.json'),
  vit: () => import('@/lib/data/vit.json'),
  swin: () => import('@/lib/data/swintransformer.json'),
  convnext: () => import('@/lib/data/convnext.json'),
  maxvit: () => import('@/lib/data/maxvit.json'),
};

export default function ReceptiveFieldExplorer() {
  const [selectedModelId, setSelectedModelId] = useState('resnet50');
  const [modelData, setModelData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(-1);
  const [showDetailedInfo, setShowDetailedInfo] = useState(true);

  // Load selected model layers dynamically
  useEffect(() => {
    setIsLoading(true);
    const loader = modelLoaders[selectedModelId];
    if (loader) {
      loader()
        .then((data) => {
          setModelData(data.default || data);
          setActiveLayerIndex(0);
        })
        .catch((err) => console.error('Failed to dynamically load model json:', err))
        .finally(() => setIsLoading(false));
    }
  }, [selectedModelId]);

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
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24">
      {/* Glow backgrounds */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-cyan-500 z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-indigo-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Compass className="h-8 w-8 text-primary" />
              Receptive Field Explorer
            </h1>
            <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed mt-1">
              The Receptive Field (RF) represents the spatial area in the input image that influences a particular network unit. Watch it grow layer-by-layer.
            </p>
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Select Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="bg-slate-900 border border-border/30 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-primary/50 transition-all select-glow cursor-pointer"
            >
              {modelsSummary.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT PANEL: Interactive Receptive Field Size Visualizer (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
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
                        opacity: 0.15,
                        width: `${Math.min(100, (activeLayer.effectiveRF / 224) * 100)}%`,
                        height: `${Math.min(100, (activeLayer.effectiveRF / 224) * 100)}%`
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="absolute border-2 border-primary bg-primary/20 rounded-lg flex items-center justify-center pointer-events-none"
                    />
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
                  <span className="text-2xl font-black text-slate-250 mt-1 block">
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
                Early convolutional layers look at small, local patches (e.g. edges, shapes). As signals flow through strided convolutions or pooling layers, the stride scales the size of subsequent layers' kernels in the input space, causing the receptive field to expand exponentially.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Cumulative Stride & Layer Stack calculations (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex-1 flex flex-col max-h-[570px]">
              
              {/* Controls Header */}
              <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4 shrink-0">
                <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-primary" />
                  Spatial Layer Stack Calculations
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                  {spatialLayers.length} spatial units
                </span>
              </div>

              {/* Table Body - Scrollable */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center py-20">
                    <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest animate-pulse">Loading model layer details...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[10px] text-slate-500 uppercase font-extrabold border-b border-border/10 pb-2">
                        <th className="py-2">Layer Name</th>
                        <th className="py-2 text-center">Layer Type</th>
                        <th className="py-2 text-center">Kernel</th>
                        <th className="py-2 text-center">Stride</th>
                        <th className="py-2 text-right">Receptive Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                      {spatialLayers.map((layer, index) => {
                        const isActive = activeLayerIndex === index;
                        return (
                          <tr
                            key={layer.layerId}
                            onClick={() => setActiveLayerIndex(index)}
                            className={`cursor-pointer transition-colors duration-200 group ${
                              isActive ? 'bg-primary/5 text-primary' : 'hover:bg-slate-900/20 text-slate-350 hover:text-white'
                            }`}
                          >
                            <td className="py-3.5 font-bold flex items-center gap-1.5 pl-2">
                              <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? 'rotate-90 text-primary' : 'text-slate-600 group-hover:text-slate-400'}`} />
                              {layer.layerName}
                            </td>
                            <td className="py-3.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                                layer.layerType === 'conv2d' 
                                  ? 'bg-blue-500/5 text-blue-400 border-blue-500/10'
                                  : layer.layerType === 'max_pooling2d' || layer.layerType === 'average_pooling2d'
                                  ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                                  : 'bg-slate-500/5 text-slate-400 border-slate-500/10'
                              }`}>
                                {layer.layerType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 text-center font-semibold">
                              {layer.kernelSize ? `${layer.kernelSize[0]}x${layer.kernelSize[1]}` : '—'}
                            </td>
                            <td className="py-3.5 text-center font-semibold">
                              {layer.strides ? `${layer.strides[0]}x${layer.strides[1]}` : '—'}
                            </td>
                            <td className="py-3.5 text-right font-black pr-2">
                              {layer.effectiveRF} px
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Formula & Explanation details box at bottom */}
              {activeLayer && (
                <div className="mt-4 bg-slate-950 border border-border/30 rounded-xl p-4 shrink-0 text-xs text-slate-400 leading-relaxed font-medium">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      Mathematical Breakdown
                    </span>
                    <span className="text-[9px] text-primary font-bold">
                      Layer Stride: {activeLayer.strides ? activeLayer.strides[0] : 1} | Cumulative Stride: {activeLayer.effectiveStride}
                    </span>
                  </div>
                  <p>
                    Receptive Field size at layer <strong className="text-white">{activeLayer.layerName}</strong> grows using the recurrence equation:
                  </p>
                  <div className="my-2 bg-slate-900 border border-border/10 py-2.5 rounded-lg text-center font-mono text-xs text-primary font-bold">
                    RF = RF_prev + (k_size - 1) × Stride_prev
                  </div>
                  {activeLayer.kernelSize ? (
                    <p className="text-slate-350">
                      Specifically: <strong className="text-white">{activeLayer.effectiveRF}</strong> = (Previous RF) + ({activeLayer.kernelSize[0]} - 1) × {activeLayer.effectiveStride / (activeLayer.strides ? activeLayer.strides[0] : 1)} (Previous Stride).
                    </p>
                  ) : (
                    <p className="text-slate-350">Initial input layer representation. Receptive field starts at 1.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
