import { ModelCategory } from './model-metadata';
import { Network, Zap, Lightbulb, Share2, Layers, Cpu, TrendingUp, Search, History } from 'lucide-react';

export interface CategoryInfo {
  id: ModelCategory;
  name: string;
  description: string;
  icon: typeof Network;
  color: string; // Tailwind color class
  textColor: string; // Tailwind text color
  bgColor: string; // Tailwind bg color
  borderColor: string; // Tailwind border color
}

export const modelCategories: Record<ModelCategory, CategoryInfo> = {
  VGG: {
    id: 'VGG',
    name: 'VGG',
    description: 'Very Deep Convolutional Networks with uniform 3×3 convolutions',
    icon: Layers,
    color: 'blue',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  ResNet: {
    id: 'ResNet',
    name: 'ResNet',
    description: 'Residual Networks with skip connections for deep architectures',
    icon: Share2,
    color: 'emerald',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  DenseNet: {
    id: 'DenseNet',
    name: 'DenseNet',
    description: 'Densely Connected Networks with feature reuse and concatenation',
    icon: Network,
    color: 'violet',
    textColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  MobileNet: {
    id: 'MobileNet',
    name: 'MobileNet',
    description: 'Lightweight mobile-optimized architectures for edge devices',
    icon: Zap,
    color: 'cyan',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  Inception: {
    id: 'Inception',
    name: 'Inception',
    description: 'Multi-branch architecture with parallel convolutions',
    icon: Lightbulb,
    color: 'amber',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  Xception: {
    id: 'Xception',
    name: 'Xception',
    description: 'Extended Inception using depthwise separable convolutions',
    icon: TrendingUp,
    color: 'pink',
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  EfficientNet: {
    id: 'EfficientNet',
    name: 'EfficientNet',
    description: 'Compound scaling for efficient parameter and accuracy tradeoff',
    icon: Cpu,
    color: 'orange',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  NASNet: {
    id: 'NASNet',
    name: 'NASNet',
    description: 'Neural Architecture Search discovered models',
    icon: Search,
    color: 'cyan',
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  Foundational: {
    id: 'Foundational',
    name: 'Foundational',
    description: 'Pioneering architectures that shaped deep representation learning',
    icon: History,
    color: 'lime',
    textColor: 'text-lime-400',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/30',
  },
  Transformer: {
    id: 'Transformer',
    name: 'Transformer',
    description: 'Self-attention and hybrid architectures bypassing classical CNN limits',
    icon: Cpu,
    color: 'fuchsia',
    textColor: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/30',
  },
};

// Category order for navigation
export const categoryOrder: ModelCategory[] = [
  'Foundational',
  'VGG',
  'ResNet',
  'DenseNet',
  'Inception',
  'Xception',
  'MobileNet',
  'EfficientNet',
  'NASNet',
  'Transformer',
];
