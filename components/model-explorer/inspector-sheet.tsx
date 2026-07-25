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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ 
              type: shouldReduceMotion ? undefined : 'spring', 
              damping: 28, 
              stiffness: 300,
              duration: shouldReduceMotion ? 0 : 0.3 
            }}
            className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-slate-950/98 backdrop-blur-2xl border-t border-border/30 rounded-t-3xl shadow-2xl flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))]"
            style={{ maxHeight: '75vh', height: '75vh' }}
            data-safe-area-padding="true"
          >
            {/* Drag Handle / Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 shrink-0 bg-slate-950/90 rounded-t-3xl">
              <div className="flex-1 flex flex-col items-center pl-8">
                <div className="w-12 h-1.5 bg-slate-600 rounded-full mb-1.5" />
                <span className="text-xs font-extrabold text-slate-200 tracking-tight truncate max-w-[200px]">
                  {layer.name}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-900 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-all border border-transparent hover:border-border/30 cursor-pointer shrink-0"
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