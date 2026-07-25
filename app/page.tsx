'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  BarChart3,
  Play,
  Zap,
  ArrowRight,
  Layers,
  Cpu,
  Award,
  BookOpen,
  GitCommit,
  FileText,
  Network,
  Compass,
  GraduationCap,
  Lightbulb,
  Workflow,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

import ModelCard from '@/components/model-catalog/model-card';
import ContinueLearning from '@/components/ui/continue-learning';
import { getModelSummaries } from '@/lib/data-access/models';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import { searchEntities } from '@/lib/search/search-engine';
import { SearchableEntity, EntityType } from '@/lib/search/types';
import {
  enrichModelEntity,
  enrichPaperEntity,
  enrichEvolutionEntity,
} from '@/lib/search/metadata-enrichment';

import papersData from '@/data/papers.json';
import evolutionData from '@/data/evolution.json';

const modelsData = getModelSummaries();

export default function Home() {
  const shouldReduceMotion = useReducedMotionPreference();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate dynamic statistics from canonical datasets
  const stats = useMemo(() => {
    const totalParams = modelsData.reduce((sum, m) => sum + m.totalParameters, 0);
    const totalDepth = modelsData.reduce((sum, m) => sum + m.depth, 0);
    const avgAccuracy =
      modelsData.length > 0
        ? Math.round(
            (modelsData.reduce((sum, m) => sum + m.top1Accuracy, 0) / modelsData.length) * 100
          )
        : 0;

    return {
      modelCount: modelsData.length,
      paperCount: papersData.length,
      timelineCount: evolutionData.length,
      totalParams,
      totalDepth,
      avgAccuracy,
    };
  }, []);

  // 2. Build Universal Search Index across all entity types
  const universalSearchEntities = useMemo<SearchableEntity[]>(() => {
    const modelEntities = modelsData.map(enrichModelEntity);
    const paperEntities = papersData.map(enrichPaperEntity);
    const evolutionEntities = evolutionData.map(enrichEvolutionEntity);

    const patternEntities: SearchableEntity[] = [
      {
        id: 'pattern-residual',
        type: 'pattern',
        title: 'Residual Connections (Skip Mappings)',
        subtitle: 'Bypasses weight layers with identity mappings H(x) = F(x) + x',
        description: 'Pioneered by ResNet to eliminate vanishing gradients in deep networks.',
        url: '/architecture-patterns?pattern=residual',
        aliases: ['residual', 'skip connection', 'shortcut', 'resnet block'],
        keywords: ['residual', 'skip', 'shortcut', 'resnet', 'identity'],
        patterns: ['residual'],
        components: ['skip connection'],
        applications: ['general'],
      },
      {
        id: 'pattern-dense',
        type: 'pattern',
        title: 'Dense Connectivity (Feature Concatenation)',
        subtitle: 'Connects all preceding layers to all subsequent layers',
        description: 'Maximizes feature reuse and channel efficiency as seen in DenseNet.',
        url: '/architecture-patterns?pattern=dense',
        aliases: ['dense', 'concatenation', 'densenet block'],
        keywords: ['dense', 'concatenation', 'densenet', 'feature reuse'],
        patterns: ['dense'],
        components: ['concatenate'],
        applications: ['research'],
      },
      {
        id: 'pattern-depthwise',
        type: 'pattern',
        title: 'Depthwise Separable Convolutions',
        subtitle: 'Splits spatial filtering and channel mixing for 80%+ FLOP savings',
        description: 'Core building block of MobileNet and EfficientNet architectures.',
        url: '/architecture-patterns?pattern=depthwise',
        aliases: ['depthwise', 'separable conv', 'mbconv'],
        keywords: ['depthwise', 'separable', 'mobilenet', 'edge', 'efficiency'],
        patterns: ['depthwise'],
        components: ['depthwise conv', 'pointwise conv'],
        applications: ['mobile', 'edge'],
      },
      {
        id: 'pattern-compound',
        type: 'pattern',
        title: 'Compound Scaling',
        subtitle: 'Jointly scales network width, depth, and input resolution',
        description: 'Mathematical compound coefficient scaling introduced by EfficientNet.',
        url: '/architecture-patterns?pattern=compound',
        aliases: ['compound scaling', 'efficientnet scaling'],
        keywords: ['compound', 'scaling', 'efficientnet', 'resolution', 'width', 'depth'],
        patterns: ['compound'],
        components: ['compound scaling'],
        applications: ['server', 'mobile'],
      },
      {
        id: 'pattern-attention',
        type: 'pattern',
        title: 'Self-Attention & Windowing',
        subtitle: 'Global and shifted-window patch interaction mechanisms',
        description: 'Used in Vision Transformers (ViT) and Swin Transformer.',
        url: '/architecture-patterns?pattern=attention',
        aliases: ['attention', 'transformer', 'vit', 'swin', 'self-attention'],
        keywords: ['attention', 'vit', 'swin', 'transformer', 'patch'],
        patterns: ['attention'],
        components: ['attention', 'patch embedding'],
        applications: ['server', 'research'],
      },
    ];

    const conceptEntities: SearchableEntity[] = [
      {
        id: 'concept-receptive-field',
        type: 'concept',
        title: 'Receptive Field Calculator',
        subtitle: 'Interactive calculation of spatial context expansion',
        description: 'Track how kernel sizes, strides, and dilation increase theoretical field size.',
        url: '/concepts/receptive-field',
        aliases: ['receptive field', 'theoretical receptive field', 'spatial coverage'],
        keywords: ['receptive', 'field', 'stride', 'kernel', 'dilation'],
        patterns: [],
        components: [],
        applications: ['learning'],
      },
      {
        id: 'concept-training-dynamics',
        type: 'concept',
        title: 'Training Dynamics Visualizer',
        subtitle: 'Simulate vanishing gradients, explosion, and residual stability',
        description: 'Interactive backpropagation step-through across plain vs residual networks.',
        url: '/concepts/training-dynamics',
        aliases: ['training dynamics', 'vanishing gradient', 'gradient flow', 'backpropagation'],
        keywords: ['training', 'gradient', 'vanishing', 'backprop', 'stability'],
        patterns: [],
        components: [],
        applications: ['learning'],
      },
    ];

    const learnEntities: SearchableEntity[] = [
      {
        id: 'learn-paths',
        type: 'learn',
        title: 'Guided Learning Roadmaps',
        subtitle: 'Structured curricula from CNN basics to Vision Transformers',
        description: 'Step-by-step educational paths for beginners, intermediate, and advanced engineers.',
        url: '/learn?tab=paths',
        aliases: ['learn', 'roadmaps', 'curriculum', 'tutorials'],
        keywords: ['learn', 'study', 'roadmap', 'beginner', 'advanced'],
        patterns: [],
        components: [],
        applications: ['learning'],
      },
      {
        id: 'learn-advisor',
        type: 'learn',
        title: 'Hardware Model Advisor',
        subtitle: 'Find ideal models tailored to target deployment constraints',
        description: 'Select VRAM, latency limits, and task requirements to receive model picks.',
        url: '/learn?tab=advisor',
        aliases: ['advisor', 'hardware advisor', 'recommendation'],
        keywords: ['advisor', 'hardware', 'vram', 'latency', 'recommend'],
        patterns: [],
        components: [],
        applications: ['learning', 'edge', 'server'],
      },
      {
        id: 'learn-research-map',
        type: 'learn',
        title: 'Research Lineage DAG Map',
        subtitle: 'Interactive dependency DAG connecting landmark papers',
        description: 'Visualize citation lineage and architectural evolution across papers.',
        url: '/research-map',
        aliases: ['research map', 'dag', 'lineage', 'citation network'],
        keywords: ['research', 'map', 'dag', 'lineage', 'citation'],
        patterns: [],
        components: [],
        applications: ['research'],
      },
    ];

    return [
      ...modelEntities,
      ...paperEntities,
      ...evolutionEntities,
      ...patternEntities,
      ...conceptEntities,
      ...learnEntities,
    ];
  }, []);

  // 3. Filter Universal Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchEntities(universalSearchEntities, { searchQuery }, (item) => item).slice(0, 7);
  }, [universalSearchEntities, searchQuery]);

  // 4. Feature representative architectures across distinct families
  const featuredModels = useMemo(() => {
    const representativeIds = [
      'vgg16',          // Foundational Homogeneous
      'resnet50',       // Residual Landmark
      'densenet121',    // Dense Connectivity
      'mobilenetv2',    // Mobile Inverted Bottleneck
      'efficientnetb0', // Compound Scaling
      'vit',            // Vision Transformer
      'convnext',       // Modern 2020s CNN
    ];
    return modelsData.filter((m) => representativeIds.includes(m.id));
  }, []);

  // 5. Curated Spotlight Paper
  const spotlightPaper = useMemo(() => {
    return (
      papersData.find((p) => p.id === 'resnet') ||
      papersData[0]
    );
  }, []);

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const typeIconMap: Record<EntityType, typeof Layers> = {
    model: Layers,
    paper: FileText,
    pattern: GitCommit,
    concept: Compass,
    evolution: Network,
    learn: GraduationCap,
  };

  const typeBadgeMap: Record<EntityType, string> = {
    model: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    paper: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    pattern: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    concept: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    evolution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    learn: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-12 overflow-x-hidden">
      {/* SECTION 1: Compact Hero (20-25% height) */}
      <section aria-label="Mission Control Hero" className="relative z-20 border-b border-border/20 bg-slate-950/40 py-5 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center"
          >
            {/* Tagline Badge */}
            <motion.div variants={itemVariants} className="mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-[10px] sm:text-xs font-extrabold tracking-wider text-cyan-400 uppercase">
                <Sparkles className="h-3 w-3" />
                Mission Control & Knowledge Hub
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight text-white"
            >
              Neural Network Architecture Explorer
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-1.5 max-w-3xl text-[11px] sm:text-xs lg:text-sm text-slate-400 font-medium leading-relaxed"
            >
              Interactive engineering platform for inspectable CNNs, Vision Transformers, parameter formulas, research paper lineage, and hardware execution trade-offs.
            </motion.p>

            {/* Primary & Secondary Action CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            >
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-cyan-400 border border-cyan-300 rounded-xl text-xs font-black text-slate-950 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/10 uppercase tracking-wider"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Start Guided Learning
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-900 border border-border/40 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-all"
              >
                <Play className="h-3.5 w-3.5 text-cyan-400" />
                Explore Catalog ({stats.modelCount})
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border border-border/30 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
              >
                <BarChart3 className="h-3.5 w-3.5 text-rose-400" />
                Compare Models
              </Link>
              <Link
                href="/research-map"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border border-border/30 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
              >
                <Network className="h-3.5 w-3.5 text-purple-400" />
                Research Map DAG
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Universal Search Bar (Primary Interaction) */}
      <section aria-label="Universal Search Engine" className="relative z-30 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="relative">
          <div className="relative flex items-center shadow-2xl rounded-2xl">
            <Search className="absolute left-4 h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search across all 34 models, 18 research papers, architecture patterns, concepts, and timeline events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
              aria-label="Universal Search input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Universal Search Instant Results Popup */}
          <AnimatePresence>
            {searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full mt-2 bg-[#020617] border border-cyan-500/30 rounded-2xl p-3 shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-border/20">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    Universal Search Results ({searchResults.length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Press Esc or click to navigate</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching architectures, papers, or concepts found for &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {searchResults.map((result) => {
                      const entity = result.item;
                      const IconComp = typeIconMap[entity.type] || Compass;
                      const badgeStyle = typeBadgeMap[entity.type] || typeBadgeMap.concept;

                      return (
                        <Link
                          key={`${entity.type}-${entity.id}`}
                          href={entity.url}
                          onClick={() => setSearchQuery('')}
                          className="flex items-start justify-between p-2.5 rounded-xl border border-border/10 bg-slate-900/40 hover:bg-slate-900 hover:border-cyan-500/30 transition-all group"
                        >
                          <div className="flex items-start gap-2.5 pr-2">
                            <span className={`mt-0.5 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badgeStyle}`}>
                              <IconComp className="h-2.5 w-2.5" />
                              {entity.type}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                {entity.title}
                                {entity.year && (
                                  <span className="text-[10px] font-semibold text-slate-500">({entity.year})</span>
                                )}
                              </div>
                              {entity.subtitle && (
                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                  {entity.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION 3: Continue Learning (Reused Component) */}
      <section aria-label="Continue Learning Section" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ContinueLearning
          title="Resume Exploration & Recommended Next Steps"
          items={[
            {
              title: 'AlexNet (2012 Breakthrough)',
              type: 'model',
              href: '/models/alexnet',
              description: 'Inspect the first GPU-accelerated CNN that won ImageNet.',
            },
            {
              title: 'Receptive Field Calculator',
              type: 'concept',
              href: '/concepts/receptive-field',
              description: 'Calculate spatial coverage equations across Conv layers.',
            },
            {
              title: 'ResNet Skip Connections',
              type: 'pattern',
              href: '/architecture-patterns?pattern=residual',
              description: 'Master skip connection identity mappings H(x) = F(x) + x.',
            },
            {
              title: 'Hardware Model Advisor',
              type: 'learn',
              href: '/learn?tab=advisor',
              description: 'Filter 34 models by target hardware VRAM and latency.',
            },
            {
              title: 'Citation Lineage DAG Map',
              type: 'paper',
              href: '/research-map',
              description: 'Explore the landmark paper DAG dependency graph.',
            },
          ]}
        />
      </section>

      {/* SECTION 4: Knowledge Hub (Dense Feature Cards Grid) */}
      <section aria-label="Knowledge Hub" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-border/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              Knowledge Hub & Exploration Centers
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Central Navigation Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Architecture Patterns */}
          <Link
            href="/architecture-patterns"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <GitCommit className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  6 Core Patterns
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Architecture Patterns
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Residual, Dense, Depthwise, Compound Scaling, NAS, and Self-Attention block blueprints.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span>Inspect Motifs</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Research Papers */}
          <Link
            href="/papers"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {stats.paperCount} Research Papers
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Research Papers Catalog
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Landmark papers from 1998 LeNet to Vision Transformers with contributions and limitations.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-purple-400">
              <span>Read Papers</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Evolution Timeline */}
          <Link
            href="/evolution"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Clock className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {stats.timelineCount} Epoch Milestones
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Evolution Timeline
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Chronological deep learning breakthroughs from 1998 to 2022 modern ConvNets.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span>Trace History</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Research Map DAG */}
          <Link
            href="/research-map"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Network className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Citation Lineage
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                Research Map DAG
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Interactive citation DAG network connecting papers, predecessors, and influence nodes.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-cyan-400">
              <span>Explore DAG Graph</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Concept Explorer */}
          <Link
            href="/concepts/receptive-field"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Visualizers
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                Concept Explorer
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Interactive calculators for receptive field growth, vanishing gradients, and residual stability.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-indigo-400">
              <span>Open Visualizer</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Learning Paths */}
          <Link
            href="/learn?tab=paths"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-blue-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Structured Curricula
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Guided Learning Paths
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Follow beginner feedforward, residual revolution, and dense feature reuse study paths.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-blue-400">
              <span>Start Learning</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 7: Model Advisor */}
          <Link
            href="/learn?tab=advisor"
            className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-rose-500/40 transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1 xl:col-span-2"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <Award className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Target Matcher
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                Hardware Model Advisor
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                Input your hardware specs (VRAM, memory constraints, edge vs cloud deployment) to receive tailored architecture recommendations.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-rose-400">
              <span>Match Hardware</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 5: Quick Statistics Strip (Compact Row) */}
      <section aria-label="Quick Platform Statistics" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 p-3 rounded-2xl border border-border/30 bg-slate-950/60 backdrop-blur-md">
          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/20 bg-slate-900/20">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Architectures</span>
            <span className="text-lg sm:text-xl font-black text-white mt-0.5">{stats.modelCount}</span>
            <span className="text-[9px] text-slate-500 font-semibold">Inspectable Models</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/20 bg-slate-900/20">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Research Papers</span>
            <span className="text-lg sm:text-xl font-black text-purple-400 mt-0.5">{stats.paperCount}</span>
            <span className="text-[9px] text-slate-500 font-semibold">Landmark Publications</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/20 bg-slate-900/20">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Parameters</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
              {(stats.totalParams / 1000000000).toFixed(2)}B
            </span>
            <span className="text-[9px] text-slate-500 font-semibold">Sum Across Catalog</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/20 bg-slate-900/20">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Network Depth</span>
            <span className="text-lg sm:text-xl font-black text-cyan-400 mt-0.5">{stats.totalDepth.toLocaleString()}</span>
            <span className="text-[9px] text-slate-500 font-semibold">Layer Depth Sum</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/20 bg-slate-900/20 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Avg ImageNet Top-1</span>
            <span className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">{stats.avgAccuracy}%</span>
            <span className="text-[9px] text-slate-500 font-semibold">Benchmark SOTA Average</span>
          </div>
        </div>
      </section>

      {/* SECTION 6: Featured Architectures (Family Representatives) */}
      <section aria-label="Featured Architectures" className="relative z-10 border-y border-border/20 bg-slate-950/30 py-8 sm:py-10 mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                Featured Architecture Families
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                Representative landmark models spanning Foundational, Residual, Dense, Mobile, Compound, Transformer, and Modern ConvNets.
              </p>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group shrink-0"
            >
              <span>Full Catalog ({stats.modelCount})</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {featuredModels.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Explore by Family */}
      <section aria-label="Explore Architectures by Family" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-border/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              Explore by Architecture Family
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Filtered Catalog Access
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              id: 'ResNet',
              name: 'ResNet (Residual Networks)',
              count: modelsData.filter((m) => m.category === 'ResNet').length,
              desc: 'Identity skip connections H(x) = F(x) + x that solve vanishing gradients in ultra-deep networks.',
              icon: Zap,
              color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
            },
            {
              id: 'DenseNet',
              name: 'DenseNet (Dense Connections)',
              count: modelsData.filter((m) => m.category === 'DenseNet').length,
              desc: 'Feature concatenation across all preceding layers for maximal channel reuse.',
              icon: Network,
              color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
            },
            {
              id: 'VGG',
              name: 'VGG (Visual Geometry Group)',
              count: modelsData.filter((m) => m.category === 'VGG').length,
              desc: 'Homogeneous 3x3 convolution stacks establishing standard deep vision baselines.',
              icon: Layers,
              color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
            },
            {
              id: 'MobileNet',
              name: 'MobileNet (Mobile & Edge)',
              count: modelsData.filter((m) => m.category === 'MobileNet').length,
              desc: 'Depthwise separable convolutions and inverted residual bottlenecks for mobile efficiency.',
              icon: Cpu,
              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
            },
            {
              id: 'EfficientNet',
              name: 'EfficientNet (Compound Scaling)',
              count: modelsData.filter((m) => m.category === 'EfficientNet').length,
              desc: 'Joint width, depth, and resolution scaling using optimal compound coefficients.',
              icon: TrendingUp,
              color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
            },
            {
              id: 'Transformer',
              name: 'Transformer & Modern ConvNets',
              count: modelsData.filter((m) => m.category === 'Transformer').length,
              desc: 'Patch self-attention, shifted windows (Swin), and modernized 2020s ConvNets (ConvNeXt).',
              icon: Sparkles,
              color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
            },
          ].map((family) => {
            const FamilyIcon = family.icon;
            return (
              <Link
                key={family.id}
                href={`/catalog?category=${family.id}`}
                className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-xl border ${family.color}`}>
                        <FamilyIcon className="h-4 w-4" />
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {family.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-border/20">
                      {family.count} Models
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-snug mt-1">
                    {family.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-cyan-400">
                  <span>Browse Family</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 8: Popular Comparisons */}
      <section aria-label="Popular Model Comparisons" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-border/15 pb-2.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-rose-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              Popular Architectural Comparisons
            </h2>
          </div>
          <Link
            href="/compare"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>Custom Comparison Tool</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              title: 'ResNet50 vs VGG16',
              models: 'resnet50,vgg16',
              desc: 'Compare skip connections vs plain homogeneous stacks (25.5M vs 138M params).',
              badge: 'Landmark Benchmark',
            },
            {
              title: 'DenseNet121 vs ResNet50',
              models: 'densenet121,resnet50',
              desc: 'Feature concatenation vs residual addition channel dynamics.',
              badge: 'Feature Reuse',
            },
            {
              title: 'MobileNetV2 vs EfficientNetB0',
              models: 'mobilenetv2,efficientnetb0',
              desc: 'Compare inverted bottleneck blocks vs compound scaling math.',
              badge: 'Edge Efficiency',
            },
            {
              title: 'ViT vs ConvNeXt',
              models: 'vit,convnext',
              desc: 'Vision Transformer self-attention vs modernized 2020s pure CNN.',
              badge: '2020s Paradigm',
            },
          ].map((comp, idx) => (
            <Link
              key={idx}
              href={`/compare?models=${comp.models}`}
              className="group p-4 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-rose-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
                  {comp.badge}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  {comp.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-snug mt-1">
                  {comp.desc}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-rose-400">
                <span>Launch Comparator</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 9: Mini Evolution Timeline Preview */}
      <section aria-label="Evolution Timeline Preview" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="p-5 rounded-3xl border border-amber-500/20 bg-slate-950/50 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-border/15 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Evolution Timeline Milestone Preview (1998 – 2022)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Chronological breakthroughs that transformed computer vision architecture.
              </p>
            </div>
            <Link
              href="/evolution"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all self-start sm:self-auto"
            >
              <span>Explore Full Interactive Timeline</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {evolutionData.slice(0, 5).map((node) => (
              <Link
                key={node.id}
                href={`/evolution?node=${node.id}`}
                className="p-3 rounded-xl border border-border/20 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/40 transition-all group"
              >
                <span className="text-[10px] font-black text-amber-400 block">{node.year}</span>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors mt-0.5 line-clamp-1">
                  {node.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-medium">
                  {node.innovation}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: Research Spotlight */}
      <section aria-label="Research Paper Spotlight" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="p-5 sm:p-6 rounded-3xl border border-purple-500/30 bg-slate-950/60 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Landmark Research Spotlight
              </span>
              <span className="text-xs text-slate-400 font-bold">{spotlightPaper.year} Publication</span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
              {spotlightPaper.title}
            </h3>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              <strong className="text-purple-300">Key Innovation:</strong> {spotlightPaper.contribution}
            </p>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              <strong className="text-slate-300">Problem Addressed:</strong> {spotlightPaper.problem}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Related Models:</span>
              {spotlightPaper.modelIds.map((id) => (
                <Link
                  key={id}
                  href={`/models/${id}`}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-border/20 text-[10px] font-bold text-cyan-400 hover:border-cyan-400/40 transition-colors uppercase"
                >
                  {id}
                </Link>
              ))}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              href={`/papers#${spotlightPaper.id}`}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 border border-purple-400 rounded-xl text-xs font-black text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 uppercase tracking-wider"
            >
              <span>Read Paper Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 11: Concept Explorer Cards */}
      <section aria-label="Interactive Concept Explorer" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-border/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              Interactive Educational Concept Visualizers
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Interactive Simulations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Receptive Field Expansion Math',
              href: '/concepts/receptive-field',
              desc: 'Calculates layer-by-layer spatial coverage as a function of kernel sizes (k), strides (s), and dilation (d).',
              badge: 'Spatial Context',
              color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
            },
            {
              title: 'Vanishing Gradient Dynamics',
              href: '/concepts/training-dynamics?concept=vanishing',
              desc: 'Simulate backpropagation gradient stability step-by-step across deep un-shortcut plain networks.',
              badge: 'Backprop Dynamics',
              color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
            },
            {
              title: 'Residual Identity Skip Mappings',
              href: '/concepts/training-dynamics?concept=residual',
              desc: 'Interactive visualizer showing how identity connections pass gradients unattenuated directly to early layers.',
              badge: 'Skip Shortcut',
              color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
            },
            {
              title: 'Dense Channel Concatenation',
              href: '/concepts/training-dynamics?concept=dense',
              desc: 'Analyze how DenseNet concatenates feature maps from all prior layers to maximize parameter efficiency.',
              badge: 'Feature Reuse',
              color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
            },
            {
              title: 'Self-Attention & Windowing',
              href: '/architecture-patterns?pattern=attention',
              desc: 'Study patch projections, QKV matrix operations, and local window attention mechanisms in ViT & Swin.',
              badge: 'Attention Math',
              color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
            },
            {
              title: 'Compound Scaling Coefficients',
              href: '/architecture-patterns?pattern=compound',
              desc: 'Explore alpha, beta, and gamma scaling equations that power EfficientNet accuracy gains.',
              badge: 'Scaling Formula',
              color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group p-4.5 rounded-2xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-2.5 ${item.color}`}>
                  {item.badge}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1.5">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-border/10 flex items-center justify-between text-[11px] font-bold text-indigo-400">
                <span>Launch Interactive Visualizer</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 12: Learning Journey Roadmap */}
      <section aria-label="Learning Journey Roadmap" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-border/15 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-400" />
                Architectural Evolution Learning Roadmap
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Recommended sequential study path from early ConvNets to modern Vision Transformers.
              </p>
            </div>
            <Link
              href="/learn"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>View All Roadmaps</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { step: '01', name: 'LeNet', era: '1998', href: '/models/lenet' },
              { step: '02', name: 'AlexNet', era: '2012', href: '/models/alexnet' },
              { step: '03', name: 'VGG16', era: '2014', href: '/models/vgg16' },
              { step: '04', name: 'ResNet50', era: '2015', href: '/models/resnet50' },
              { step: '05', name: 'DenseNet121', era: '2016', href: '/models/densenet121' },
              { step: '06', name: 'EfficientNetB0', era: '2019', href: '/models/efficientnetb0' },
              { step: '07', name: 'ViT', era: '2020', href: '/models/vit' },
              { step: '08', name: 'ConvNeXt', era: '2022', href: '/models/convnext' },
            ].map((node) => (
              <Link
                key={node.name}
                href={node.href}
                className="relative p-2.5 rounded-xl border border-border/20 bg-slate-900/40 hover:bg-slate-900 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-[9px] font-extrabold text-blue-400 mb-1">
                  <span>STEP {node.step}</span>
                  <span className="text-slate-500">{node.era}</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  {node.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 13 & 14: Today's Recommendation & Educational Fact */}
      <section aria-label="Daily Recommendation and Educational Insights" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SECTION 13: Today's Recommendation */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Today&apos;s Featured Spotlight
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                ResNet50 — The Residual Landmark
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                Explore how identity shortcut mappings allow gradients to flow straight through 50 layers without vanishing during backpropagation.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/10">
              <Link
                href="/models/resnet50"
                className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>Inspect Layer Graphs & Params</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* SECTION 14: Educational Fact Callout */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Did You Know?
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                ResNet152 has &lt;50% the parameters of VGG19!
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                Despite being over <strong className="text-amber-300">8 times deeper</strong> (152 layers vs 19 layers), ResNet152 contains only 60.2M parameters compared to VGG19&apos;s 143.7M parameters because VGG relies on dense fully-connected FC layers.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/10">
              <Link
                href="/compare?models=resnet152,vgg19"
                className="text-xs font-extrabold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <span>Compare ResNet152 vs VGG19</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
