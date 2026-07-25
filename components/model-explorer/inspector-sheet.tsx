'use client';

import { motion, AnimatePresence } from 'framer-motion';
import InspectorPanel from './inspector-panel';
import { Layer } from '@/lib/schema/model.schema';
import { X } from 'lucide-react';
import { useReducedMotionPreference } from '@/lib/hooks/use-reduced-motion';

interface InspectorSheetProps {
  layer: Layer | null;
  onClose: () => void;
  totalModelParameters?: number;
}

export default function InspectorSheet({ layer, onClose, totalModelParameters = 0 }: InspectorSheetProps) {
  const shouldReduceMotion = useReducedMotionPreference();

  return (
    <AnimatePresence>
      {layer && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ 
              type: shouldReduceMotion ? undefined : 'spring', 
              damping: 30, 
              stiffness: 300,
              duration: shouldReduceMotion ? 0 : 0.3 
            }}
            className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-slate-950/95 backdrop-blur-xl border-t border-border/30 rounded-t-2xl shadow-2xl max-h-[60vh] flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))]"
             style={{ maxHeight: '60vh' }}
             data-safe-area-padding="true"
          >
            {/* Drag Handle / Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
              <div className="flex-1 flex justify-center">
                <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-900/60 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all border border-transparent hover:border-border/30 cursor-pointer"
                aria-label="Close inspector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto">
              <InspectorPanel
                layer={layer}
                onClose={onClose}
                totalModelParameters={totalModelParameters}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}