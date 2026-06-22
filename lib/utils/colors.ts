import { ModelMetadata } from '@/lib/data/model-metadata';
import { modelCategories } from '@/lib/data/model-categories';

/**
 * Get theme color for a model based on its category
 */
export function getModelThemeColor(model: ModelMetadata): string {
  // Use the category-based color if available
  const category = modelCategories[model.category];
  if (category) {
    return category.textColor;
  }
  // Fallback to the model's predefined theme
  return `text-[${model.colorTheme}]`;
}

/**
 * Get background color for a model based on its category
 */
export function getModelBgColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    return category.bgColor;
  }
  // Generate a fallback color
  return 'bg-slate-500/10';
}

/**
 * Get border color for a model based on its category
 */
export function getModelBorderColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    return category.borderColor;
  }
  return 'border-slate-500/30';
}

/**
 * Get hover border color for a model
 */
export function getModelBorderHoverColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    // Extract the base color and create a darker/more opaque version
    const colorMap: Record<string, string> = {
      'text-blue-400': 'hover:border-blue-500/50',
      'text-emerald-400': 'hover:border-emerald-500/50',
      'text-violet-400': 'hover:border-violet-500/50',
      'text-cyan-400': 'hover:border-cyan-500/50',
      'text-amber-400': 'hover:border-amber-500/50',
      'text-pink-400': 'hover:border-pink-500/50',
      'text-orange-400': 'hover:border-orange-500/50',
      'text-cyan-300': 'hover:border-cyan-500/50',
    };
    return colorMap[category.textColor] || 'hover:border-slate-500/60';
  }
  return 'hover:border-slate-500/60';
}

/**
 * Get shadow color for a model on hover
 */
export function getModelShadowColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    const shadowMap: Record<string, string> = {
      'text-blue-400': 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      'text-emerald-400': 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      'text-violet-400': 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
      'text-cyan-400': 'hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]',
      'text-amber-400': 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      'text-pink-400': 'hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
      'text-orange-400': 'hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
      'text-cyan-300': 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    };
    return shadowMap[category.textColor] || 'hover:shadow-[0_0_30px_rgba(100,116,139,0.15)]';
  }
  return 'hover:shadow-[0_0_30px_rgba(100,116,139,0.15)]';
}

/**
 * Get button background color for a model
 */
export function getModelButtonBgColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    const btnMap: Record<string, string> = {
      'text-blue-400': 'bg-blue-500/10 hover:bg-blue-500 text-blue-300 hover:text-white',
      'text-emerald-400': 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white',
      'text-violet-400': 'bg-violet-500/10 hover:bg-violet-500 text-violet-300 hover:text-white',
      'text-cyan-400': 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-white',
      'text-amber-400': 'bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-white',
      'text-pink-400': 'bg-pink-500/10 hover:bg-pink-500 text-pink-300 hover:text-white',
      'text-orange-400': 'bg-orange-500/10 hover:bg-orange-500 text-orange-300 hover:text-white',
      'text-cyan-300': 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-white',
    };
    return btnMap[category.textColor] || 'bg-slate-500/10 hover:bg-slate-500 text-slate-300 hover:text-white';
  }
  return 'bg-slate-500/10 hover:bg-slate-500 text-slate-300 hover:text-white';
}

/**
 * Get icon background color for a model
 */
export function getModelIconBgColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    const iconBgMap: Record<string, string> = {
      'text-blue-400': 'bg-blue-500/10 border-blue-500/20',
      'text-emerald-400': 'bg-emerald-500/10 border-emerald-500/20',
      'text-violet-400': 'bg-violet-500/10 border-violet-500/20',
      'text-cyan-400': 'bg-cyan-500/10 border-cyan-500/20',
      'text-amber-400': 'bg-amber-500/10 border-amber-500/20',
      'text-pink-400': 'bg-pink-500/10 border-pink-500/20',
      'text-orange-400': 'bg-orange-500/10 border-orange-500/20',
      'text-cyan-300': 'bg-cyan-500/10 border-cyan-500/20',
    };
    return iconBgMap[category.textColor] || 'bg-slate-500/10 border-slate-500/20';
  }
  return 'bg-slate-500/10 border-slate-500/20';
}

/**
 * Get glow background color for a model card
 */
export function getModelGlowColor(model: ModelMetadata): string {
  const category = modelCategories[model.category];
  if (category) {
    const glowMap: Record<string, string> = {
      'text-blue-400': 'bg-blue-500/5',
      'text-emerald-400': 'bg-emerald-500/5',
      'text-violet-400': 'bg-violet-500/5',
      'text-cyan-400': 'bg-cyan-500/5',
      'text-amber-400': 'bg-amber-500/5',
      'text-pink-400': 'bg-pink-500/5',
      'text-orange-400': 'bg-orange-500/5',
      'text-cyan-300': 'bg-cyan-500/5',
    };
    return glowMap[category.textColor] || 'bg-slate-500/5';
  }
  return 'bg-slate-500/5';
}

/**
 * Generate a deterministic color for a string (model ID or category)
 * Useful for consistent coloring across the app
 */
export function generateColorFromString(str: string): string {
  // Simple hash function to generate a consistent color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#8B5CF6', // violet
    '#0EA5E9', // sky
    '#F59E0B', // amber
    '#EC4899', // pink
    '#F97316', // orange
    '#06B6D4', // cyan
    '#EF4444', // red
    '#6366F1', // indigo
  ];

  return colors[Math.abs(hash) % colors.length];
}
