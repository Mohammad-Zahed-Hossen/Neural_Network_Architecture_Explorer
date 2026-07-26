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

// --- Static Data & Entities (Module Level - Zero Render Re-allocation) ---
const modelsData = getModelSummaries();

const PATTERN_ENTITIES: SearchableEntity[] = [
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

const CONCEPT_ENTITIES: SearchableEntity[] = [
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

const LEARN_ENTITIES: SearchableEntity[] = [
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

const UNIVERSAL_SEARCH_ENTITIES: SearchableEntity[] = [
  ...modelsData.map(enrichModelEntity),
  ...papersData.map(enrichPaperEntity),
  ...evolutionData.map(enrichEvolutionEntity),
  ...PATTERN_ENTITIES,
  ...CONCEPT_ENTITIES,
  ...LEARN_ENTITIES,
];

const STATS_DATA = (() => {
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
})();

const FEATURED_MODEL_IDS = ['resnet50', 'vgg16', 'vit', 'mobilenetv2'];
const FEATURED_MODELS_DATA = modelsData.filter((m) => FEATURED_MODEL_IDS.includes(m.id));
const SPOTLIGHT_PAPER_DATA = papersData.find((p) => p.id === 'resnet') || papersData[0];

const TYPE_ICON_MAP: Record<EntityType, typeof Layers> = {
  model: Layers,
  paper: FileText,
  pattern: GitCommit,
  concept: Compass,
  evolution: Network,
  learn: GraduationCap,
};

const TYPE_BADGE_MAP: Record<EntityType, string> = {
  model: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  paper: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  pattern: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  concept: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  evolution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  learn: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const FAMILY_CONFIGS = [
  {
    id: 'ResNet',
    name: 'ResNet',
    fullName: 'Residual Networks',
    desc: 'Identity skip connections H(x) = F(x) + x solving vanishing gradients.',
    icon: Zap,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    id: 'DenseNet',
    name: 'DenseNet',
    fullName: 'Dense Connections',
    desc: 'Feature concatenation connecting preceding layers for channel reuse.',
    icon: Network,
    color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  },
  {
    id: 'VGG',
    name: 'VGG',
    fullName: 'Visual Geometry Group',
    desc: 'Homogeneous 3x3 convolution stacks defining classical vision baselines.',
    icon: Layers,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  },
  {
    id: 'MobileNet',
    name: 'MobileNet',
    fullName: 'Mobile & Edge',
    desc: 'Depthwise separable convolutions and inverted residual bottlenecks.',
    icon: Cpu,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
  {
    id: 'EfficientNet',
    name: 'EfficientNet',
    fullName: 'Compound Scaling',
    desc: 'Joint width, depth, and resolution scaling with compound coefficients.',
    icon: TrendingUp,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    id: 'Transformer',
    name: 'Transformer & Modern CNNs',
    fullName: 'Vision Transformers',
    desc: 'Patch self-attention, shifted windows (Swin), and modernized ConvNeXt.',
    icon: Sparkles,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
];

const POPULAR_COMPARISONS = [
  {
    title: 'ResNet50 vs VGG16',
    models: 'resnet50,vgg16',
    desc: 'Skip connections vs plain stacks (25.5M vs 138M params).',
    badge: 'Landmark',
  },
  {
    title: 'DenseNet121 vs ResNet50',
    models: 'densenet121,resnet50',
    desc: 'Feature concatenation vs residual addition dynamics.',
    badge: 'Channel Reuse',
  },
  {
    title: 'MobileNetV2 vs EfficientNetB0',
    models: 'mobilenetv2,efficientnetb0',
    desc: 'Inverted bottlenecks vs compound scaling math.',
    badge: 'Edge Efficiency',
  },
  {
    title: 'ViT vs ConvNeXt',
    models: 'vit,convnext',
    desc: 'Vision Transformer self-attention vs modernized 2020s CNN.',
    badge: 'Modern Era',
  },
];

const CONCEPT_CARDS = [
  {
    title: 'Receptive Field Expansion',
    href: '/concepts/receptive-field',
    desc: 'Calculate spatial coverage growth across kernel size, stride, and dilation.',
    badge: 'Spatial Context',
  },
  {
    title: 'Vanishing Gradient Dynamics',
    href: '/concepts/training-dynamics?concept=vanishing',
    desc: 'Simulate backpropagation gradient flow across deep plain networks.',
    badge: 'Backprop',
  },
  {
    title: 'Residual Identity Skip Mappings',
    href: '/concepts/training-dynamics?concept=residual',
    desc: 'Visualizer showing how identity connections pass gradients unattenuated.',
    badge: 'Skip Shortcut',
  },
  {
    title: 'Dense Channel Concatenation',
    href: '/concepts/training-dynamics?concept=dense',
    desc: 'Analyze feature map concatenation across prior layers in DenseNet.',
    badge: 'Feature Reuse',
  },
  {
    title: 'Self-Attention & Windowing',
    href: '/architecture-patterns?pattern=attention',
    desc: 'Study patch projections, QKV matrix math, and window attention in ViT.',
    badge: 'Attention Math',
  },
  {
    title: 'Compound Scaling Coefficients',
    href: '/architecture-patterns?pattern=compound',
    desc: 'Explore alpha, beta, and gamma scaling equations in EfficientNet.',
    badge: 'Scaling Math',
  },
];

const ROADMAP_STEPS = [
  { step: '01', name: 'LeNet', era: '1998', href: '/models/lenet' },
  { step: '02', name: 'AlexNet', era: '2012', href: '/models/alexnet' },
  { step: '03', name: 'VGG16', era: '2014', href: '/models/vgg16' },
  { step: '04', name: 'ResNet50', era: '2015', href: '/models/resnet50' },
  { step: '05', name: 'DenseNet121', era: '2016', href: '/models/densenet121' },
  { step: '06', name: 'EfficientNetB0', era: '2019', href: '/models/efficientnetb0' },
  { step: '07', name: 'ViT', era: '2020', href: '/models/vit' },
  { step: '08', name: 'ConvNeXt', era: '2022', href: '/models/convnext' },
];

export default function Home() {
  const shouldReduceMotion = useReducedMotionPreference();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Universal Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchEntities(UNIVERSAL_SEARCH_ENTITIES, { searchQuery }, (item) => item).slice(0, 7);
  }, [searchQuery]);

  // Framer Motion variants restricted to Hero only
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-12 overflow-x-hidden">
      {/* TIER 1: MISSION CONTROL HERO HEADER & INTEGRATED SEARCH */}
      <section aria-label="Mission Control Hero" className="relative z-30 border-b border-border/15 bg-slate-950/60 pt-5 pb-4 sm:pt-6 sm:pb-5 lg:pt-7 lg:pb-6">
        <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center space-y-3"
          >
            {/* Tagline Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-cyan-400 uppercase">
                <Sparkles className="h-3 w-3" />
                Mission Control & Knowledge Hub
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={itemVariants}
              className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white"
            >
              Neural Network Architecture Explorer
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-xs sm:text-sm text-slate-400 font-medium leading-normal"
            >
              Interactive engineering platform for inspectable CNNs, Vision Transformers, paper lineage, and hardware trade-offs.
            </motion.p>

            {/* PRIMARY INTERACTION: Universal Search Bar */}
            <motion.div variants={itemVariants} className="w-full max-w-2xl pt-1">
              <div className="relative">
                <div className="relative flex items-center shadow-xl rounded-xl">
                  <Search className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search models, research papers, patterns, concepts, timeline..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    aria-label="Universal Search input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg"
                      aria-label="Clear search query"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Instant Search Results Panel */}
                <AnimatePresence>
                  {searchQuery.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-[#020617] border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl z-50 overflow-hidden text-left"
                    >
                      <div className="flex items-center justify-between px-2 pb-1.5 mb-1.5 border-b border-border/20">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          Results ({searchResults.length})
                        </span>
                        <span className="text-[10px] text-slate-500">Press Esc or click to navigate</span>
                      </div>

                      {searchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No matching architectures, papers, or concepts found for &quot;{searchQuery}&quot;.
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                          {searchResults.map((result) => {
                            const entity = result.item;
                            const IconComp = TYPE_ICON_MAP[entity.type] || Compass;
                            const badgeStyle = TYPE_BADGE_MAP[entity.type] || TYPE_BADGE_MAP.concept;

                            return (
                              <Link
                                key={`${entity.type}-${entity.id}`}
                                href={entity.url}
                                onClick={() => setSearchQuery('')}
                                className="flex items-center justify-between p-2 rounded-lg border border-border/10 bg-slate-900/40 hover:bg-slate-900 hover:border-cyan-500/30 transition-all group"
                              >
                                <div className="flex items-center gap-2 pr-2">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${badgeStyle}`}>
                                    <IconComp className="h-2.5 w-2.5" />
                                    {entity.type}
                                  </span>
                                  <div>
                                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                      {entity.title}
                                      {entity.year && (
                                        <span className="text-[10px] text-slate-500">({entity.year})</span>
                                      )}
                                    </div>
                                    {entity.subtitle && (
                                      <p className="text-[10px] text-slate-400 line-clamp-1">
                                        {entity.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Action Hierarchy CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1"
            >
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-400 border border-cyan-300 rounded-lg text-xs font-black text-slate-950 hover:bg-cyan-300 transition-colors uppercase tracking-wider shadow-sm"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Start Learning
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 border border-border/40 rounded-lg text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <Play className="h-3.5 w-3.5 text-cyan-400" />
                Explore Catalog ({STATS_DATA.modelCount})
              </Link>
              <span className="hidden sm:inline text-slate-600 text-xs">|</span>
              <Link
                href="/compare"
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <BarChart3 className="h-3.5 w-3.5 text-rose-400" />
                Compare Models
              </Link>
              <Link
                href="/research-map"
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <Network className="h-3.5 w-3.5 text-purple-400" />
                Research Map
              </Link>
            </motion.div>

            {/* MISSION STATISTICS PANEL (Refined, Balanced & Structured) */}
            <motion.div variants={itemVariants} className="w-full max-w-4xl pt-2 sm:pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                {/* Metric 1: Models */}
                <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border border-border/25 bg-slate-900/40 hover:bg-slate-900/60 transition-colors shadow-sm text-left">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">Models</span>
                    <Layers className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </div>
                  <div className="my-1.5">
                    <span className="text-base sm:text-lg font-black text-white tracking-tight block">
                      {STATS_DATA.modelCount}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 truncate block">
                    Inspectable Catalog
                  </span>
                </div>

                {/* Metric 2: Papers */}
                <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border border-border/25 bg-slate-900/40 hover:bg-slate-900/60 transition-colors shadow-sm text-left">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">Papers</span>
                    <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  </div>
                  <div className="my-1.5">
                    <span className="text-base sm:text-lg font-black text-purple-400 tracking-tight block">
                      {STATS_DATA.paperCount}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 truncate block">
                    Landmark Studies
                  </span>
                </div>

                {/* Metric 3: Timeline */}
                <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border border-border/25 bg-slate-900/40 hover:bg-slate-900/60 transition-colors shadow-sm text-left">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">Timeline</span>
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  </div>
                  <div className="my-1.5">
                    <span className="text-base sm:text-lg font-black text-amber-400 tracking-tight block">
                      1998–2022
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 truncate block">
                    Epoch Milestones
                  </span>
                </div>

                {/* Metric 4: Avg Top-1 */}
                <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border border-border/25 bg-slate-900/40 hover:bg-slate-900/60 transition-colors shadow-sm text-left">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">Avg Top-1</span>
                    <Award className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="my-1.5">
                    <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight block">
                      {STATS_DATA.avgAccuracy}%
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 truncate block">
                    Benchmark Average
                  </span>
                </div>

                {/* Metric 5: Total Params */}
                <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border border-border/25 bg-slate-900/40 hover:bg-slate-900/60 transition-colors shadow-sm text-left col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">Total Params</span>
                    <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </div>
                  <div className="my-1.5">
                    <span className="text-base sm:text-lg font-black text-cyan-400 tracking-tight block">
                      {(STATS_DATA.totalParams / 1000000000).toFixed(2)}B
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 truncate block">
                    Catalog Parameter Sum
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TIER 1: CONTINUE LEARNING (REUSED COMPONENT WITH FIXED SPACING RHYTHM) */}
      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <ContinueLearning
          title="Resume Exploration & Recommended Next Steps"
          className="w-full mt-4 pt-4 border-t border-border/15"
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
      </div>

      {/* TIER 1: KNOWLEDGE HUB (CORE NAVIGATION MATRIX) */}
      <section aria-label="Knowledge Hub" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between mb-3 border-b border-border/15 pb-2">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
              Knowledge Hub & Exploration Centers
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
            Central Navigation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Card 1: Architecture Patterns */}
          <Link
            href="/architecture-patterns"
            className="group p-3 rounded-xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <GitCommit className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  6 Core Patterns
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Architecture Patterns
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">
                Residual, Dense, Depthwise, Compound Scaling, NAS, and Self-Attention block blueprints.
              </p>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-emerald-400">
              <span>Inspect Motifs</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Research Papers */}
          <Link
            href="/papers"
            className="group p-3 rounded-xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {STATS_DATA.paperCount} Research Papers
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                Research Papers Catalog
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">
                Landmark publications from 1998 LeNet to Vision Transformers with contributions.
              </p>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-purple-400">
              <span>Read Papers</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Evolution Timeline */}
          <Link
            href="/evolution"
            className="group p-3 rounded-xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {STATS_DATA.timelineCount} Epoch Milestones
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                Evolution Timeline
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">
                Chronological deep learning breakthroughs from 1998 to 2022 modern ConvNets.
              </p>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-amber-400">
              <span>Trace History</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Research Map DAG */}
          <Link
            href="/research-map"
            className="group p-3 rounded-xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Network className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Citation Lineage
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                Research Map DAG
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">
                Interactive citation DAG network connecting papers, predecessors, and influence nodes.
              </p>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-cyan-400">
              <span>Explore DAG Graph</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* TIER 2: FEATURED ARCHITECTURES (REDUCED CARD DENSITY: 4 MODELS MAX) */}
      <section aria-label="Featured Architectures" className="relative z-10 border-y border-border/20 bg-slate-950/30 py-6 mt-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                Featured Architectures
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Core landmark models representing major vision paradigms.
              </p>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group shrink-0"
            >
              <span>Full Catalog ({STATS_DATA.modelCount})</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {FEATURED_MODELS_DATA.map((model, i) => (
              <div
                key={model.id}
                className={
                  i === 3 ? 'hidden xl:block' : i === 2 ? 'hidden lg:block xl:block' : 'block'
                }
              >
                <ModelCard model={model} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIER 2: EXPLORE BY ARCHITECTURE FAMILY */}
      <section aria-label="Explore Architectures by Family" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-3 border-b border-border/15 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
              Explore by Architecture Family
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
            Filtered Catalog Access
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FAMILY_CONFIGS.map((family) => {
            const FamilyIcon = family.icon;
            const count = modelsData.filter((m) => m.category === family.id).length;
            return (
              <Link
                key={family.id}
                href={`/catalog?category=${family.id}`}
                className="group p-3 rounded-xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${family.color}`}>
                        <FamilyIcon className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {family.name}
                      </h3>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-border/20">
                      {count} Models
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-snug line-clamp-2">
                    {family.desc}
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-cyan-400">
                  <span>Browse Family</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TIER 2: POPULAR COMPARISONS */}
      <section aria-label="Popular Model Comparisons" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-3 border-b border-border/15 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-rose-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
              Popular Architectural Comparisons
            </h2>
          </div>
          <Link
            href="/compare"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>Comparator Tool</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {POPULAR_COMPARISONS.map((comp, idx) => (
            <Link
              key={idx}
              href={`/compare?models=${comp.models}`}
              className="group p-3 rounded-xl border border-border/30 bg-slate-950/40 hover:bg-slate-900/60 hover:border-rose-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-1.5">
                  {comp.badge}
                </span>
                <h3 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                  {comp.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5 line-clamp-2">
                  {comp.desc}
                </p>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-rose-400">
                <span>Launch Compare</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TIER 2: MINI EVOLUTION TIMELINE PREVIEW */}
      <section aria-label="Evolution Timeline Preview" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-3 border-b border-border/15 pb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                Evolution Milestones (1998 – 2022)
              </h2>
            </div>
            <Link
              href="/evolution"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <span>Full Timeline</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {evolutionData.slice(0, 5).map((node) => (
              <Link
                key={node.id}
                href={`/evolution?node=${node.id}`}
                className="p-2.5 rounded-lg border border-border/20 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/40 transition-all group"
              >
                <span className="text-[9px] font-black text-amber-400 block">{node.year}</span>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {node.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                  {node.innovation}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TIER 3: DEEP LEARNING — RESEARCH SPOTLIGHT */}
      <section aria-label="Research Paper Spotlight" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/20 bg-slate-950/40 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[9px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Spotlight Paper
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{SPOTLIGHT_PAPER_DATA.year}</span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {SPOTLIGHT_PAPER_DATA.title}
            </h3>

            <p className="text-xs text-slate-300 font-medium leading-relaxed line-clamp-2">
              <strong className="text-purple-300">Key Innovation:</strong> {SPOTLIGHT_PAPER_DATA.contribution}
            </p>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Related:</span>
              {SPOTLIGHT_PAPER_DATA.modelIds.map((id) => (
                <Link
                  key={id}
                  href={`/models/${id}`}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-border/20 text-[9px] font-bold text-cyan-400 hover:border-cyan-400/40 transition-colors uppercase"
                >
                  {id}
                </Link>
              ))}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              href={`/papers#${SPOTLIGHT_PAPER_DATA.id}`}
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600/90 border border-purple-400/50 rounded-lg text-xs font-bold text-white hover:bg-purple-500 transition-colors uppercase tracking-wider"
            >
              <span>Read Paper Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* TIER 3: DEEP LEARNING — CONCEPT EXPLORER */}
      <section aria-label="Interactive Concept Explorer" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-3 border-b border-border/15 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
              Interactive Concept Visualizers
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
            Interactive Simulations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CONCEPT_CARDS.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group p-3 rounded-xl border border-border/20 bg-slate-950/30 hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1.5 text-indigo-300 border-indigo-500/20 bg-indigo-500/10">
                  {item.badge}
                </span>
                <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-indigo-400">
                <span>Launch Visualizer</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TIER 3: DEEP LEARNING — LEARNING ROADMAP */}
      <section aria-label="Learning Journey Roadmap" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-slate-950/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 border-b border-border/15 pb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                Evolution Learning Roadmap
              </h2>
            </div>
            <Link
              href="/learn"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Roadmaps</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {ROADMAP_STEPS.map((node) => (
              <Link
                key={node.name}
                href={node.href}
                className="p-2 rounded-lg border border-border/20 bg-slate-900/30 hover:bg-slate-900 hover:border-blue-500/40 transition-all flex flex-col justify-between group text-left"
              >
                <div className="flex items-center justify-between text-[8px] font-bold text-blue-400 mb-0.5">
                  <span>STEP {node.step}</span>
                  <span className="text-slate-500">{node.era}</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                  {node.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TIER 3: SPOTLIGHT RECOMMENDATION & DID YOU KNOW */}
      <section aria-label="Daily Recommendation and Educational Insights" className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Today's Recommendation */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Featured Spotlight
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                ResNet50 — The Residual Landmark
              </h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5 line-clamp-2">
                Explore how identity shortcut mappings allow gradients to flow straight through 50 layers without vanishing during backpropagation.
              </p>
            </div>

            <div className="pt-2 border-t border-border/10">
              <Link
                href="/models/resnet50"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>Inspect Layer Graphs & Params</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Educational Fact Callout */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Did You Know?
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                ResNet152 has &lt;50% the parameters of VGG19!
              </h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5 line-clamp-2">
                Despite being over 8x deeper, ResNet152 has only 60.2M params vs VGG19&apos;s 143.7M params because VGG relies on dense FC layers.
              </p>
            </div>

            <div className="pt-2 border-t border-border/10">
              <Link
                href="/compare?models=resnet152,vgg19"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
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
