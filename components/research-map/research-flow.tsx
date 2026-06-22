'use client';

import { useEffect, useMemo, useRef, memo } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, ConnectionMode,
  ReactFlowInstance, Node, Edge, Handle, Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import papersData from '@/data/papers.json';

// Local fallbacks for foundational papers not present in papers.json
const FOUNDATIONAL_PAPERS = [
  {
    id: "lenet",
    modelIds: ["lenet"],
    title: "Gradient-Based Learning Applied to Document Recognition",
    authors: ["Yann LeCun", "Léon Bottou", "Yoshua Bengio", "Patrick Haffner"],
    year: 1998,
    contribution: "Introduced Convolutional Neural Networks (CNNs), weight sharing, local receptive fields, and pooling layer concepts.",
    problem: "Early pattern recognition methods relied on manual feature extraction and fully connected layers which blew up parameters and ignored spatial features.",
    strengths: [
      "Pioneered convolutions and subsampling grids",
      "Successfully deployed for reading bank checks globally"
    ],
    weaknesses: [
      "Constrained by 1990s CPU compute power, limits depth to 5 layers",
      "Saturating activations (tanh/sigmoid) restricted layer backpropagation"
    ],
    legacy: "Formulated the foundational core blocks of all modern computer vision systems.",
    relevance: "Historically critical; LeNet-5 is the 'Hello World' architecture of Deep Learning.",
    paperUrl: "http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf"
  },
  {
    id: "alexnet",
    modelIds: ["alexnet"],
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    authors: ["Alex Krizhevsky", "Ilya Sutskever", "Geoffrey E. Hinton"],
    year: 2012,
    contribution: "Pioneered GPU-accelerated deep CNN training, ReLU activations, and dropout regularization, winning ImageNet 2012.",
    problem: "Traditional computer vision algorithms stalled at ~26% error rate on ImageNet; deeper networks were too slow to train on CPUs.",
    strengths: [
      "Achieved massive 10%+ accuracy jump over shallow algorithms",
      "Popularized ReLU activation function, speeding up training 6x"
    ],
    weaknesses: [
      "Prone to overfitting (required heavy Dropout and Data Augmentation)",
      "Ad-hoc layout decisions lacked homogeneous design guidelines"
    ],
    legacy: "Sparked the modern Deep Learning and AI boom, establishing GPU acceleration as the industry standard.",
    relevance: "Pioneered the core layers (ReLU, MaxPool, Dropout, Dense) used in modern CNN training pipelines.",
    paperUrl: "https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf"
  }
];

const ALL_PAPERS = [...FOUNDATIONAL_PAPERS, ...papersData];

// Custom Paper Node Component for React Flow (memoized to prevent redundant renders)
const PaperNode = memo(function PaperNode({ data }: { data: any }) {
  const colorMap: Record<string, string> = {
    Foundational: 'border-lime-500/30 text-lime-400 bg-lime-500/[0.02]',
    VGG: 'border-blue-500/30 text-blue-400 bg-blue-500/[0.02]',
    ResNet: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.02]',
    DenseNet: 'border-violet-500/30 text-violet-400 bg-violet-500/[0.02]',
    Inception: 'border-amber-500/30 text-amber-400 bg-amber-500/[0.02]',
    Xception: 'border-pink-500/30 text-pink-400 bg-pink-500/[0.02]',
    MobileNet: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/[0.02]',
    EfficientNet: 'border-orange-500/30 text-orange-400 bg-orange-500/[0.02]',
    NASNet: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/[0.02]',
    Transformer: 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/[0.02]'
  };

  const styleClass = colorMap[data.category] || 'border-slate-700 text-slate-300 bg-slate-800/10';

  return (
    <div className={`p-3 rounded-xl border w-[190px] transition-all duration-300 glass-card bg-slate-950/90 cursor-pointer ${
      data.isSelected 
        ? 'border-[#22d3ee] ring-2 ring-[#22d3ee]/80 shadow-[0_0_12px_rgba(34,211,238,0.25)] scale-[1.02]' 
        : 'border-border/40 hover:border-slate-300/30'
    }`}>
      {/* Top Tag row */}
      <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider">
        <span className={data.isSelected ? 'text-[#22d3ee]' : styleClass.split(' ')[1]}>{data.category}</span>
        <span className="text-slate-500">{data.year}</span>
      </div>

      {/* Title */}
      <h3 className="text-xs font-black text-slate-100 truncate mt-1.5" title={data.title}>
        {data.name}
      </h3>
      <p className="text-[9px] text-slate-500 font-bold truncate mt-0.5" title={data.authors.join(', ')}>
        {data.authors[0]} et al.
      </p>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-slate-750 !border-slate-900 rounded-full" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-slate-750 !border-slate-900 rounded-full" />
    </div>
  );
});

const nodeTypes = {
  paperNode: PaperNode,
};

interface ResearchFlowProps {
  selectedPaperId: string;
  onSelectPaper: (id: string) => void;
}

export default function ResearchFlow({ selectedPaperId, onSelectPaper }: ResearchFlowProps) {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  // 1. Compile DAG Nodes (Static Structure)
  const initialNodes: Node[] = useMemo(() => {
    const layout = [
      { id: 'lenet', name: 'LeNet-5', year: 1998, category: 'Foundational', x: 260, y: 0 },
      { id: 'alexnet', name: 'AlexNet', year: 2012, category: 'Foundational', x: 260, y: 110 },
      { id: 'vgg', name: 'VGG', year: 2014, category: 'VGG', x: 110, y: 220 },
      { id: 'inception', name: 'Inception', year: 2015, category: 'Inception', x: -40, y: 330 },
      { id: 'resnet', name: 'ResNet', year: 2015, category: 'ResNet', x: 410, y: 220 },
      { id: 'resnetv2', name: 'ResNet V2', year: 2016, category: 'ResNet', x: 530, y: 330 },
      { id: 'densenet', name: 'DenseNet', year: 2016, category: 'DenseNet', x: 670, y: 330 },
      { id: 'xception', name: 'Xception', year: 2016, category: 'Xception', x: -40, y: 440 },
      { id: 'nasnet', name: 'NASNet', year: 2017, category: 'NASNet', x: 110, y: 440 },
      { id: 'mobilenet', name: 'MobileNet', year: 2017, category: 'MobileNet', x: 270, y: 330 },
      { id: 'mobilenetv3', name: 'MobileNetV3', year: 2019, category: 'MobileNet', x: 210, y: 440 },
      { id: 'efficientnet', name: 'EfficientNet', year: 2019, category: 'EfficientNet', x: 350, y: 440 },
      { id: 'vit', name: 'ViT (Transformer)', year: 2020, category: 'Transformer', x: 530, y: 550 },
      { id: 'swin', name: 'Swin Transformer', year: 2021, category: 'Transformer', x: 660, y: 660 },
      { id: 'convnext', name: 'ConvNeXt', year: 2022, category: 'Transformer', x: 350, y: 550 },
      { id: 'maxvit', name: 'MaxViT', year: 2022, category: 'Transformer', x: 500, y: 770 }
    ];

    return layout.map(node => {
      const paperObj = ALL_PAPERS.find(p => p.id === node.id);
      return {
        id: node.id,
        type: 'paperNode',
        position: { x: node.x, y: node.y },
        data: {
          id: node.id,
          name: node.name,
          title: paperObj?.title ?? '',
          authors: paperObj?.authors ?? ['Unknown'],
          year: node.year,
          category: node.category,
          isSelected: node.id === selectedPaperId
        }
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Compile DAG Edges (Static Structure)
  const initialEdges: Edge[] = useMemo(() => {
    const connections = [
      { source: 'lenet', target: 'alexnet' },
      { source: 'alexnet', target: 'vgg' },
      { source: 'alexnet', target: 'resnet' },
      { source: 'vgg', target: 'inception' },
      { source: 'vgg', target: 'resnet' },
      { source: 'inception', target: 'xception' },
      { source: 'resnet', target: 'resnetv2' },
      { source: 'resnet', target: 'densenet' },
      { source: 'resnet', target: 'mobilenet' },
      { source: 'resnet', target: 'nasnet' },
      { source: 'mobilenet', target: 'mobilenetv3' },
      { source: 'nasnet', target: 'mobilenetv3' },
      { source: 'resnet', target: 'efficientnet' },
      { source: 'mobilenet', target: 'efficientnet' },
      { source: 'resnet', target: 'convnext' },
      { source: 'vit', target: 'swin' },
      { source: 'vit', target: 'convnext' },
      { source: 'swin', target: 'maxvit' },
      { source: 'efficientnet', target: 'maxvit' },
      { source: 'convnext', target: 'maxvit' }
    ];

    return connections.map((conn, idx) => {
      const isSourceSelected = conn.source === selectedPaperId;
      const isTargetSelected = conn.target === selectedPaperId;
      const isRelevant = isSourceSelected || isTargetSelected;

      return {
        id: `e_${conn.source}_${conn.target}_${idx}`,
        source: conn.source,
        target: conn.target,
        type: 'smoothstep',
        animated: isRelevant,
        style: {
          stroke: isRelevant ? '#22d3ee' : 'rgba(100, 116, 139, 0.25)',
          strokeWidth: isRelevant ? 2.2 : 1.2,
          transition: 'stroke 0.3s, stroke-width 0.3s'
        }
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update selection status for nodes in-place without rebuilding the array
  useEffect(() => {
    setNodes(prevNodes => {
      let changed = false;
      const nextNodes = prevNodes.map(node => {
        const isSelected = node.id === selectedPaperId;
        if (node.data.isSelected !== isSelected) {
          changed = true;
          return {
            ...node,
            data: {
              ...node.data,
              isSelected,
            },
          };
        }
        return node;
      });
      return changed ? nextNodes : prevNodes;
    });
  }, [selectedPaperId, setNodes]);

  // Update selection status for edges in-place without rebuilding the array
  useEffect(() => {
    setEdges(prevEdges => {
      let changed = false;
      const nextEdges = prevEdges.map(edge => {
        const isSourceSelected = edge.source === selectedPaperId;
        const isTargetSelected = edge.target === selectedPaperId;
        const isRelevant = isSourceSelected || isTargetSelected;

        const currentStroke = edge.style?.stroke;
        const currentStrokeWidth = edge.style?.strokeWidth;
        const targetStroke = isRelevant ? '#22d3ee' : 'rgba(100, 116, 139, 0.25)';
        const targetStrokeWidth = isRelevant ? 2.2 : 1.2;

        if (
          edge.animated !== isRelevant ||
          currentStroke !== targetStroke ||
          currentStrokeWidth !== targetStrokeWidth
        ) {
          changed = true;
          return {
            ...edge,
            animated: isRelevant,
            style: {
              ...edge.style,
              stroke: targetStroke,
              strokeWidth: targetStrokeWidth,
            },
          };
        }
        return edge;
      });
      return changed ? nextEdges : prevEdges;
    });
  }, [selectedPaperId, setEdges]);

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.1, duration: 800 });
    }, 100);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onSelectPaper(node.id)}
      onPaneClick={() => onSelectPaper('resnet')}
      onInit={onInit}
      fitView
      connectionMode={ConnectionMode.Loose}
      minZoom={0.1}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      className="font-sans"
    >
      <Background color="#334155" gap={20} size={1} style={{ opacity: 0.15 }} />
      <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" showInteractive={false} />
      <MiniMap 
        nodeColor="rgba(30, 41, 59, 0.8)"
        maskColor="rgba(2, 6, 23, 0.7)"
        className="!bg-slate-950/60 !border-slate-800/80 rounded-xl overflow-hidden"
      />
    </ReactFlow>
  );
}
