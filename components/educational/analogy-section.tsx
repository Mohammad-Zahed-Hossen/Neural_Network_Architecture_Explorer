import React from 'react';
import { Lightbulb } from 'lucide-react';

interface AnalogySectionProps {
  analogy: string;
  className?: string;
}

export default function AnalogySection({ analogy, className = '' }: AnalogySectionProps) {
  return (
    <div className={`bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-amber-400">
        <Lightbulb className="h-4 w-4 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Real-World Analogy</span>
      </div>
      <p className="text-xs text-amber-200/90 leading-relaxed italic font-medium">
        &ldquo;{analogy}&rdquo;
      </p>
    </div>
  );
}
