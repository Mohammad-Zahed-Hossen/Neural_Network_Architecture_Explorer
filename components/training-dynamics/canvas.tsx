'use client';

import React, { useEffect, useState } from 'react';
import { SimulationEngine } from '@/lib/training-dynamics/simulation-engine';
import { VisualizerHost } from '@/components/visualizers/VisualizerHost';
import { EngineState } from '@/lib/training';

interface CanvasProps {
  engine: SimulationEngine;
  networkDepth?: number;
  className?: string;
}

export default function Canvas({ engine, className = '' }: CanvasProps) {
  const [engineState, setEngineState] = useState<EngineState>(() => engine.getEngineState());

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      engine.update(1.0);
      setEngineState(engine.getEngineState());
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  return (
    <div className={`flex-1 min-h-[300px] w-full ${className}`}>
      <VisualizerHost
        engineState={engineState}
        width={680}
        height={320}
      />
    </div>
  );
}
