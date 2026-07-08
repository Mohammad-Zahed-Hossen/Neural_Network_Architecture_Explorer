import { useReducedMotion } from 'framer-motion';

/**
 * Hook to detect if user prefers reduced motion.
 * Wraps framer-motion's useReducedMotion for consistent usage across components.
 * @returns true if the user has "prefers-reduced-motion: reduce" enabled
 */
export function useReducedMotionPreference(): boolean {
  return useReducedMotion() ?? false;
}
