import { formatShortNumber, formatAccuracy, formatMemory, formatFLOPs, formatNumber } from '../utils/formatters';

export type MetricCategory = 'Architecture' | 'Performance' | 'Resources' | 'Research' | 'Structure' | 'Efficiency' | 'Training';
export type ComparisonMode = 'higher' | 'lower' | 'informational' | 'none';

export interface ComparisonMetricDefinition {
  id: string;
  label: string;
  category: MetricCategory;
  unit: string;
  sortDirection: 'asc' | 'desc';
  higherIsBetter?: boolean;
  comparisonMode: ComparisonMode;
  format: (value: number | string) => string;
  getRawNumber?: (value: number | string) => number;
  description: string;
  educationalDescription: string;
  visualizationSupport: ('bar' | 'radar' | 'table')[];
}

/**
 * Metric Registry - Single source of truth for metric metadata, formatters, and comparison directions.
 */
export class MetricRegistry {
  private static instance: MetricRegistry;
  private metricsMap = new Map<string, ComparisonMetricDefinition>();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): MetricRegistry {
    if (!MetricRegistry.instance) {
      MetricRegistry.instance = new MetricRegistry();
    }
    return MetricRegistry.instance;
  }

  public register(def: ComparisonMetricDefinition): void {
    this.metricsMap.set(def.id, def);
  }

  public get(id: string): ComparisonMetricDefinition | undefined {
    return this.metricsMap.get(id);
  }

  public getAll(): ComparisonMetricDefinition[] {
    return Array.from(this.metricsMap.values());
  }

  private registerDefaults(): void {
    // Parameters (Trainable Weights Count)
    this.register({
      id: 'parameters',
      label: 'Parameters',
      category: 'Architecture',
      unit: '',
      sortDirection: 'asc',
      higherIsBetter: false,
      comparisonMode: 'lower',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return num > 10000 ? formatShortNumber(num) : `${num} M`;
      },
      getRawNumber: (val) => (typeof val === 'number' ? val : parseFloat(String(val)) || 0),
      description: 'Total trainable weight parameters',
      educationalDescription: 'Smaller parameter count requires less storage and bandwidth, enabling deployment on edge/mobile devices.',
      visualizationSupport: ['bar', 'radar', 'table'],
    });

    // FLOPs (Floating Point Operations)
    this.register({
      id: 'flops',
      label: 'FLOPs',
      category: 'Architecture',
      unit: '',
      sortDirection: 'asc',
      higherIsBetter: false,
      comparisonMode: 'lower',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return formatFLOPs(num);
      },
      getRawNumber: (val) => (typeof val === 'number' ? val : parseFloat(String(val)) || 0),
      description: 'Floating point operations per forward pass',
      educationalDescription: 'FLOPs measure computational complexity. Fewer FLOPs mean faster inference and lower battery consumption.',
      visualizationSupport: ['bar', 'radar', 'table'],
    });

    // Top-1 Accuracy
    this.register({
      id: 'accuracy',
      label: 'Top-1 Accuracy',
      category: 'Performance',
      unit: '%',
      sortDirection: 'desc',
      higherIsBetter: true,
      comparisonMode: 'higher',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return num <= 1.0 ? formatAccuracy(num) : `${num.toFixed(1)}%`;
      },
      getRawNumber: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val)) || 0;
        return num <= 1.0 ? num * 100 : num;
      },
      description: 'ImageNet Top-1 classification accuracy',
      educationalDescription: 'Top-1 accuracy indicates the percentage of validation images where the model\'s highest-probability prediction was correct.',
      visualizationSupport: ['bar', 'radar', 'table'],
    });

    // Top-5 Accuracy
    this.register({
      id: 'top5Accuracy',
      label: 'Top-5 Accuracy',
      category: 'Performance',
      unit: '%',
      sortDirection: 'desc',
      higherIsBetter: true,
      comparisonMode: 'higher',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return num <= 1.0 ? formatAccuracy(num) : `${num.toFixed(1)}%`;
      },
      getRawNumber: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val)) || 0;
        return num <= 1.0 ? num * 100 : num;
      },
      description: 'ImageNet Top-5 classification accuracy',
      educationalDescription: 'Top-5 accuracy indicates whether the true target label was present among the top 5 model predictions.',
      visualizationSupport: ['bar', 'table'],
    });

    // Depth (Layer Count)
    this.register({
      id: 'depth',
      label: 'Network Depth',
      category: 'Architecture',
      unit: 'layers',
      sortDirection: 'asc',
      higherIsBetter: false,
      comparisonMode: 'lower',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return `${num} Layers`;
      },
      getRawNumber: (val) => (typeof val === 'number' ? val : parseFloat(String(val)) || 0),
      description: 'Total sequential layer count',
      educationalDescription: 'Deeper networks extract richer hierarchical representations, but can suffer from vanishing gradients without skip connections.',
      visualizationSupport: ['bar', 'radar', 'table'],
    });

    // Memory Footprint (VRAM)
    this.register({
      id: 'memory',
      label: 'Memory Footprint',
      category: 'Resources',
      unit: 'MB',
      sortDirection: 'asc',
      higherIsBetter: false,
      comparisonMode: 'lower',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return formatMemory(num);
      },
      getRawNumber: (val) => (typeof val === 'number' ? val : parseFloat(String(val)) || 0),
      description: 'Peak GPU memory during inference',
      educationalDescription: 'Lower memory usage allows running multiple model instances concurrently and fitting within embedded VRAM constraints.',
      visualizationSupport: ['bar', 'radar', 'table'],
    });

    // Inference Speed / Throughput
    this.register({
      id: 'speed',
      label: 'Inference Speed',
      category: 'Performance',
      unit: 'FPS',
      sortDirection: 'desc',
      higherIsBetter: true,
      comparisonMode: 'higher',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return `${num} FPS`;
      },
      getRawNumber: (val) => (typeof val === 'number' ? val : parseFloat(String(val)) || 0),
      description: 'Inference throughput in frames per second',
      educationalDescription: 'Higher FPS enables real-time processing applications like video analytics and autonomous driving.',
      visualizationSupport: ['bar', 'table'],
    });

    // Year
    this.register({
      id: 'year',
      label: 'Publication Year',
      category: 'Research',
      unit: '',
      sortDirection: 'desc',
      comparisonMode: 'informational',
      format: (val) => String(val),
      getRawNumber: (val) => (typeof val === 'number' ? val : parseInt(String(val), 10) || 0),
      description: 'Paper release or publication year',
      educationalDescription: 'Traces the chronological evolution and timeline of architectural advancements.',
      visualizationSupport: ['table'],
    });

    // Citations
    this.register({
      id: 'citations',
      label: 'Citations',
      category: 'Research',
      unit: '',
      sortDirection: 'desc',
      higherIsBetter: true,
      comparisonMode: 'higher',
      format: (val) => {
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(num)) return String(val);
        return formatNumber(num);
      },
      getRawNumber: (val) => (typeof val === 'number' ? val : parseFloat(String(val)) || 0),
      description: 'Academic paper citation count',
      educationalDescription: 'Citation volume reflects academic impact and widespread foundational adoption in the AI research community.',
      visualizationSupport: ['bar', 'table'],
    });
  }
}

export const metricRegistry = MetricRegistry.getInstance();
