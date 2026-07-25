'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Zap, Network, Award, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import PageBackground from '@/components/layout/page-background';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';
import ContinueLearning from '@/components/ui/continue-learning';

// Lazy load Model Advisor for performance
const ModelAdvisor = dynamic(() => import('@/components/learn/model-advisor'), {
  ssr: true,
  loading: () => (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl p-6 md:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="space-y-2 mt-6">
          <div className="h-10 bg-slate-800 rounded-lg" />
          <div className="h-10 bg-slate-800 rounded-lg" />
          <div className="h-10 bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  ),
});

export default function Learn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'paths' | 'advisor'>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'advisor' || tabParam === 'paths') {
      return tabParam;
    }
    return 'paths';
  });
  const shouldReduceMotion = useReducedMotionPreference();

  const handleTabChange = (tab: 'paths' | 'advisor') => {
    setActiveTab(tab);
    router.replace(`/learn?tab=${tab}`);
  };

  const learningPaths = [
    {
      title: "Path 1: Feedforward & Homogeneous Stacks",
      subtitle: "Learn the fundamentals of sequential feature processing",
      description: "Start with VGG architectures to understand how repeated 3x3 convolutions build receptive fields. Understand spatial downsampling using max pooling and global feature mapping via dense layers.",
      models: [
        { id: 'vgg16', name: 'VGG16', desc: '138M params, simple linear stack' },
        { id: 'vgg19', name: 'VGG19', desc: '143M params, deeper linear stack' }
      ],
      icon: Layers,
      color: "text-blue-400 bg-blue-500/5 border-blue-500/10",
      themeColor: "#3B82F6"
    },
    {
      title: "Path 2: The Residual Revolution",
      subtitle: "Master skip connections and training stability",
      description: "Learn how ResNets solve the vanishing gradient problem in deep networks using skip connections that bypass identity signals. Move from ResNet50 to deeper variants and compare pre-activation ResNet V2 structures.",
      models: [
        { id: 'resnet50', name: 'ResNet50', desc: 'Identity shortcut mappings' },
        { id: 'resnet50v2', name: 'ResNet50V2', desc: 'Pre-activation shortcut structure' },
        { id: 'resnet152', name: 'ResNet152', desc: 'Deepest original ResNet variant' }
      ],
      icon: Zap,
      color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
      themeColor: "#10B981"
    },
    {
      title: "Path 3: Dense Connectivity & Feature Reuse",
      subtitle: "Maximize parameters and computational efficiency",
      description: "Study how DenseNet connects every layer directly to all subsequent layers. Learn how feature map concatenation maximizes reuse and parameter efficiency, enabling high accuracy with up to 90% fewer parameters.",
      models: [
        { id: 'densenet121', name: 'DenseNet121', desc: 'Densely connected blocks, 8M params' },
        { id: 'densenet201', name: 'DenseNet201', desc: 'Deepest densely connected architecture' }
      ],
      icon: Network,
      color: "text-violet-400 bg-violet-500/5 border-violet-500/10",
      themeColor: "#8B5CF6"
    }
  ];

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-16 overflow-x-hidden">
      <PageBackground variant="blue-purple" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 w-full">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border/10 pb-4 sm:pb-5 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            Study Paths & Advisor
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-snug">
            Learn standard deep learning design paradigms or find the perfect architecture matching your hardware.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#020617] border border-[#1f2937] rounded-2xl p-1 select-none max-w-md mb-10 shadow-lg w-full">
          <button
            onClick={() => handleTabChange('paths')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              activeTab === 'paths'
                ? "bg-primary text-slate-950 border-primary font-black shadow-md shadow-primary/10"
                : "bg-transparent text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="inline min-[380px]:hidden">Roadmaps</span>
            <span className="hidden min-[380px]:inline">Learning Roadmaps</span>
          </button>
          <button
            onClick={() => handleTabChange('advisor')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              activeTab === 'advisor'
                ? "bg-primary text-slate-950 border-primary font-black shadow-md shadow-primary/10"
                : "bg-transparent text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="inline min-[380px]:hidden">Advisor</span>
            <span className="hidden min-[380px]:inline">Model Advisor</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'paths' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path, idx) => {
              const PathIcon = path.icon;
              return (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : idx * 0.1 }}
                  className="bg-slate-950/20 border border-border/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-border/50 transition-all duration-300 h-full flex flex-col"
                >
                  <div 
                    className="absolute top-0 left-0 w-full h-1.5 transition-all duration-300" 
                    style={{ backgroundColor: path.themeColor }}
                  />

                  <div className="flex flex-col h-full justify-between gap-6 pt-2 flex-1">
                    {/* Left Column: Path Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${path.color}`}>
                          <PathIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white tracking-tight">{path.title}</h2>
                          <p className="text-xs text-slate-500 font-semibold">{path.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-450 leading-relaxed font-medium">
                        {path.description}
                      </p>
                    </div>

                    {/* Recommended Models */}
                    <div className="w-full bg-slate-900/10 border border-border/20 rounded-xl p-4 flex flex-col gap-2 mt-auto">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mb-1">
                        Recommended Models:
                      </span>
                      {path.models.map(model => (
                        <Link
                          key={model.id}
                          href={`/models/${model.id}`}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/10 bg-slate-950/40 hover:bg-slate-900/40 hover:border-border/30 transition-all group/item"
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="text-xs font-bold text-white group-hover/item:text-primary transition-colors">
                              {model.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium truncate">
                              {model.desc}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover/item:translate-x-0.5 group-hover/item:text-slate-350 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          >
            <ModelAdvisor />
          </motion.div>
        )}

        {/* Continue Learning section */}
        <ContinueLearning
          items={[
            { title: 'Architecture Patterns Library', type: 'pattern', href: '/architecture-patterns', description: 'Master residual, dense, depthwise, and attention blocks.' },
            { title: 'Training Dynamics Simulator', type: 'concept', href: '/concepts/training-dynamics', description: 'Simulate backpropagation gradient stability.' },
            { title: 'Receptive Field Explorer', type: 'concept', href: '/concepts/receptive-field', description: 'Inspect spatial coverage calculations.' },
            { title: 'Evolution Timeline', type: 'evolution', href: '/evolution', description: 'Follow chronological breakthroughs from 1998 to present.' },
            { title: 'Research Map', type: 'paper', href: '/research-map', description: 'Explore landmark paper DAG lineage.' }
          ]}
        />
      </div>
    </div>
  );
}
