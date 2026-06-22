'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Image as ImageIcon, Sliders, Eye, 
  HelpCircle, ChevronRight, Play, Cpu, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

type FeatureStage = 'input' | 'edges' | 'textures' | 'parts' | 'objects';

interface StageInfo {
  id: FeatureStage;
  name: string;
  depthName: string;
  description: string;
  intuition: string;
  receptiveField: string;
}

const STAGES: StageInfo[] = [
  {
    id: 'input',
    name: 'Input Image',
    depthName: 'Layer 0: Raw Pixels',
    description: 'The raw three-channel (RGB) spatial grid of pixels.',
    intuition: 'No representation has been learned yet. The network sees raw numeric color intensities.',
    receptiveField: '1 × 1 pixel'
  },
  {
    id: 'edges',
    name: 'Edges & Gradients',
    depthName: 'Layer 1: Shallow Convs',
    description: 'First-layer filters act as edge detectors (Gabor-like filters).',
    intuition: 'Captures local spatial changes in orientation, color boundaries, and fine lines. Small receptive fields focus on tiny neighborhoods.',
    receptiveField: '3 × 3 to 11 × 11 pixels'
  },
  {
    id: 'textures',
    name: 'Textures & Patterns',
    depthName: 'Layer 5: Mid-Shallow Convs',
    description: 'Intermediate filters combine lines to detect textures, grids, and stripes.',
    intuition: 'Combines multiple edge orientations. Detects repeat patterns, mesh grids, color blobs, and simple boundary contours.',
    receptiveField: '15 × 15 to 31 × 31 pixels'
  },
  {
    id: 'parts',
    name: 'Object Parts',
    depthName: 'Layer 15: Mid-Deep Convs',
    description: 'Deep features combine textures to identify localized parts (wheels, eyes, petals).',
    intuition: 'High spatial integration allows the model to recognize object sub-components independently of exact position.',
    receptiveField: '75 × 75 to 120 × 120 pixels'
  },
  {
    id: 'objects',
    name: 'Full Class Objects',
    depthName: 'Layer 25+: Deep Output Convs',
    description: 'Final layers assemble parts into full categories (cars, animals, flowers).',
    intuition: 'Highly abstract. Ignores precise spatial locations to focus on global semantic class existence and layout.',
    receptiveField: '224 × 224 pixels (Global)'
  }
];

const PRESETS = [
  { id: 'cat', name: '🐱 Stylized Cat' },
  { id: 'dog', name: '🐶 Playful Dog' },
  { id: 'car', name: '🚗 Sports Car' },
  { id: 'flower', name: '🌸 Daisy Flower' }
];

const MODELS = [
  { id: 'lenet', name: 'LeNet-5 (Foundational)' },
  { id: 'alexnet', name: 'AlexNet (8 Layers)' },
  { id: 'vgg16', name: 'VGG16 (16 Layers)' },
  { id: 'resnet50', name: 'ResNet50 (50 Layers)' }
];

export default function FeatureMapExplorer() {
  const [selectedPreset, setSelectedPreset] = useState<string>('cat');
  const [selectedModel, setSelectedModel] = useState<string>('vgg16');
  const [activeStage, setActiveStage] = useState<FeatureStage>('edges');
  const [gain, setGain] = useState<number>(1.2);
  const [overlayAlpha, setOverlayAlpha] = useState<number>(0.15);
  const [selectedChannel, setSelectedChannel] = useState<number>(0); // 0 to 7 filters

  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Vector graphics drawing helper
  const drawVectorPreset = (ctx: CanvasRenderingContext2D, type: string) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'cat') {
      // Ears
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(50, 90);
      ctx.lineTo(40, 30);
      ctx.lineTo(90, 65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(174, 90);
      ctx.lineTo(184, 30);
      ctx.lineTo(134, 65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Face outline
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 10, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(w / 2 - 25, h / 2 + 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2 + 25, h / 2 + 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(w / 2 - 25, h / 2 + 2, 4, 0, Math.PI * 2);
      ctx.arc(w / 2 + 25, h / 2 + 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 8, h / 2 + 20);
      ctx.lineTo(w / 2 + 8, h / 2 + 20);
      ctx.lineTo(w / 2, h / 2 + 27);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2 + 27);
      ctx.quadraticCurveTo(w / 2 - 10, h / 2 + 37, w / 2 - 18, h / 2 + 32);
      ctx.moveTo(w / 2, h / 2 + 27);
      ctx.quadraticCurveTo(w / 2 + 10, h / 2 + 37, w / 2 + 18, h / 2 + 32);
      ctx.stroke();

      // Whiskers
      ctx.beginPath();
      ctx.moveTo(w / 2 - 45, h / 2 + 22);
      ctx.lineTo(w / 2 - 85, h / 2 + 18);
      ctx.moveTo(w / 2 - 45, h / 2 + 27);
      ctx.lineTo(w / 2 - 90, h / 2 + 29);

      ctx.moveTo(w / 2 + 45, h / 2 + 22);
      ctx.lineTo(w / 2 + 85, h / 2 + 18);
      ctx.moveTo(w / 2 + 45, h / 2 + 27);
      ctx.lineTo(w / 2 + 90, h / 2 + 29);
      ctx.stroke();

    } else if (type === 'dog') {
      // Floppy Ears
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(45, h / 2 - 10, 20, 45, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(179, h / 2 - 10, 20, 45, -Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 5, 58, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Snout
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 22, 28, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Nose
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 12, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w / 2 - 20, h / 2 - 12, 9, 0, Math.PI * 2);
      ctx.arc(w / 2 + 20, h / 2 - 12, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupils
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(w / 2 - 20, h / 2 - 12, 4, 0, Math.PI * 2);
      ctx.arc(w / 2 + 20, h / 2 - 12, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tongue
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 37, 10, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (type === 'car') {
      // Car Body Base
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(25, h / 2 + 25);
      ctx.lineTo(25, h / 2 - 5);
      ctx.quadraticCurveTo(35, h / 2 - 15, 60, h / 2 - 15);
      ctx.lineTo(85, h / 2 - 35);
      ctx.lineTo(145, h / 2 - 35);
      ctx.lineTo(170, h / 2 - 5);
      ctx.quadraticCurveTo(195, h / 2 - 5, 200, h / 2 + 10);
      ctx.lineTo(200, h / 2 + 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windows
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(90, h / 2 - 30);
      ctx.lineTo(115, h / 2 - 30);
      ctx.lineTo(115, h / 2 - 12);
      ctx.lineTo(85, h / 2 - 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(122, h / 2 - 30);
      ctx.lineTo(142, h / 2 - 30);
      ctx.lineTo(158, h / 2 - 12);
      ctx.lineTo(122, h / 2 - 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wheels
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(65, h / 2 + 25, 22, 0, Math.PI * 2);
      ctx.arc(155, h / 2 + 25, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wheel Rims
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(65, h / 2 + 25, 10, 0, Math.PI * 2);
      ctx.arc(155, h / 2 + 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Headlight
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(195, h / 2 + 5, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (type === 'flower') {
      const cx = w / 2;
      const cy = h / 2 + 10;
      
      // Stem
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx - 20, cy + 50, cx - 10, h - 30);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;

      // Petals
      ctx.fillStyle = '#f8fafc';
      const numPetals = 8;
      for (let i = 0; i < numPetals; i++) {
        const angle = (i * Math.PI * 2) / numPetals;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(38, 0, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Flower Center
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  };

  // Run image convolution pipeline on canvas
  useEffect(() => {
    const srcCanvas = sourceCanvasRef.current;
    const outCanvas = outputCanvasRef.current;
    if (!srcCanvas || !outCanvas) return;

    const srcCtx = srcCanvas.getContext('2d');
    const outCtx = outCanvas.getContext('2d');
    if (!srcCtx || !outCtx) return;

    // 1. Draw original vector preset onto source canvas
    drawVectorPreset(srcCtx, selectedPreset);

    // 2. Run image processing according to the active stage
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const srcImgData = srcCtx.getImageData(0, 0, w, h);
    const srcPixels = srcImgData.data;

    const outImgData = outCtx.createImageData(w, h);
    const outPixels = outImgData.data;

    if (activeStage === 'input') {
      // Simply copy source pixels
      for (let i = 0; i < srcPixels.length; i++) {
        outPixels[i] = srcPixels[i];
      }
      outCtx.putImageData(outImgData, 0, 0);
      return;
    }

    if (activeStage === 'edges') {
      // 2.1 EDGES: Apply Sobel filters
      // We can use 8 different orientation angles based on selectedChannel
      const angle = (selectedChannel * Math.PI) / 4;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Define Sobel kernels rotating with the angle
      // E.g., combine standard Gx and Gy with directional projection
      const kX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ];
      const kY = [
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1]
      ];

      // Process convolution (ignoring borders for simplicity)
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let gxVal = 0;
          let gyVal = 0;

          // Apply 3x3 kernel over brightness/luminance channel
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pIdx = ((y + ky) * w + (x + kx)) * 4;
              // Compute luminance
              const r = srcPixels[pIdx];
              const g = srcPixels[pIdx + 1];
              const b = srcPixels[pIdx + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              gxVal += lum * kX[ky + 1][kx + 1];
              gyVal += lum * kY[ky + 1][kx + 1];
            }
          }

          // Directional edge filter selector
          const edgeIntensity = Math.abs(gxVal * cosA + gyVal * sinA) * gain;
          const outIdx = (y * w + x) * 4;

          // Render cyan glow edge
          outPixels[outIdx] = Math.min(255, edgeIntensity * 0.13); // Red
          outPixels[outIdx + 1] = Math.min(255, edgeIntensity * 0.82); // Green (Cyan scale)
          outPixels[outIdx + 2] = Math.min(255, edgeIntensity); // Blue
          outPixels[outIdx + 3] = 255;
        }
      }

    } else if (activeStage === 'textures') {
      // 2.2 TEXTURES: Apply a high-frequency Gabor-like filter
      // Add a fine mesh grid overlay or wave grating over edges
      const freq = 0.25 + (selectedChannel * 0.08);
      const angle = (selectedChannel * Math.PI) / 6;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          
          // Base luminance
          const r = srcPixels[idx];
          const g = srcPixels[idx + 1];
          const b = srcPixels[idx + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Compute periodic texture pattern (Gabor wave simulation)
          const waveX = x * Math.cos(angle) + y * Math.sin(angle);
          const grating = Math.sin(waveX * freq) * 0.5 + 0.5;

          // Mask texture by image boundaries
          const activation = lum > 0.05 ? grating * lum * 230 * gain : 0;

          outPixels[idx] = Math.min(255, activation * 0.6); // purple-cyan theme
          outPixels[idx + 1] = Math.min(255, activation * 0.3);
          outPixels[idx + 2] = Math.min(255, activation * 0.9);
          outPixels[idx + 3] = 255;
        }
      }

    } else if (activeStage === 'parts') {
      // 2.3 PARTS: Heatmaps activating on pre-defined components
      // Let's define the parts center coordinates for each preset
      let partCoords: { x: number; y: number; radius: number }[] = [];

      if (selectedPreset === 'cat') {
        // Cat parts: Ears, Eyes, Nose
        partCoords = [
          { x: 45, y: 60, radius: 25 },   // Left Ear
          { x: 179, y: 60, radius: 25 },  // Right Ear
          { x: 87, y: 114, radius: 20 },  // Left Eye
          { x: 137, y: 114, radius: 20 }, // Right Eye
          { x: 112, y: 132, radius: 15 }  // Nose/Snout
        ];
      } else if (selectedPreset === 'dog') {
        // Dog parts: Floppy Ears, Nose, Snout
        partCoords = [
          { x: 45, y: 100, radius: 30 },  // Left Ear
          { x: 179, y: 100, radius: 30 }, // Right Ear
          { x: 112, y: 124, radius: 18 }, // Nose
          { x: 112, y: 149, radius: 22 }  // Tongue/Mouth
        ];
      } else if (selectedPreset === 'car') {
        // Car parts: Wheels, Windshield, Headlight
        partCoords = [
          { x: 65, y: 137, radius: 28 },   // Left Wheel
          { x: 155, y: 137, radius: 28 },  // Right Wheel
          { x: 102, y: 92, radius: 20 },   // Front window
          { x: 132, y: 92, radius: 20 },   // Rear window
          { x: 195, y: 117, radius: 14 }   // Headlight
        ];
      } else if (selectedPreset === 'flower') {
        // Flower parts: Center, Petal segments
        partCoords = [
          { x: w / 2, y: h / 2 + 10, radius: 32 },  // Center core
          { x: w / 2 - 40, y: h / 2 + 10, radius: 20 }, // Left petal
          { x: w / 2 + 40, y: h / 2 + 10, radius: 20 }, // Right petal
          { x: w / 2, y: h / 2 - 30, radius: 20 }   // Top petal
        ];
      }

      // Select active part based on channel index to simulate different filters
      const activePartIdx = selectedChannel % partCoords.length;
      const targetPart = partCoords[activePartIdx];

      // Draw faint blurred source image first
      outCtx.filter = 'blur(10px) brightness(0.2)';
      outCtx.drawImage(srcCanvas, 0, 0);
      outCtx.filter = 'none';

      const tempImgData = outCtx.getImageData(0, 0, w, h);
      const tempPixels = tempImgData.data;

      // Add heatmap activation circle
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const dx = x - targetPart.x;
          const dy = y - targetPart.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < targetPart.radius * 2) {
            // Gaussian bell curve activation
            const ratio = dist / (targetPart.radius * 2);
            const intensity = Math.exp(-ratio * ratio * 4.0) * 255 * gain;
            
            // Mix heatmap colors (Cyan/Magenta highlight)
            tempPixels[idx] = Math.min(255, tempPixels[idx] + intensity * 0.9);      // Red
            tempPixels[idx + 1] = Math.min(255, tempPixels[idx + 1] + intensity * 0.1);  // Green
            tempPixels[idx + 2] = Math.min(255, tempPixels[idx + 2] + intensity * 0.85); // Blue
          }
        }
      }
      outCtx.putImageData(tempImgData, 0, 0);
      return;

    } else if (activeStage === 'objects') {
      // 2.4 OBJECTS: High-level semantic attention maps
      // Glow covering the entire center shape
      const cx = w / 2;
      const cy = h / 2 + 5;
      const maxDist = 95;

      // Draw blurred source image in background
      outCtx.filter = 'blur(14px) brightness(0.12)';
      outCtx.drawImage(srcCanvas, 0, 0);
      outCtx.filter = 'none';

      const tempImgData = outCtx.getImageData(0, 0, w, h);
      const tempPixels = tempImgData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const ratio = dist / maxDist;
            const intensity = Math.exp(-ratio * ratio * 3.2) * 255 * gain;

            // Blend fuchsia/violet activation
            tempPixels[idx] = Math.min(255, tempPixels[idx] + intensity * 0.8);
            tempPixels[idx + 1] = Math.min(255, tempPixels[idx + 1] + intensity * 0.15);
            tempPixels[idx + 2] = Math.min(255, tempPixels[idx + 2] + intensity * 0.95);
          }
        }
      }
      outCtx.putImageData(tempImgData, 0, 0);
      return;
    }

    // Blend standard channels (Edges / Textures) with a faint overlay of the source drawing
    const finalImgData = outCtx.getImageData(0, 0, w, h);
    const finalPixels = finalImgData.data;
    for (let i = 0; i < finalPixels.length; i += 4) {
      finalPixels[i] = Math.min(255, finalPixels[i] + srcPixels[i] * overlayAlpha);
      finalPixels[i + 1] = Math.min(255, finalPixels[i + 1] + srcPixels[i + 1] * overlayAlpha);
      finalPixels[i + 2] = Math.min(255, finalPixels[i + 2] + srcPixels[i + 2] * overlayAlpha);
    }
    outCtx.putImageData(finalImgData, 0, 0);

  }, [selectedPreset, selectedModel, activeStage, gain, overlayAlpha, selectedChannel]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-[#22d3ee] z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-purple-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border/10 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-8 w-8 text-[#22d3ee]" />
            Feature Map Explorer
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-3xl leading-relaxed">
            Peek inside convolutional layers to see how CNNs construct complex hierarchies. Witness raw pixels convert to edges, textures, parts, and full objects in real-time.
          </p>
        </div>

        {/* Preset & Model select selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/40 border border-border/20 rounded-2xl p-4 backdrop-blur-md">
          {/* Preset Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Select Input Preset</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="bg-slate-900 border border-border/30 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#22d3ee]/50 transition-all select-glow cursor-pointer"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Select CNN Model</label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                // Reset dynamic channels
                setSelectedChannel(0);
              }}
              className="bg-slate-900 border border-border/30 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#22d3ee]/50 transition-all select-glow cursor-pointer"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Active filter channel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Select Filter Channel</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(parseInt(e.target.value))}
                className="w-full accent-[#22d3ee]"
              />
              <span className="text-xs font-black text-white w-20 text-right bg-slate-900 px-2.5 py-1.5 rounded-lg border border-border/10">
                Ch #{selectedChannel}
              </span>
            </div>
          </div>

          {/* Activation Gain */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Activation Gain</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={gain}
                onChange={(e) => setGain(parseFloat(e.target.value))}
                className="w-full accent-[#22d3ee]"
              />
              <span className="text-xs font-black text-white w-14 text-right bg-slate-900 px-2.5 py-1.5 rounded-lg border border-border/10">
                x{gain.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Stepper timeline buttons */}
        <div className="flex flex-wrap items-stretch gap-2.5">
          {STAGES.map((s) => {
            const isActive = activeStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveStage(s.id);
                  // Clamp selected channel if stage has fewer parts
                  setSelectedChannel(0);
                }}
                className={`flex-1 min-w-[140px] px-4 py-3.5 rounded-xl border text-xs font-bold transition-all duration-300 flex flex-col items-start gap-1 justify-between cursor-pointer ${
                  isActive 
                    ? 'bg-[#22d3ee] border-[#22d3ee] text-[#020617] shadow-[0_0_15px_rgba(34,211,238,0.25)] scale-[1.02]' 
                    : 'bg-slate-950/20 border-border/30 text-slate-400 hover:border-[#22d3ee]/30 hover:text-slate-200'
                }`}
              >
                <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isActive ? 'text-[#020617]/70' : 'text-slate-500'}`}>
                  {s.depthName}
                </span>
                <span className="text-sm font-black tracking-tight">{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail */}
        <div className="bg-slate-900/30 border border-border/20 rounded-2xl p-5 backdrop-blur-md">
          <h3 className="text-xs font-bold text-[#22d3ee] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            {STAGES.find(s => s.id === activeStage)?.depthName} Intuition
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed font-semibold">
            {STAGES.find(s => s.id === activeStage)?.intuition}
          </p>
        </div>

        {/* Workspace: Source vs Feature map visualization */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Original source vector drawing (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col items-center justify-center min-h-[380px]">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-4 self-start flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-[#22d3ee]" />
                Input Image Vector Grid (224x224)
              </span>

              <div className="relative w-full max-w-[260px] aspect-square rounded-2xl border border-border/40 overflow-hidden shadow-inner flex items-center justify-center bg-slate-950">
                <canvas
                  ref={sourceCanvasRef}
                  width={224}
                  height={224}
                  className="w-full h-full block"
                />
              </div>

              <div className="w-full mt-6 border-t border-border/10 pt-4 flex flex-col gap-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Spatial Resolution:</span>
                  <span className="font-mono font-bold text-slate-200">224 × 224</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Input Channels:</span>
                  <span className="font-mono font-bold text-slate-200">3 (RGB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Convoluted Feature Map output (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex-1 flex flex-col justify-between min-h-[380px]">
              <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4">
                <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-[#22d3ee]" />
                  Simulated Layer Activation Map
                </span>
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Receptive Field: {STAGES.find(s => s.id === activeStage)?.receptiveField}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center py-4">
                <div className="relative w-full max-w-[280px] aspect-square rounded-2xl border-2 border-[#22d3ee]/20 overflow-hidden shadow-2xl flex items-center justify-center bg-slate-950 ring-4 ring-slate-900/40">
                  <canvas
                    ref={outputCanvasRef}
                    width={224}
                    height={224}
                    className="w-full h-full block"
                  />
                </div>
              </div>

              {/* Slider for image blend overlay */}
              {activeStage !== 'input' && (
                <div className="border-t border-border/10 pt-4 flex items-center justify-between gap-6 mt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">Original Silhouette Overlay</span>
                    <span className="text-[10px] text-slate-500">Blend faint outlines of the source drawing to help locate activation bounds.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={0.5}
                      step={0.05}
                      value={overlayAlpha}
                      onChange={(e) => setOverlayAlpha(parseFloat(e.target.value))}
                      className="w-24 accent-[#22d3ee]"
                    />
                    <span className="text-xs font-black text-white w-10 text-right">{Math.round(overlayAlpha * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed theory section */}
        <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md space-y-4">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-400" />
            CNN Hierarchical Feature Learning Theory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-400 font-medium">
            <div className="space-y-2">
              <span className="text-[10px] text-[#22d3ee] font-extrabold uppercase tracking-widest block">01 / Low-Level Convolutions</span>
              <p className="leading-relaxed text-slate-350">
                In the earliest layers, the receptive field is very small. Convolutions operate over small 3x3 neighborhoods. These layers act as local mathematical gradient checkers, highlighting high-frequency changes in pixels (which represent edges, angles, and color borders).
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block">02 / Mid-Level Combinations</span>
              <p className="leading-relaxed text-slate-350">
                As features travel deeper and pass through pooling/stride steps, the spatial map shrinks, causing downstream receptive fields to cover larger portions of the input space. These intermediate layers combine primitive edges to build complex texture grids, meshes, and basic shapes.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">03 / High-Level Semantics</span>
              <p className="leading-relaxed text-slate-350">
                At the final stages, the receptive field covers almost the entire image grid. Here, the network combines mid-level parts to identify full object patterns (e.g. cat ears/nose). Spatial orientation is discarded (invariance) in favor of high-level category recognition.
              </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
