import { ModelSummary } from '@/lib/schema/model.schema';
import { modelCategories } from '@/lib/data/model-categories';

/**
 * Get theme color for a model based on its category
 */
export function getModelThemeColor(model: ModelSummary): string {
  // Use the category-based color if available
  const category = modelCategories[model.category];
  if (category) {
    return category.textColor;
  }
  // Fallback to the model's predefined theme
  return `text-[${model.colorTheme}]`;
}

/**
 * Get icon background color for a model
 */
export function getModelIconBgColor(model: ModelSummary): string {
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
export function getModelGlowColor(model: ModelSummary): string {
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
