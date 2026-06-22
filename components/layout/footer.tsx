import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1f2937] bg-[#020617]/30 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 text-[#e5e7eb] font-semibold text-sm">
              <Layers className="h-4 w-4 text-[#22d3ee]" />
              <span>Neural Network Architecture Explorer</span>
            </div>
            <p className="text-xs text-[#6b7280] text-center md:text-left">
              An interactive visual learning platform for deep neural network topologies.
            </p>
          </div>

          {/* Tech stack & Copyright line */}
          <div className="text-xs text-[#6b7280] text-center md:text-right leading-relaxed font-semibold">
            <span>Built with Next.js 16 (App Router), React Flow, and Framer Motion</span>
            <span className="mx-2 text-slate-700">•</span>
            <span>&copy; {new Date().getFullYear()} NeuralExplorer</span>
            <span className="mx-2 text-slate-700">•</span>
            <span>Open educational resource</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
