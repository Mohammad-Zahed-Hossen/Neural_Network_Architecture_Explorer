import { ComponentType } from 'react';
import { Activity, AlignJustify, Eye, GitMerge, HelpCircle, Image, Key, Layers, PlusCircle, Shrink, Zap } from 'lucide-react';
import { LayerType } from '@/lib/schema/model.schema';

export const layerIconMap: Record<LayerType, ComponentType<{ className?: string }>> = {
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

export type LayerStyle = {
  border: string;
  borderActive?: string;
  text: string;
  bg: string;
  badge: 'default' | 'secondary' | 'outline' | 'success' | 'indigo' | 'primary';
  glow?: string;
  shadow?: string;
  accentBg?: string;
};

export const layerStyleMap: Record<string, LayerStyle> = {
  input: {
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    borderActive: 'ring-2 ring-emerald-500/80 border-transparent shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.02]',
    badge: 'success',
    glow: 'shadow-emerald-500/5'
  },
  conv2d: {
    border: 'border-blue-500/20 hover:border-blue-500/40',
    borderActive: 'ring-2 ring-blue-500/80 border-transparent shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    text: 'text-blue-400',
    bg: 'bg-blue-500/[0.02]',
    badge: 'primary',
    glow: 'shadow-blue-500/5'
  },
  bottleneck: {
    border: 'border-blue-500/20 hover:border-blue-500/40',
    borderActive: 'ring-2 ring-blue-500/80 border-transparent shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    text: 'text-blue-400',
    bg: 'bg-blue-500/[0.02]',
    badge: 'primary',
    glow: 'shadow-blue-500/5'
  },
  dense_block: {
    border: 'border-blue-500/20 hover:border-blue-500/40',
    borderActive: 'ring-2 ring-blue-500/80 border-transparent shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    text: 'text-blue-400',
    bg: 'bg-blue-500/[0.02]',
    badge: 'primary',
    glow: 'shadow-blue-500/5'
  },
  batch_norm: {
    border: 'border-slate-500/20 hover:border-slate-500/40',
    borderActive: 'ring-2 ring-slate-400 border-transparent shadow-[0_0_15px_rgba(148,163,184,0.25)]',
    text: 'text-slate-400',
    bg: 'bg-slate-500/[0.02]',
    badge: 'secondary',
    glow: 'shadow-slate-500/5'
  },
  layer_norm: {
    border: 'border-slate-500/20 hover:border-slate-500/40',
    borderActive: 'ring-2 ring-slate-400 border-transparent shadow-[0_0_15px_rgba(148,163,184,0.25)]',
    text: 'text-slate-400',
    bg: 'bg-slate-500/[0.02]',
    badge: 'secondary',
    glow: 'shadow-slate-500/5'
  },
  attention: {
    border: 'border-fuchsia-500/20 hover:border-fuchsia-500/40',
    borderActive: 'ring-2 ring-fuchsia-500/80 border-transparent shadow-[0_0_15px_rgba(217,70,239,0.25)]',
    text: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/[0.02]',
    badge: 'indigo',
    glow: 'shadow-fuchsia-500/5'
  },
  activation: {
    border: 'border-pink-500/20 hover:border-pink-500/40',
    borderActive: 'ring-2 ring-pink-500/80 border-transparent shadow-[0_0_15px_rgba(236,72,153,0.25)]',
    text: 'text-pink-400',
    bg: 'bg-pink-500/[0.02]',
    badge: 'outline',
    glow: 'shadow-pink-500/5'
  },
  max_pooling2d: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    borderActive: 'ring-2 ring-amber-500/80 border-transparent shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    glow: 'shadow-amber-500/5'
  },
  average_pooling2d: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    borderActive: 'ring-2 ring-amber-500/80 border-transparent shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    glow: 'shadow-amber-500/5'
  },
  global_average_pooling2d: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    borderActive: 'ring-2 ring-amber-500/80 border-transparent shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    glow: 'shadow-amber-500/5'
  },
  transition_block: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    borderActive: 'ring-2 ring-amber-500/80 border-transparent shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.02]',
    badge: 'secondary',
    glow: 'shadow-amber-500/5'
  },
  flatten: {
    border: 'border-orange-500/20 hover:border-orange-500/40',
    borderActive: 'ring-2 ring-orange-500/80 border-transparent shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    text: 'text-orange-400',
    bg: 'bg-orange-500/[0.02]',
    badge: 'outline',
    glow: 'shadow-orange-500/5'
  },
  dense: {
    border: 'border-violet-500/20 hover:border-violet-500/40',
    borderActive: 'ring-2 ring-violet-500/80 border-transparent shadow-[0_0_15px_rgba(139,92,246,0.25)]',
    text: 'text-violet-400',
    bg: 'bg-violet-500/[0.02]',
    badge: 'indigo',
    glow: 'shadow-violet-500/5'
  },
  add: {
    border: 'border-red-500/20 hover:border-red-500/40',
    borderActive: 'ring-2 ring-red-500/80 border-transparent shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.02]',
    badge: 'outline',
    glow: 'shadow-red-500/5'
  },
  concatenate: {
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    borderActive: 'ring-2 ring-cyan-500/80 border-transparent shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/[0.02]',
    badge: 'outline',
    glow: 'shadow-cyan-500/5'
  }
};
