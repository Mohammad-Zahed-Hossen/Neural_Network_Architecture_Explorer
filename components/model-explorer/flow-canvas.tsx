'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, ConnectionMode,
  ReactFlowInstance, Node, Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NeuralNetworkModel } from '@/lib/types/model';
import { LayerType } from '@/lib/types/layer';
import CustomNode from './custom-node';

interface FlowCanvasProps {
  model: NeuralNetworkModel;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
}

// Register our custom layerNode renderer
const nodeTypes = {
  layerNode: CustomNode,
};

export default function FlowCanvas({ model, selectedLayerId, onSelectLayer }: FlowCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<Set<LayerType>>(new Set());
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const allLayerTypes = useMemo(() => {
    const types = new Set<LayerType>();
    model.architecture.layers.forEach(l => types.add(l.type));
    return Array.from(types);
  }, [model.architecture.layers]);

  const toggleType = (type: LayerType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const isVisible = (layerId: string) => {
    const layer = model.architecture.layers.find(l => l.id === layerId);
    return layer ? !hiddenTypes.has(layer.type) : true;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Format tensor shapes [null, 112, 112, 64] -> "112×112×64"
  const formatShape = (dims: (number | null)[]) => {
    const clean = dims.filter(d => d !== null);
    return clean.length > 0 ? clean.join('×') : 'Flat';
  };

  // 1. Dynamic Nodes compilation
  const initialNodes: Node[] = useMemo(() => {
    return model.architecture.layers
      .filter(layer => !hiddenTypes.has(layer.type))
      .map((layer, index) => {
        const isSelected = layer.id === selectedLayerId || 
          (layer.layerIds && layer.layerIds.includes(selectedLayerId || ''));
        return {
          id: layer.id,
          type: 'layerNode',
          position: {
            x: layer.position?.x ?? 250,
            y: layer.position?.y ?? index * 180,
          },
          data: {
            id: layer.id,
            name: layer.name,
            type: layer.type,
            outputShape: formatShape(layer.outputShape.dimensions),
            parametersTotal: layer.parameters.total,
            isSelected,
            educationalSummary: layer.educationalNote.summary,
          },
        };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.id, hiddenTypes]);

  // 2. Dynamic Edges compilation
  const initialEdges: Edge[] = useMemo(() => {
    if (!model.architecture.connections) return [];

    return model.architecture.connections
      .filter(conn => isVisible(conn.sourceId) && isVisible(conn.targetId))
      .map((conn) => {
        const isSkip = conn.type === 'skip';
        
        const srcNode = model.architecture.layers.find(l => l.id === conn.sourceId);
        const tgtNode = model.architecture.layers.find(l => l.id === conn.targetId);
        
        const isSourceSelected = conn.sourceId === selectedLayerId ||
          (srcNode?.layerIds && srcNode.layerIds.includes(selectedLayerId || ''));
        const isTargetSelected = conn.targetId === selectedLayerId ||
          (tgtNode?.layerIds && tgtNode.layerIds.includes(selectedLayerId || ''));
          
        const isRelevant = isSourceSelected || isTargetSelected;

        return {
          id: conn.id,
          source: conn.sourceId,
          target: conn.targetId,
          type: 'smoothstep',
          animated: isSkip || (selectedLayerId !== null && isRelevant),
          style: {
            stroke: isRelevant 
              ? model.colorTheme 
              : (isSkip ? '#c084fc' : 'rgba(100, 116, 139, 0.4)'),
            strokeWidth: isRelevant ? 2.5 : (isSkip ? 1.5 : 1.2),
            strokeDasharray: isSkip ? '5,5' : undefined,
            transition: 'stroke 0.3s, stroke-width 0.3s',
          },
        };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.id, model.colorTheme, hiddenTypes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Update selection status for nodes in-place without rebuilding the array
  useEffect(() => {
    setNodes(prevNodes => {
      let changed = false;
      const nextNodes = prevNodes.map(node => {
        const layer = model.architecture.layers.find(l => l.id === node.id);
        const isSelected = node.id === selectedLayerId || 
          (layer?.layerIds && layer.layerIds.includes(selectedLayerId || ''));
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
  }, [selectedLayerId, model.architecture.layers, setNodes]);

  // Update selection status for edges in-place without rebuilding the array
  useEffect(() => {
    setEdges(prevEdges => {
      let changed = false;
      const nextEdges = prevEdges.map(edge => {
        const isSkip = model.architecture.connections?.find(c => c.id === edge.id)?.type === 'skip';
        const srcNode = model.architecture.layers.find(l => l.id === edge.source);
        const tgtNode = model.architecture.layers.find(l => l.id === edge.target);
        
        const isSourceSelected = edge.source === selectedLayerId ||
          (srcNode?.layerIds && srcNode.layerIds.includes(selectedLayerId || ''));
        const isTargetSelected = edge.target === selectedLayerId ||
          (tgtNode?.layerIds && tgtNode.layerIds.includes(selectedLayerId || ''));
          
        const isRelevant = isSourceSelected || isTargetSelected;
        const newAnimated = isSkip || (selectedLayerId !== null && isRelevant);
        const newStroke = isRelevant 
          ? model.colorTheme 
          : (isSkip ? '#c084fc' : 'rgba(100, 116, 139, 0.4)');
        const newStrokeWidth = isRelevant ? 2.5 : (isSkip ? 1.5 : 1.2);

        const currentStroke = edge.style?.stroke;
        const currentStrokeWidth = edge.style?.strokeWidth;

        if (
          edge.animated !== newAnimated ||
          currentStroke !== newStroke ||
          currentStrokeWidth !== newStrokeWidth
        ) {
          changed = true;
          return {
            ...edge,
            animated: newAnimated,
            style: {
              ...edge.style,
              stroke: newStroke,
              strokeWidth: newStrokeWidth,
            },
          };
        }
        return edge;
      });
      return changed ? nextEdges : prevEdges;
    });
  }, [selectedLayerId, model.colorTheme, model.architecture.connections, model.architecture.layers, setEdges]);

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.15, duration: 800 });
    }, 100);
  };

  useEffect(() => {
    const flowInstance = reactFlowRef.current;
    if (flowInstance) {
      setTimeout(() => {
        flowInstance.fitView({ padding: 0.15, duration: 800 });
      }, 100);
    }
  }, [model.id, hiddenTypes]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-950/20 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mounting node graph...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden select-none" style={{ height: '100%' }}>
      {/* Layer Type Filter */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-120px)]">
        {allLayerTypes.map(type => {
          const isHidden = hiddenTypes.has(type);
          const colorMap: Record<string, string> = {
            input: '#10b981',
            conv2d: '#3b82f6',
            batch_norm: '#64748b',
            activation: '#ec4899',
            max_pooling2d: '#f59e0b',
            average_pooling2d: '#f59e0b',
            global_average_pooling2d: '#f59e0b',
            flatten: '#f97316',
            dense: '#8b5cf6',
            dropout: '#64748b',
            add: '#ef4444',
            concatenate: '#06b6d4',
            bottleneck: '#3b82f6',
            dense_block: '#3b82f6',
            transition_block: '#f59e0b',
            output: '#64748b',
          };
          const color = colorMap[type] || '#64748b';
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer"
              style={{
                backgroundColor: isHidden ? 'transparent' : `${color}15`,
                borderColor: isHidden ? 'rgba(100,116,139,0.2)' : `${color}40`,
                color: isHidden ? '#64748b' : color,
                opacity: isHidden ? 0.5 : 1,
              }}
              title={isHidden ? `Show ${type}` : `Hide ${type}`}
            >
              {type === 'conv2d' ? 'Conv2D' : type.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectLayer(node.id)}
        onPaneClick={() => onSelectLayer(null)}
        onInit={onInit}
        fitView
        connectionMode={ConnectionMode.Loose}
        minZoom={0.05}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="font-sans"
      >
        <Background color="#334155" gap={20} size={1} style={{ opacity: 0.3 }} />
        
        <Controls 
          className="!bg-slate-900 !border-slate-800 !text-slate-300 [&_button]:!border-slate-800 [&_button]:hover:!bg-slate-800 [&_button_svg]:!fill-slate-350 [&_button_svg]:!stroke-slate-350"
          showInteractive={false} 
        />
        
        <MiniMap 
          nodeColor={(node: Node) => {
            if (node.data?.isSelected) return '#22d3ee';
            return 'rgba(30, 41, 59, 0.8)';
          }}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="!bg-slate-950/60 !border-slate-800/80 rounded-xl overflow-hidden !w-[100px] !h-[100px]"
          style={{ width: 120, height: 120 }}
        />
      </ReactFlow>
    </div>
  );
}
