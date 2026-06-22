'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Play, Zap, ArrowRight, Layers, GraduationCap, Cpu, Award } from 'lucide-react';
import Link from 'next/link';
import ModelCard from '@/components/model-catalog/model-card';
import modelsSummary from '@/data/models.json';

// We map our JSON models to match the ModelMetadata type
const modelsData = modelsSummary.map(m => ({
  ...m,
  totalParameters: m.params,
  totalFLOPs: m.flops,
  top1Accuracy: m.top1 / 100,
  top5Accuracy: m.top5 / 100,
  memoryUsage: m.memory_mb,
  releaseYear: m.releaseYear,
  paperYear: m.year,
  depth: m.depth,
  colorTheme: m.colorTheme,
})) as any[];

export default function Home() {
  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalParams = modelsData.reduce((sum, m) => sum + m.totalParameters, 0);
    const avgAccuracy = modelsData.length > 0
      ? Math.round((modelsData.reduce((sum, m) => sum + m.top1Accuracy, 0) / modelsData.length) * 100)
      : 0;

    return {
      modelCount: modelsData.length,
      totalParams,
      avgAccuracy,
    };
  }, []);

  // Featured models: Grab 4 models (e.g. VGG16, ResNet50, DenseNet121, MobileNet)
  const featuredModels = useMemo(() => {
    const ids = ['vgg16', 'resnet50', 'densenet121', 'mobilenet'];
    return modelsData.filter(m => ids.includes(m.id));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-12">
      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center lg:pt-24 lg:pb-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Tagline Badge */}
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Learning Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Neural Network <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Architecture Explorer
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed"
          >
            Explore {stats.modelCount}+ classic and modern CNNs. Inspect architectures, compute parameters, visualize layer connections, and compare models across key metrics.
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full"
          >
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/20 bg-slate-900/10 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
                <Layers className="h-4 w-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">{stats.modelCount}</p>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Models Catalog</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/20 bg-slate-900/10 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <Cpu className="h-4 w-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">{(stats.totalParams / 1000000000).toFixed(1)}B</p>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Total Params</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/20 bg-slate-900/10 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
                <Award className="h-4 w-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">{stats.avgAccuracy}%</p>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Avg Accuracy</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary border border-primary/20 rounded-xl text-sm font-semibold text-white hover:bg-primary/95 transition-all shadow-md"
            >
              <Play className="h-4 w-4" />
              Explore Full Catalog
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-border/30 rounded-xl text-sm font-semibold text-slate-350 hover:bg-slate-800/70 hover:text-white transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Compare Models
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Architectures Spotlight */}
      <section className="relative z-10 border-y border-border/20 bg-slate-950/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Featured Architectures
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Foundational and modern benchmarks.</p>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-semibold text-primary hover:text-blue-300 transition-colors flex items-center gap-1 group"
            >
              <span>View full catalog</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredModels.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Core Concepts Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">How it Works</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            NeuralExplorer retrieves layers and connectivity graphs directly from offline-extracted Keras models.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mt-8">
            <div className="bg-slate-900/10 border border-border/20 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300">
              <span className="text-xs text-primary font-extrabold uppercase tracking-wider block mb-2">01 / Examine Layouts</span>
              <p className="text-xs text-slate-450 leading-relaxed font-medium">
                Select a model to inspect layer shapes, strides, padding options, and total parameter counts.
              </p>
            </div>
            <div className="bg-slate-900/10 border border-border/20 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300">
              <span className="text-xs text-primary font-extrabold uppercase tracking-wider block mb-2">02 / Parameter Math</span>
              <p className="text-xs text-slate-450 leading-relaxed font-medium">
                Use the interactive calculators to step through exact weight and bias algebraic formulas.
              </p>
            </div>
            <div className="bg-slate-900/10 border border-border/20 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300">
              <span className="text-xs text-primary font-extrabold uppercase tracking-wider block mb-2">03 / Benchmarking</span>
              <p className="text-xs text-slate-450 leading-relaxed font-medium">
                Compare networks side-by-side to analyze accuracy vs. parameter size, depth, memory, and FLOPs.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-blue-300 transition-colors border-b border-primary/25 pb-0.5"
            >
              Learn standard deep learning paths
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
