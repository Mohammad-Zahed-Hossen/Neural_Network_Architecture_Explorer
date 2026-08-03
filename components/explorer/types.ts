export type NodeType =
  | 'input'
  | 'weight-block'
  | 'operation'
  | 'layer'
  | 'output'
  | 'controller'
  | 'token'
  | 'component';

export type NodeShape = 'rect' | 'circle' | 'pill';

export interface ExplorerNodeData {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  role: string;
  purpose: string;
  informationFlow: string;
  educationalNotes?: string[];
  relatedConcepts?: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  shape?: NodeShape;
  strokeColor?: string;
  fillColor?: string;
  textColor?: string;
  badge?: string;
}

export type EdgeType = 'sequential' | 'skip' | 'concatenation' | 'feedback' | 'projection';

export interface ExplorerEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: EdgeType;
  color?: string;
  dashed?: boolean;
  markerEnd?: string;
  pathD?: string; // Custom path SVG d attribute
}

export interface ExplorerBlueprintData {
  patternId: string;
  title: string;
  description: string;
  viewBox?: string;
  nodes: ExplorerNodeData[];
  edges: ExplorerEdgeData[];
}

export interface ExplorerState {
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  focusedLayerId: string | null;
  expandedGroups: string[];
}

export interface ExplorerNodeProps {
  node: ExplorerNodeData;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

export interface ExplorerEdgeProps {
  edge: ExplorerEdgeData;
  sourceNode?: ExplorerNodeData;
  targetNode?: ExplorerNodeData;
  isHighlighted: boolean;
}

export interface ExplorerCanvasProps {
  blueprint: ExplorerBlueprintData;
  state: ExplorerState;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (id: string) => void;
}

export interface LayerExplorerProps {
  nodes: ExplorerNodeData[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
}

export interface ComponentInspectorProps {
  selectedNode: ExplorerNodeData | null;
  onClearSelection: () => void;
}

export interface ArchitectureExplorerProps {
  patternId: string;
  patternName: string;
}
