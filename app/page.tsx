'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Play, Zap, ArrowRight, Layers, Cpu, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ModelCard from '@/components/model-catalog/model-card';
import { getModelSummaries } from '@/lib/data-access/models';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';

const modelsData = getModelSummaries();

export default function Home() {
  const shouldReduceMotion = useReducedMotionPreference();

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
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6 text-center sm:pt-12 sm:pb-8 lg:pt-16 lg:pb-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Tagline Badge */}
          <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Learning Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="max-w-4xl text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Neural Network <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Architecture Explorer
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed"
          >
            Explore {stats.modelCount}+ classic and modern CNNs. Inspect architectures, compute parameters, visualize layer connections, and compare models across key metrics.
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl w-full"
          >
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl border border-border/20 bg-slate-900/10 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1 sm:mb-2">
                <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-black text-white">{stats.modelCount}</p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Models Catalog</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl border border-border/20 bg-slate-900/10 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1 sm:mb-2">
                <Cpu className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-black text-white">{(stats.totalParams / 1000000000).toFixed(1)}B</p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Total Params</p>
            </div>

            <div className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl border border-border/20 bg-slate-900/10 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1 sm:mb-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-black text-white">{stats.avgAccuracy}%</p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Avg Accuracy</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#22d3ee] border border-cyan-400/30 rounded-xl text-xs sm:text-sm font-extrabold text-[#020617] hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/10 uppercase tracking-wider"
            >
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Start Guided Learning
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-slate-800/80 border border-border/40 rounded-xl text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all"
            >
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22d3ee]" />
              Explore Full Catalog
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-slate-900/50 border border-border/30 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Compare Models
            </Link>
          </motion.div>

          {/* Quick Educational Shortcuts */}
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            <Link href="/architecture-patterns" className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-[#22d3ee] bg-slate-900/60 border border-border/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
              <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-400" /> Design Patterns
            </Link>
            <Link href="/research-map" className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-[#22d3ee] bg-slate-900/60 border border-border/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
              <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-400" /> Research Map DAG
            </Link>
            <Link href="/evolution" className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-[#22d3ee] bg-slate-900/60 border border-border/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
              <Layers className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" /> Evolution Timeline
            </Link>
            <Link href="/concepts/receptive-field" className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-[#22d3ee] bg-slate-900/60 border border-border/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-400" /> Receptive Field Calculator
            </Link>
            <Link href="/concepts/training-dynamics" className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-[#22d3ee] bg-slate-900/60 border border-border/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
              <BarChart3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" /> Training Dynamics
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Architectures Spotlight */}
      <section className="relative z-10 border-y border-border/20 bg-slate-950/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                Featured Architectures
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Foundational and modern benchmarks.</p>
            </div>
            <Link
              href="/catalog"
              className="text-[10px] sm:text-xs font-semibold text-primary hover:text-blue-300 transition-colors flex items-center gap-1 group"
            >
              <span>View full catalog</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredModels.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Core Concepts Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">How it Works</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            NeuralExplorer retrieves layers and connectivity graphs directly from offline-extracted Keras models.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 text-left mt-6 sm:mt-8">
            <div className="bg-slate-900/10 border border-border/20 rounded-2xl p-3 sm:p-5 hover:border-primary/20 transition-all duration-300">
              <span className="text-[10px] sm:text-xs text-primary font-extrabold uppercase tracking-wider block mb-1.5 sm:mb-2">01 / Examine Layouts</span>
              <p className="text-[10px] sm:text-xs text-slate-450 leading-relaxed font-medium">
                Select a model to inspect layer shapes, strides, padding options, and total parameter counts.
              </p>
            </div>
            <div className="bg-slate-900/10 border border-border/20 rounded-2xl p-3 sm:p-5 hover:border-primary/20 transition-all duration-300">
              <span className="text-[10px] sm:text-xs text-primary font-extrabold uppercase tracking-wider block mb-1.5 sm:mb-2">02 / Parameter Math</span>
              <p className="text-[10px] sm:text-xs text-slate-450 leading-relaxed font-medium">
                Use the interactive calculators to step through exact weight and bias algebraic formulas.
              </p>
            </div>
            <div className="bg-slate-900/10 border border-border/20 rounded-2xl p-3 sm:p-5 hover:border-primary/20 transition-all duration-300">
              <span className="text-[10px] sm:text-xs text-primary font-extrabold uppercase tracking-wider block mb-1.5 sm:mb-2">03 / Benchmarking</span>
              <p className="text-[10px] sm:text-xs text-slate-450 leading-relaxed font-medium">
                Compare networks side-by-side to analyze accuracy vs. parameter size, depth, memory, and FLOPs.
              </p>
            </div>
          </div>

          <div className="pt-4 sm:pt-6">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-primary hover:text-blue-300 transition-colors border-b border-primary/25 pb-0.5"
            >
              Learn standard deep learning paths
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
