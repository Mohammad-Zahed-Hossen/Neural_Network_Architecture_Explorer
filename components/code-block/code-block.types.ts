export type FrameworkType = 'pytorch' | 'tensorflow' | 'keras' | 'huggingface' | 'jax' | 'onnx' | 'bash' | 'python';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CalloutType = 'why' | 'mistake' | 'tip' | 'strategy' | 'note';

export interface CodeSection {
  id: 'training_loop' | 'model_def' | 'data_pipeline' | 'fine_tuning' | string;
  label: string;
  startLine: number;
  endLine: number;
}

export interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  framework: FrameworkType;
  frameworkVersion?: string;
  code: string;
  highlightLines?: number[];
  sections?: CodeSection[];
}

export interface CodeVariant {
  id: string;
  label: string;
  framework: FrameworkType;
  icon?: string;
  snippets: CodeSnippet[]; // Supports multi-file tabs within a variant (e.g., model.py, train.py)
}

export interface TechnicalMetadata {
  frameworkVersion?: string;
  pythonVersion?: string;
  inputResolution?: string;
  dataset?: string;
  gpuRequirement?: 'Required' | 'Recommended' | 'Optional' | 'Not Needed';
  estimatedRuntime?: string;
  mixedPrecisionSupported?: boolean;
  fineTuningSupported?: boolean;
  customBadges?: string[];
}

export interface EducationalCallout {
  id: string;
  type: CalloutType;
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

export interface CodeBlockFooterInfo {
  exampleType?: string; // e.g. "Transfer Learning Example"
  estimatedReadingTime?: string; // e.g. "2 min read"
  dependencies?: string[];
  compatibleModels?: string[];
  downloadUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
}

export interface CodeBlockProps {
  // Primary Info
  modelName: string;
  subtitle?: string;
  difficulty?: DifficultyLevel;
  isTransferLearning?: boolean;
  implementationType?: string;
  exampleCategory?: string;
  isProductionReady?: boolean;

  // Engineering & Model Metadata
  metadata?: TechnicalMetadata;

  // Code Content (Supports single code snippet OR multi-variant / multi-file tabs)
  variants?: CodeVariant[];
  // Shortcut props if passing a single snippet:
  code?: string;
  language?: string;
  framework?: FrameworkType;
  filename?: string;
  highlightLines?: number[];
  sections?: CodeSection[];

  // Behavior Settings
  initialLinesVisible?: number; // Defaults to 18
  collapsible?: boolean;
  showLineNumbers?: boolean;

  // Educational Content & Footer
  callouts?: EducationalCallout[];
  footer?: CodeBlockFooterInfo;

  // Custom styling override
  className?: string;
}
