'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, AlertOctagon, HelpCircle, Activity, 
  ArrowLeft, RefreshCw, Play, Pause, Layers
} from 'lucide-react';
import Link from 'next/link';

interface ConceptInfo {
  id: string;
  name: string;
  problem: string;
  mechanism: string;
  whyItMatters: string;
  formula: string;
}

const CONCEPTS: Record<string, ConceptInfo> = {
  vanishing: {
    id: 'vanishing',
    name: 'Vanishing Gradient',
    problem: 'In deep feedforward networks, during backpropagation, gradients are multiplied by small weights/derivatives layer-by-layer. As depth increases, the gradient shrinks exponentially, leaving early layers with virtually zero updates.',
    mechanism: 'Signals decay by a factor < 1 at each layer. By the time they reach layer 1, the gradient is too small to trigger weight updates, halting early-feature learning.',
    whyItMatters: 'Makes training deep sequential architectures (like deep VGG) mathematically impossible without special initialization or skip connections.',
    formula: 'g_i = g_{i+1} × W_i × σ\'(z_i)  (where σ\'(z) < 0.25 for Sigmoid)'
  },
  exploding: {
    id: 'exploding',
    name: 'Exploding Gradient',
    problem: 'If weights are initialized too large (or gradients are scaled poorly), backpropagated derivatives are repeatedly multiplied by factors > 1, growing exponentially.',
    mechanism: 'The gradients balloon to infinity (NaN), causing the network weights to oscillate wildly and completely destabilize learning.',
    whyItMatters: 'Causes training to immediately fail with numerical overflows, preventing the model from converging.',
    formula: 'g_i = g_{i+1} × W_i × σ\'(z_i)  (where W_i >> 1)'
  },
  residual: {
    id: 'residual',
    name: 'Residual Connections (ResNet)',
    problem: 'Standard deep networks suffer from optimization degradation. Skip connections bypass the weights, allowing gradients to flow backwards directly.',
    mechanism: 'Identity skip connections act as gradient superhighways. Even if weights inside the main path vanish, the gradient flows unimpeded through the shortcut path (+ 1 term in derivative).',
    whyItMatters: 'Enables training networks containing thousands of layers (e.g. ResNet152) with clean, rapid convergence.',
    formula: 'H(x) = F(x) + x   ⇒   dH/dx = dF/dx + 1'
  },
  dense: {
    id: 'dense',
    name: 'Dense Connections (DenseNet)',
    problem: 'Traditional residual additions merge features together, diluting distinct layer representations. Concatenation keeps features separate and directly accessible.',
    mechanism: 'Every layer is connected directly to every other layer in a block. Grad signals flow backwards from the output to every single intermediate layer via multiple parallel channels.',
    whyItMatters: 'Improves parameter efficiency and creates shorter, cleaner information paths between input features and output classifiers.',
    formula: 'x_l = H_l([x_0, x_1, ..., x_{l-1}])'
  },
  batchnorm: {
    id: 'batchnorm',
    name: 'Batch Normalization',
    problem: 'As weights update, the distribution of inputs to internal layers shifts constantly (Internal Covariate Shift), forcing subsequent layers to continuously adapt to changing scales.',
    mechanism: 'Calculates the mean and variance of activations across a mini-batch, normalizing them to zero mean and unit variance before scaling/shifting them with learnable parameters.',
    whyItMatters: 'Stabilizes distributions, permits much higher learning rates, and acts as a mild regularizer, accelerating training.',
    formula: 'x̂ = (x - μ) / √(σ² + ε)   ;   y = γx̂ + β'
  }
};

export default function TrainingDynamicsVisualizer() {
  const [activeTab, setActiveTab] = useState<string>('vanishing');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [networkDepth, setNetworkDepth] = useState<number>(6);
  const [backpropTrigger, setBackpropTrigger] = useState<number>(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger backpropagation animation pulse
  const triggerBackprop = () => {
    setBackpropTrigger(prev => prev + 1);
  };

  // Run Canvas Simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      speed: number;
      size: number;
      color: string;
      alpha: number;
      targetNodeIdx: number;
      pathIndex: number; // For DenseNet routing
    }> = [];

    // Calculate node coordinates on canvas
    const getNodesCoords = (depth: number, width: number, height: number) => {
      const coords = [];
      const paddingX = width < 450 ? 35 : 80;
      const stepX = (width - paddingX * 2) / (depth - 1);
      const centerY = height / 2;

      for (let i = 0; i < depth; i++) {
        coords.push({
          x: paddingX + i * stepX,
          y: centerY,
          radius: width < 450 ? 9 : 12
        });
      }
      return coords;
    };

    let nodes = getNodesCoords(networkDepth, canvas.width, canvas.height);
    
    // Gradient backpropagation pulse handler
    const spawnBackpropParticles = () => {
      // Spawn particles starting at the output layer (the last node) moving backwards (to node idx - 1)
      const lastIdx = nodes.length - 1;
      
      if (activeTab === 'dense') {
        // In DenseNet, the gradient flows from output to ALL preceding nodes directly
        for (let i = lastIdx - 1; i >= 0; i--) {
          particles.push({
            x: nodes[lastIdx].x,
            y: nodes[lastIdx].y,
            speed: 3 + Math.random() * 2,
            size: 4,
            color: '#8B5CF6', // Violet
            alpha: 1,
            targetNodeIdx: i,
            pathIndex: i
          });
        }
      } else {
        // Standard, Vanishing, ResNet, BatchNorm propagate layer-by-layer
        particles.push({
          x: nodes[lastIdx].x,
          y: nodes[lastIdx].y,
          speed: 3,
          size: 5,
          color: activeTab === 'vanishing' ? '#3B82F6' : activeTab === 'exploding' ? '#EF4444' : activeTab === 'residual' ? '#10B981' : '#06B6D4',
          alpha: 1,
          targetNodeIdx: lastIdx - 1,
          pathIndex: 0
        });
      }
    };

    // Trigger pulse on backpropTrigger update
    if (backpropTrigger > 0) {
      spawnBackpropParticles();
    }

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes = getNodesCoords(networkDepth, canvas.width, canvas.height);

      // 1. Draw Network Connections
      ctx.lineWidth = 2;
      for (let i = 0; i < nodes.length - 1; i++) {
        const start = nodes[i];
        const end = nodes[i + 1];

        // Draw standard sequential connection line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        if (activeTab === 'vanishing') {
          // Connections look weak/faded as they approach output
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 + (i / nodes.length) * 0.45})`;
        } else if (activeTab === 'exploding') {
          // Connections look unstable, thick, and red
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.random() * 0.3})`;
          ctx.lineWidth = 3;
        } else if (activeTab === 'residual') {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        } else if (activeTab === 'dense') {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        } else {
          // BatchNorm
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        }
        ctx.stroke();

        // 2. Draw Special Connections (ResNet Skip / Dense connections)
        if (activeTab === 'residual' && i % 2 === 0 && i + 2 < nodes.length) {
          // Draw ResNet identity skip connections (curves)
          const nodeStart = nodes[i];
          const nodeEnd = nodes[i + 2];
          ctx.beginPath();
          ctx.arc(
            (nodeStart.x + nodeEnd.x) / 2, 
            nodeStart.y, 
            (nodeEnd.x - nodeStart.x) / 2, 
            Math.PI, 
            0, 
            false
          );
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        if (activeTab === 'dense') {
          // Draw DenseNet connections: connect node i to all subsequent nodes
          for (let j = i + 2; j < nodes.length; j++) {
            const nodeStart = nodes[i];
            const nodeEnd = nodes[j];
            ctx.beginPath();
            // Vary arc height based on distance
            const height = (nodeEnd.x - nodeStart.x) * 0.3;
            ctx.moveTo(nodeStart.x, nodeStart.y);
            ctx.bezierCurveTo(
              nodeStart.x + (nodeEnd.x - nodeStart.x) / 3, nodeStart.y - height,
              nodeStart.x + (nodeEnd.x - nodeStart.x) * 2 / 3, nodeStart.y - height,
              nodeEnd.x, nodeEnd.y
            );
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.25 - (j - i) * 0.03})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // 3. Draw BatchNorm barriers
      if (activeTab === 'batchnorm') {
        ctx.lineWidth = 1.5;
        for (let i = 1; i < nodes.length - 1; i++) {
          const node = nodes[i];
          ctx.beginPath();
          ctx.moveTo(node.x - 15, node.y - 30);
          ctx.lineTo(node.x - 15, node.y + 30);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.stroke();
          
          // Draw mini normal bell curve indicator
          ctx.beginPath();
          ctx.ellipse(node.x - 15, node.y, 4, 15, 0, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
          ctx.fill();
        }
      }

      // 4. Draw Particles (Gradients moving backwards)
      if (isSimulating) {
        // Spawn automatic background particles
        if (Math.random() < 0.05) {
          const lastIdx = nodes.length - 1;
          if (activeTab === 'dense') {
            const target = Math.floor(Math.random() * lastIdx);
            particles.push({
              x: nodes[lastIdx].x,
              y: nodes[lastIdx].y,
              speed: 2 + Math.random() * 2,
              size: 3,
              color: '#8B5CF6',
              alpha: 0.8,
              targetNodeIdx: target,
              pathIndex: target
            });
          } else {
            particles.push({
              x: nodes[lastIdx].x,
              y: nodes[lastIdx].y,
              speed: 2,
              size: 4,
              color: activeTab === 'vanishing' ? '#3B82F6' : activeTab === 'exploding' ? '#EF4444' : activeTab === 'residual' ? '#10B981' : '#06B6D4',
              alpha: 0.8,
              targetNodeIdx: lastIdx - 1,
              pathIndex: 0
            });
          }
        }
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        const targetNode = nodes[p.targetNodeIdx];

        if (activeTab === 'dense') {
          // DenseNet path curves (Bezier path)
          const startX = nodes[nodes.length - 1].x;
          const startY = nodes[nodes.length - 1].y;
          const endX = targetNode.x;
          const endY = targetNode.y;

          // Interpolate coordinate along bezier curve
          p.alpha -= 0.003; // Slowly fade
          p.x -= p.speed;

          // Simple Bezier height approximation
          const progress = (startX - p.x) / (startX - endX);
          const height = (startX - endX) * 0.3;
          p.y = startY - Math.sin(progress * Math.PI) * height;

          // Check if reached target
          if (p.x <= endX) {
            particles.splice(idx, 1);
            return;
          }
        } else if (activeTab === 'residual' && p.pathIndex === 1) {
          // Shortcut path: move along the arc
          // Arc is between targetNode + 1 and targetNode - 1
          const startNode = nodes[p.targetNodeIdx + 2];
          const endNode = targetNode;
          
          p.x -= p.speed;
          const progress = (startNode.x - p.x) / (startNode.x - endNode.x);
          const radius = (startNode.x - endNode.x) / 2;
          p.y = startNode.y - Math.sin(progress * Math.PI) * radius;

          if (p.x <= endNode.x) {
            // Keep propagating left if not at layer 0
            if (p.targetNodeIdx > 0) {
              p.x = endNode.x;
              p.y = endNode.y;
              p.targetNodeIdx -= 1;
              p.pathIndex = 0; // standard sequential block next
            } else {
              particles.splice(idx, 1);
              return;
            }
          }
        } else {
          // Standard Sequential Layer-by-layer propagation
          const dx = targetNode.x - p.x;
          const dy = targetNode.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > p.speed) {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
          } else {
            // Reached target node!
            if (p.targetNodeIdx > 0) {
              // Decide next node and path
              p.x = targetNode.x;
              p.y = targetNode.y;
              p.targetNodeIdx -= 1;

              // ResNet split choice: standard conv vs shortcut arc
              if (activeTab === 'residual' && p.targetNodeIdx % 2 === 0 && p.targetNodeIdx >= 0) {
                if (Math.random() < 0.5) {
                  p.pathIndex = 1; // Take shortcut
                  p.color = '#10B981'; // Bright green
                  p.size = 5.5; // Bigger particle on highway
                } else {
                  p.pathIndex = 0; // Take main path
                }
              }

              // Vanishing gradient effect: decay size/alpha/color
              if (activeTab === 'vanishing') {
                p.size = Math.max(1, p.size - 0.7);
                p.alpha = Math.max(0.1, p.alpha - 0.15);
                p.speed = Math.max(0.5, p.speed - 0.2);
              }

              // Exploding gradient effect: grow size/oscillation
              if (activeTab === 'exploding') {
                p.size += 1.5;
                p.y += (Math.random() - 0.5) * 15; // Oscillate wildly
              }

              // BatchNorm stabilization: reset speed and alpha
              if (activeTab === 'batchnorm') {
                p.alpha = 1.0;
                p.color = '#06B6D4'; // restore cyan glow
              }
            } else {
              // Reached layer 0, destroy particle
              particles.splice(idx, 1);
              return;
            }
          }
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        
        // Add particle glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Nodes
      nodes.forEach((node, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

        // Styling node based on mode
        if (activeTab === 'exploding') {
          // Jitter/shake nodes
          const shakeX = (Math.random() - 0.5) * 2;
          const shakeY = (Math.random() - 0.5) * 2;
          ctx.translate(shakeX, shakeY);
        }

        let nodeColor = '#334155'; // default slate-700
        let borderColor = 'rgba(255, 255, 255, 0.15)';
        let glow = 0;

        if (activeTab === 'vanishing') {
          // Nodes near output look bright, early nodes look dead/gray
          const ratio = idx / nodes.length;
          nodeColor = `rgba(59, 130, 246, ${0.1 + ratio * 0.4})`;
          borderColor = `rgba(59, 130, 246, ${0.2 + ratio * 0.4})`;
        } else if (activeTab === 'exploding') {
          // Bright red glowing unstable nodes
          nodeColor = '#EF4444';
          borderColor = '#FCA5A5';
          glow = 12;
        } else if (activeTab === 'residual') {
          nodeColor = '#0F172A';
          borderColor = '#10B981';
          glow = idx % 2 === 0 ? 6 : 0;
        } else if (activeTab === 'dense') {
          nodeColor = '#0F172A';
          borderColor = '#8B5CF6';
          glow = 4;
        } else {
          // BatchNorm
          nodeColor = '#0F172A';
          borderColor = '#06B6D4';
          glow = 2;
        }

        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = glow;
        ctx.shadowColor = borderColor;
        ctx.fill();

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Node Label index numbers
        ctx.fillStyle = '#94A3B8';
        ctx.font = canvas.width < 450 ? 'bold 8px monospace' : 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0; // disable glow on text
        ctx.fillText(`L${idx}`, node.x, node.y);

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [networkDepth, activeTab, isSimulating, backpropTrigger]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24">
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-primary z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-purple-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Activity className="h-8 w-8 text-primary" />
            Training Dynamics Simulator
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-3xl leading-relaxed">
            Understand how optimization issues arise in deep feedforward stacks and how skip connections, concatenations, and batch normalizations stabilize gradient backpropagation.
          </p>
        </div>

        {/* Dynamic tabs & visual simulator workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT 5-COL: Concept details & explanations */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Concept Selector Tabs */}
            <div className="flex flex-col gap-2 bg-slate-950/40 border border-border/25 rounded-2xl p-2 backdrop-blur-md">
              {Object.values(CONCEPTS).map((concept) => {
                const isActive = activeTab === concept.id;
                return (
                  <button
                    key={concept.id}
                    onClick={() => setActiveTab(concept.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-primary/10 border border-primary/20 text-primary' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/25'
                    }`}
                  >
                    <span>{concept.name}</span>
                    {isActive && <Zap className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Concept details card */}
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-5">
              <h2 className="text-lg font-black text-white tracking-tight">
                {CONCEPTS[activeTab].name} Details
              </h2>

              <div className="space-y-4 text-xs sm:text-sm font-medium">
                {/* Mathematical Formula */}
                <div className="bg-slate-900/50 border border-border/25 rounded-xl p-3.5 font-mono text-center text-primary font-bold">
                  {CONCEPTS[activeTab].formula}
                </div>

                {/* Problem definition */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">
                    Problem & Explanation
                  </span>
                  <p className="text-slate-350 leading-relaxed">
                    {CONCEPTS[activeTab].problem}
                  </p>
                </div>

                {/* Mechanism detail */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">
                    Visual Mechanism
                  </span>
                  <p className="text-slate-350 leading-relaxed">
                    {CONCEPTS[activeTab].mechanism}
                  </p>
                </div>

                {/* Importance */}
                <div className="border-t border-border/10 pt-4">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                    Why it matters to architecture
                  </span>
                  <p className="text-slate-300 leading-relaxed font-semibold">
                    {CONCEPTS[activeTab].whyItMatters}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 7-COL: Simulation Canvas & Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex-1 flex flex-col justify-between">
              
              {/* Canvas Controls Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/10 pb-4 mb-4 shrink-0">
                <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-primary" />
                  Interactive Gradient Flow Canvas
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className="p-2 rounded-xl border border-border/30 bg-slate-900/30 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title={isSimulating ? 'Pause constant particles' : 'Play constant particles'}
                  >
                    {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={triggerBackprop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary border border-primary/20 text-xs font-bold text-white hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Trigger Backprop Pulse
                  </button>
                </div>
              </div>

              {/* Simulation Canvas area */}
              <div className="flex-1 min-h-[300px] bg-slate-950 border border-border/40 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
                
                {/* SVG/Background pattern overlay */}
                <div className="absolute inset-0 bg-radial-at-c from-slate-900/20 to-transparent pointer-events-none" />

                <canvas
                  ref={canvasRef}
                  width={600}
                  height={320}
                  className="w-full h-full block relative z-10"
                />

                {/* Backprop Direction Labels */}
                <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest z-20 pointer-events-none">
                  <span>Input Layer (L0)</span>
                  <span className="animate-pulse">← Gradient flows backward ←</span>
                  <span>Output Loss (L{networkDepth-1})</span>
                </div>
              </div>

              {/* Slider for network depth */}
              <div className="mt-6 border-t border-border/10 pt-5 flex items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">Network Depth Layers</span>
                  <span className="text-[10px] text-slate-500">Adjust network size to see cumulative vanishing effects.</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={4}
                    max={9}
                    step={1}
                    value={networkDepth}
                    onChange={(e) => setNetworkDepth(parseInt(e.target.value))}
                    className="w-32 accent-primary"
                  />
                  <span className="text-xs font-black text-white w-4">{networkDepth}</span>
                </div>
              </div>

            </div>

            {/* Conceptual comparison block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/30 border border-border/20 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  ResNet Skip Connection Solution
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  By adding an identity bypass: <code>H(x) = F(x) + x</code>. Even if the weight pathway <code>dF/dx</code> vanishes to 0, the derivative of <code>x</code> remains a constant <code>1.0</code>, keeping gradient backpropagation fully active.
                </p>
              </div>
              <div className="bg-slate-900/30 border border-border/20 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">
                  DenseNet Dense Block Solution
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  By concatenating maps, all features are directly shared: <code>[x_0, x_1, ...]</code>. The loss gradient flows backward along multiple separate parallel paths directly to all early layers, maximizing feature reuse.
                </p>
              </div>
            </div>

          </div>

        </div>

      </section>
    </div>
  );
}
