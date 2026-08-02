import React from 'react';

interface ArchitecturePreviewProps {
  className?: string;
}

export default function ArchitecturePreview({ className = '' }: ArchitecturePreviewProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <div className="bg-slate-900/30 border border-border/20 rounded-2xl p-5 backdrop-blur-md space-y-2">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          ResNet Skip Connection Solution
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          By adding an identity bypass: <code className="text-emerald-300 font-mono">H(x) = F(x) + x</code>. Even if the weight pathway <code className="text-slate-300 font-mono">dF/dx</code> vanishes to 0, the derivative of <code className="text-emerald-300 font-mono">x</code> remains a constant <code className="text-emerald-300 font-mono">1.0</code>, keeping gradient backpropagation fully active.
        </p>
      </div>

      <div className="bg-slate-900/30 border border-border/20 rounded-2xl p-5 backdrop-blur-md space-y-2">
        <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider">
          DenseNet Dense Block Solution
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          By concatenating maps, all features are directly shared: <code className="text-violet-300 font-mono">[x_0, x_1, ...]</code>. The loss gradient flows backward along multiple separate parallel paths directly to all early layers, maximizing feature reuse.
        </p>
      </div>
    </div>
  );
}
