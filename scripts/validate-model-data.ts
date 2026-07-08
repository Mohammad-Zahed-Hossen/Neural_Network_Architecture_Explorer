import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ModelSummarySchema, NeuralNetworkModelSchema, ModelSummary, NeuralNetworkModel } from '../lib/schema/model.schema';

const PROJECT_ROOT = process.cwd();
const MODELS_JSON_PATH = join(PROJECT_ROOT, 'data/models.json');
const CANONICAL_MODELS_DIR = join(PROJECT_ROOT, 'data/models');

interface ValidationReport {
  modelId: string;
  summaryErrors: string[];
  modelErrors: string[];
  missingLayerReferences: string[];
  fieldMismatches: string[];
}

function loadJson<T>(path: string): T {
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content) as T;
}

function formatIssues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): string[] {
  return error.issues.map((issue) => `${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`);
}

function checkLayerReferences(model: NeuralNetworkModel): string[] {
  const errors: string[] = [];
  const layers = model.architecture?.layers ?? [];
  const layerIds = new Set(layers.map((layer) => layer.id));

  for (const connection of model.architecture?.connections ?? []) {
    if (!layerIds.has(connection.sourceId)) {
      errors.push(`Connection "${connection.id}" references missing source layer "${connection.sourceId}".`);
    }
    if (!layerIds.has(connection.targetId)) {
      errors.push(`Connection "${connection.id}" references missing target layer "${connection.targetId}".`);
    }
  }

  for (const group of model.architecture?.groups ?? []) {
    for (const layerId of group.layerIds ?? []) {
      if (!layerIds.has(layerId)) {
        errors.push(`Group "${group.id}" references missing layer "${layerId}".`);
      }
    }
  }

  const layout = model.architecture?.layout;
  if (layout) {
    const layoutNodeIds = new Set((layout.nodes ?? []).map((node) => node.id));

    for (const edge of layout.edges ?? []) {
      if (edge.source && !layoutNodeIds.has(edge.source)) {
        errors.push(`Layout edge "${edge.id}" references missing source node "${edge.source}".`);
      }
      if (edge.target && !layoutNodeIds.has(edge.target)) {
        errors.push(`Layout edge "${edge.id}" references missing target node "${edge.target}".`);
      }
    }

    for (const group of layout.groups ?? []) {
      for (const layerId of group.layerIds ?? []) {
        if (!layerIds.has(layerId)) {
          errors.push(`Layout group "${group.id}" references missing layer "${layerId}".`);
        }
      }
    }
  }

  return errors;
}

function compareSummaryToModel(summary: ModelSummary, model: NeuralNetworkModel): string[] {
  const comparisons: Array<[string, unknown, unknown]> = [
    ['totalParameters', summary.totalParameters, model.totalParameters],
    ['totalFLOPs', summary.totalFLOPs, model.totalFLOPs],
    ['top1Accuracy', summary.top1Accuracy, model.top1Accuracy],
    ['top5Accuracy', summary.top5Accuracy, model.top5Accuracy],
    ['memoryUsage', summary.memoryUsage, model.memoryUsage],
    ['depth', summary.depth, model.depth],
    ['colorTheme', summary.colorTheme, model.colorTheme],
  ];

  return comparisons.flatMap(([field, summaryValue, modelValue]) => {
    if (typeof summaryValue === 'number' && typeof modelValue === 'number') {
      return Math.abs(summaryValue - modelValue) > 0.001
        ? [`${field}: data/models.json=${summaryValue}, data/models/${summary.id}.json=${modelValue}`]
        : [];
    }

    return summaryValue !== modelValue
      ? [`${field}: data/models.json=${summaryValue}, data/models/${summary.id}.json=${modelValue}`]
      : [];
  });
}

function generateMarkdownReport(reports: ValidationReport[], totalModels: number): string {
  let md = '# Model Data Validation Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Total models checked: ${totalModels}\n`;
  md += `Models with issues: ${reports.length}\n\n`;

  if (reports.length === 0) {
    md += 'No validation errors found across all canonical model files.\n';
    return md;
  }

  for (const report of reports) {
    md += `## Model: ${report.modelId}\n\n`;

    for (const [title, entries] of [
      ['Summary Schema Errors', report.summaryErrors],
      ['Model Schema Errors', report.modelErrors],
      ['Missing Layer References', report.missingLayerReferences],
      ['Summary Field Mismatches', report.fieldMismatches],
    ] as const) {
      if (entries.length > 0) {
        md += `### ${title}\n\n`;
        for (const entry of entries) {
          md += `- ${entry}\n`;
        }
        md += '\n';
      }
    }

    md += '---\n\n';
  }

  return md;
}

function main() {
  const summaries = loadJson<ModelSummary[]>(MODELS_JSON_PATH);
  const reports: ValidationReport[] = [];

  for (const summary of summaries) {
    const report: ValidationReport = {
      modelId: summary.id,
      summaryErrors: [],
      modelErrors: [],
      missingLayerReferences: [],
      fieldMismatches: [],
    };

    const summaryValidation = ModelSummarySchema.safeParse(summary);
    if (!summaryValidation.success) {
      report.summaryErrors = formatIssues(summaryValidation.error);
    }

    try {
      const model = loadJson<NeuralNetworkModel>(join(CANONICAL_MODELS_DIR, `${summary.id}.json`));
      const modelValidation = NeuralNetworkModelSchema.safeParse(model);
      if (!modelValidation.success) {
        report.modelErrors = formatIssues(modelValidation.error);
      }
      report.missingLayerReferences = checkLayerReferences(model);
      report.fieldMismatches = compareSummaryToModel(summary, model);
    } catch (error) {
      report.modelErrors.push(`Failed to load data/models/${summary.id}.json: ${error}`);
    }

    if (
      report.summaryErrors.length > 0 ||
      report.modelErrors.length > 0 ||
      report.missingLayerReferences.length > 0 ||
      report.fieldMismatches.length > 0
    ) {
      reports.push(report);
    }
  }

  const reportContent = generateMarkdownReport(reports, summaries.length);
  writeFileSync(join(PROJECT_ROOT, 'scripts/data-validation-report.md'), reportContent);

  console.log(reportContent);
  if (reports.length > 0) {
    process.exitCode = 1;
  }
}

main();
