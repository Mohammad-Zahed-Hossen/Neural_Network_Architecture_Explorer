'use client';

import React, { useRef, useEffect } from 'react';
import { SimulationEngine } from '@/lib/training-dynamics/simulation-engine';

interface CanvasProps {
  engine: SimulationEngine;
  networkDepth: number;
  className?: string;
}

export default function Canvas({ engine, networkDepth, className = '' }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        engine.initialize(rect.width, rect.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const renderLoop = () => {
      engine.update(1.0);
      engine.render(ctx, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [engine]);

  return (
    <div className={`flex-1 min-h-[300px] bg-slate-950 border border-border/40 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner ${className}`}>
      {/* SVG/Background radial pattern */}
      <div className="absolute inset-0 bg-radial-at-c from-slate-900/20 to-transparent pointer-events-none" />

      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full h-full block relative z-10"
      />

      {/* Direction indicators */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest z-20 pointer-events-none">
        <span>Input Layer (L0)</span>
        <span className="animate-pulse">← Gradient flows backward ←</span>
        <span>Output Loss (L{networkDepth - 1})</span>
      </div>
    </div>
  );
}
