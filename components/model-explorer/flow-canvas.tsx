'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, 
  useNodesState, useEdgesState, ConnectionMode,
  ReactFlowInstance, Node, Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Connection, GroupedEdge, GroupedNode, Layer, LayerType, NeuralNetworkModel } from '@/lib/schema/model.schema';
import CustomNode from './custom-node';

import { 
  Maximize2, RotateCcw, Map as MapIcon, ArrowDown, Layers, Activity
} from 'lucide-react';

interface FlowCanvasProps {
  topology:
    | { mode: 'detailed'; model: NeuralNetworkModel }
    | { mode: 'grouped'; id: string; groupedNodes: GroupedNode[]; groupedEdges: GroupedEdge[]; colorTheme: string };
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
}

// Register our custom layerNode renderer
const nodeTypes = {
  layerNode: CustomNode,
};

export default function FlowCanvas({ topology, selectedLayerId, onSelectLayer }: FlowCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<Set<LayerType>>(new Set());
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const graphId = topology.mode === 'detailed' ? topology.model.id : `${topology.id}:grouped`;
  const colorTheme = topology.mode === 'detailed' ? topology.model.colorTheme : topology.colorTheme;

  const layers = useMemo<Layer[]>(() => {
    if (topology.mode === 'detailed') return topology.model.architecture.layers;

    // Grouped mode: ensure any fields that must come from the canonical Layer
    // definition are sourced from architecture.layers via id.
    const architectureLayers = topology.mode === 'grouped'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (topology as any).model?.architecture?.layers ?? []
      : [];

    return topology.groupedNodes.flatMap((groupNode) => {
      const canonicalLayersById = new Map<string, Layer>();
      (architectureLayers as Layer[]).forEach((l) => canonicalLayersById.set(l.id, l));

      return groupNode.layerIds.map((layerId) => {
        const canonical = canonicalLayersById.get(layerId);

        if (canonical) {
          return {
            ...canonical,
            position: groupNode.position,
          };
        }

        return {
          id: layerId,
          type: 'transition_block',
          name: groupNode.label,
          inputShape: { dimensions: [], description: '' },
          outputShape: { dimensions: [], description: '' },
          config: {},
          parameters: { total: 0, weights: 0, biases: 0, formula: '', calculationSteps: [] },
          educationalNote: {
            summary: groupNode.description,
            detailed: groupNode.description,
            whyItMatters: '',
            keyTakeaway: '',
          },
          position: groupNode.position,
          layerIds: groupNode.layerIds,
        } satisfies Layer;
      });
    });
  }, [topology]);

  const connections = useMemo<Connection[]>(() => {
    if (topology.mode === 'detailed') return topology.model.architecture.connections;

    return topology.groupedEdges.map((edge) => ({
      id: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      type: edge.type === 'skip' || edge.type === 'concatenate' || edge.type === 'add' ? edge.type : 'sequential',
    }));
  }, [topology]);

  const allLayerTypes = useMemo(() => {
    const types = new Set<LayerType>();
    layers.forEach(l => types.add(l.type));
    return Array.from(types);
  }, [layers]);

  const toggleType = (type: LayerType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const isVisible = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    return layer ? !hiddenTypes.has(layer.type) : true;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const formatShape = (dims: (number | null)[]) => {
    const clean = dims.filter(d => d !== null);
    return clean.length > 0 ? clean.join('×') : 'Flat';
  };

  const initialNodes: Node[] = useMemo(() => {
    return layers
      .filter(layer => !hiddenTypes.has(layer.type))
      .map((layer, index) => {
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
            isSelected: false,
            educationalSummary: layer.educationalNote.summary,
          },
        };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId, hiddenTypes, layers]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!connections) return [];

    return connections
      .filter(conn => isVisible(conn.sourceId) && isVisible(conn.targetId))
      .map((conn) => {
        const isSkip = conn.type === 'skip';

        return {
          id: conn.id,
          source: conn.sourceId,
          target: conn.targetId,
          type: 'smoothstep',
          animated: isSkip,
          style: {
            stroke: isSkip ? '#c084fc' : 'rgba(100, 116, 139, 0.4)',
            strokeWidth: isSkip ? 1.5 : 1.2,
            strokeDasharray: isSkip ? '5,5' : undefined,
            transition: 'stroke 0.3s, stroke-width 0.3s',
          },
        };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId, colorTheme, hiddenTypes, connections, layers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  useEffect(() => {
    setNodes(prevNodes => {
      let changed = false;
      const nextNodes = prevNodes.map(node => {
        const layer = layers.find(l => l.id === node.id);
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
  }, [selectedLayerId, layers, setNodes]);

  useEffect(() => {
    setEdges(prevEdges => {
      let changed = false;
      const nextEdges = prevEdges.map(edge => {
        const isSkip = connections?.find(c => c.id === edge.id)?.type === 'skip';
        const srcNode = layers.find(l => l.id === edge.source);
        const tgtNode = layers.find(l => l.id === edge.target);
        
        const isSourceSelected = edge.source === selectedLayerId ||
          (srcNode?.layerIds && srcNode.layerIds.includes(selectedLayerId || ''));
        const isTargetSelected = edge.target === selectedLayerId ||
          (tgtNode?.layerIds && tgtNode.layerIds.includes(selectedLayerId || ''));
          
        const isRelevant = isSourceSelected || isTargetSelected;
        const newAnimated = isSkip || (selectedLayerId !== null && isRelevant);
        const newStroke = isRelevant 
          ? colorTheme 
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
  }, [selectedLayerId, colorTheme, connections, layers, setEdges]);

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.15, duration: 800 });
      setZoomLevel(Math.round(instance.getZoom() * 100));
    }, 100);
  };

  const handleFitView = () => {
    if (reactFlowRef.current) {
      reactFlowRef.current.fitView({ padding: 0.15, duration: 600 });
    }
  };

  const handleResetZoom = () => {
    if (reactFlowRef.current) {
      reactFlowRef.current.setViewport({ zoom: 1, x: 0, y: 0 }, { duration: 500 });
    }
  };

  useEffect(() => {
    const flowInstance = reactFlowRef.current;
    if (flowInstance) {
      setTimeout(() => {
        flowInstance.fitView({ padding: 0.15, duration: 800 });
        setZoomLevel(Math.round(flowInstance.getZoom() * 100));
      }, 100);
    }
  }, [graphId, hiddenTypes]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-950/20 rounded-2xl flex items-center justify-center animate-pulse border border-border/20">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mounting node graph...</span>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const selectedLayerName = layers.find(l => l.id === selectedLayerId)?.name;

  return (
    <div className="w-full h-full relative overflow-hidden select-none flex flex-col" style={{ height: '100%' }}>
      {/* Top Header & Layer Type Filters Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Layer Type Filters */}
        <div className="flex flex-wrap gap-1.5 max-w-[calc(100%-140px)] pointer-events-auto bg-slate-950/80 p-1.5 rounded-xl border border-border/20 backdrop-blur-md shadow-md">
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
                className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer"
                style={{
                  backgroundColor: isHidden ? 'transparent' : `${color}20`,
                  borderColor: isHidden ? 'rgba(100,116,139,0.2)' : `${color}50`,
                  color: isHidden ? '#64748b' : color,
                  opacity: isHidden ? 0.4 : 1,
                }}
                title={isHidden ? `Show ${type}` : `Hide ${type}`}
              >
                {type === 'conv2d' ? 'Conv2D' : type.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/90 p-1.5 rounded-xl border border-border/20 backdrop-blur-md shadow-md">
          <button
            onClick={handleFitView}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg transition-all"
            title="Fit graph to view"
          >
            <Maximize2 className="h-3 w-3 text-primary" />
            <span className="hidden sm:inline">Fit View</span>
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
            title="Reset Zoom to 100%"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          {!isMobile && (
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`p-1 border rounded-lg transition-all ${
                showMiniMap ? 'bg-primary/20 text-primary border-primary/40' : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title={showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'}
            >
              <MapIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        {/* Graph Direction Overlay Label */}
        <div className="absolute top-16 right-4 z-0 pointer-events-none flex items-center gap-1.5 bg-slate-950/40 border border-border/10 rounded-full px-3 py-1 backdrop-blur-xs text-[10px] font-semibold text-slate-500">
          <span>Input Stem</span>
          <ArrowDown className="h-3 w-3 text-slate-400 animate-bounce" />
          <span>Output Head</span>
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
          onMove={(_, viewport) => setZoomLevel(Math.round(viewport.zoom * 100))}
          fitView
          connectionMode={ConnectionMode.Loose}
          minZoom={0.05}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="font-sans"
        >
          <Background color="#334155" gap={20} size={1} style={{ opacity: 0.25 }} />
          
          <Controls
            className="!bg-slate-900/90 !border-slate-800 !text-slate-300 [&_button]:!border-slate-800 [&_button]:hover:!bg-slate-800 [&_button_svg]:!fill-slate-350 [&_button_svg]:!stroke-slate-350 !bottom-10"
            showInteractive={false}
          />

          {!isMobile && showMiniMap && (
            <MiniMap
              nodeColor={(node: Node) => {
                if (node.data?.isSelected) return '#22d3ee';
                return 'rgba(30, 41, 59, 0.8)';
              }}
              maskColor="rgba(2, 6, 23, 0.75)"
              className="!bg-slate-950/80 !border-slate-800/80 rounded-xl overflow-hidden shadow-2xl !bottom-10"
              style={{ width: 120, height: 110 }}
            />
          )}
        </ReactFlow>
      </div>

      {/* Canvas Integrated Bottom Status Bar */}
      <div className="h-8 bg-slate-950/90 border-t border-border/20 px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0 select-none backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300 font-sans font-bold">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span className="uppercase text-[9px] tracking-wider text-slate-400 font-extrabold">{topology.mode} Mode</span>
          </span>
          <span className="hidden min-[450px]:inline text-slate-600">|</span>
          <span className="hidden min-[450px]:inline text-slate-400">Nodes: <strong className="text-slate-200">{nodes.length}</strong></span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">Edges: <strong className="text-slate-200">{edges.length}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {selectedLayerName ? (
            <span className="text-primary font-sans font-bold truncate max-w-[140px] sm:max-w-[220px]">
              Selected: {selectedLayerName}
            </span>
          ) : (
            <span className="text-slate-500 font-sans italic text-[10px] hidden min-[380px]:inline">
              Click node to inspect
            </span>
          )}
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px]">
            {zoomLevel}%
          </span>
        </div>
      </div>
    </div>
  );
}
