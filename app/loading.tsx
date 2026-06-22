'use client';

import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020612] text-foreground select-none">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Ambient background glow */}
      <div className="absolute w-[350px] h-[350px] rounded-full bg-cyan-500/10 filter blur-[100px] animate-pulse" />

      {/* Loader Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Brand Logo Icon */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            rotate: 360,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        >
          <Network className="h-8 w-8 stroke-[1.5]" />
        </motion.div>

        {/* Text and progress */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-sm font-extrabold tracking-widest text-white uppercase bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            NeuralExplorer
          </h2>
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest animate-pulse">
            Loading Architecture Workspace...
          </p>
        </div>

        {/* Progress Bar Line */}
        <div className="w-36 h-[2px] bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
