'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Zap, Network, GraduationCap, Award } from 'lucide-react';
import Link from 'next/link';
import ModelAdvisor from '@/components/learn/model-advisor';

export default function Learn() {
  const [activeTab, setActiveTab] = useState<'paths' | 'advisor'>('paths');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'advisor' || tabParam === 'paths') {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

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
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-16">
      {/* Background ambient glow */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 filter blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border/10 pb-6 mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-8 w-8 text-primary" />
            Study Paths & Advisor
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Learn standard deep learning design paradigms or find the perfect architecture matching your hardware.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#020617] border border-[#1f2937] rounded-2xl p-1 select-none max-w-md mb-10 shadow-lg">
          <button
            onClick={() => setActiveTab('paths')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              activeTab === 'paths'
                ? "bg-primary text-slate-950 border-primary font-black shadow-md shadow-primary/10"
                : "bg-transparent text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Learning Roadmaps
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              activeTab === 'advisor'
                ? "bg-primary text-slate-950 border-primary font-black shadow-md shadow-primary/10"
                : "bg-transparent text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <Award className="h-4 w-4" />
            Model Advisor
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'paths' ? (
          <div className="space-y-12">
            {learningPaths.map((path, idx) => {
              const PathIcon = path.icon;
              return (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-slate-950/20 border border-border/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-border/50 transition-all duration-300"
                >
                  <div 
                    className="absolute top-0 left-0 w-1.5 h-full transition-all duration-300" 
                    style={{ backgroundColor: path.themeColor }}
                  />

                  <div className="flex flex-col md:flex-row gap-6">
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

                    {/* Right Column: Model cards */}
                    <div className="w-full md:w-[320px] bg-slate-900/10 border border-border/20 rounded-xl p-4 flex flex-col gap-2 shrink-0">
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
            transition={{ duration: 0.4 }}
          >
            <ModelAdvisor />
          </motion.div>
        )}
      </div>
    </div>
  );
}
