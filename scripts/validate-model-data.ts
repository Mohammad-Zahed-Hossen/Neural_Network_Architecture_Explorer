import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { NeuralNetworkModelSchema, ModelSummarySchema } from '../lib/schema/model.schema';

const PROJECT_ROOT = process.cwd();
const MODELS_JSON_PATH = join(PROJECT_ROOT, 'data/models.json');
const LIB_DATA_DIR = join(PROJECT_ROOT, 'lib/data');
const GRAPHS_DIR = join(PROJECT_ROOT, 'data/graphs');

interface ValidationReport {
  modelId: string;
  schemaErrors: string[];
  missingLayerReferences: string[];
  fieldMismatches: FieldMismatch[];
}

interface FieldMismatch {
  field: string;
  modelsJsonValue: any;
  libDataValue: any;
}

function loadJson<T>(path: string): T {
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(Failed to load : );
  }
}

function validateModelSchema(modelData: unknown, modelId: string): string[] {
  const errors: string[] = [];
  const result = NeuralNetworkModelSchema.safeParse(modelData);
  
  if (!result.success) {
    result.error.errors.forEach((err) => {
      errors.push(Path:  - );
    });
  }
  
  return errors;
}

function checkLayerReferences(graphData: any, libDataLayers: any[], modelId: string): string[] {
  const errors: string[] = [];
  const layerIds = new Set(libDataLayers.map((l) => l.id));
  
  // Check connections
  if (graphData.edges) {
    graphData.edges.forEach((edge: any, index: number) => {
      if (!layerIds.has(edge.source)) {
        errors.push(Edge  references missing source layer: );
      }
      if (!layerIds.has(edge.target)) {
        errors.push(Edge  references missing target layer: );
      }
    });
  }
  
  // Check groups
  if (graphData.groups) {
    graphData.groups.forEach((group: any) => {
      group.layerIds.forEach((layerId: string) => {
        if (!layerIds.has(layerId)) {
          errors.push(Group "" references missing layer: );
        }
      });
    });
  }
  
  return errors;
}

function compareFields(modelsJsonEntry: any, libDataEntry: any, modelId: string): FieldMismatch[] {
  const mismatches: FieldMismatch[] = [];
  
  // Field name mappings from models.json to lib/data structure
  const fieldMappings = {
    params: 'totalParameters',
    flops: 'totalFLOPs',
    top1: 'top1Accuracy',
    top5: 'top5Accuracy',
    memory_mb: 'memoryUsage',
  };
  
  Object.entries(fieldMappings).forEach(([modelsField, libDataField]) => {
    const modelsValue = modelsJsonEntry[modelsField];
    const libDataValue = libDataEntry[libDataField];
    
    if (modelsValue !== undefined && libDataValue !== undefined) {
      // Convert to numbers for comparison
      const modelsNum = Number(modelsValue);
      const libDataNum = Number(libDataValue);
      
      if (!isNaN(modelsNum) && !isNaN(libDataNum) && Math.abs(modelsNum - libDataNum) > 0.0001) {
        mismatches.push({
          field: modelsField,
          modelsJsonValue: modelsValue,
          libDataValue: libDataValue,
        });
      }
    }
  });
  
  // Compare depth and colorTheme directly
  if (modelsJsonEntry.depth !== libDataEntry.depth) {
    mismatches.push({
      field: 'depth',
      modelsJsonValue: modelsJsonEntry.depth,
      libDataValue: libDataEntry.depth,
    });
  }
  
  if (modelsJsonEntry.colorTheme !== libDataEntry.colorTheme) {
    mismatches.push({
      field: 'colorTheme',
      modelsJsonValue: modelsJsonEntry.colorTheme,
      libDataValue: libDataEntry.colorTheme,
    });
  }
  
  return mismatches;
}

function main() {
  console.log('Starting model data validation...\n');
  
  // Load models.json
  const modelsSummaries = loadJson<any[]>(MODELS_JSON_PATH);
  console.log(Loaded  model summaries from data/models.json\n);
  
  const reports: ValidationReport[] = [];
  
  modelsSummaries.forEach((summary) => {
    const modelId = summary.id;
    const report: ValidationReport = {
      modelId,
      schemaErrors: [],
      missingLayerReferences: [],
      fieldMismatches: [],
    };
    
    // Validate lib/data/{id}.json
    const libDataPath = join(LIB_DATA_DIR, ${modelId}.json);
    try {
      const libData = loadJson(libDataPath);
      report.schemaErrors = validateModelSchema(libData, modelId);
      
      // Check data/graphs/{id}.json layer references
      const graphDataPath = join(GRAPHS_DIR, ${modelId}.json);
      try {
        const graphData = loadJson(graphDataPath);
        if (libData.architecture && libData.architecture.layers) {
          report.missingLayerReferences = checkLayerReferences(
            graphData,
            libData.architecture.layers,
            modelId
          );
        }
      } catch (error) {
        report.missingLayerReferences.push(Failed to load graph data: );
      }
      
      // Compare fields
      report.fieldMismatches = compareFields(summary, libData, modelId);
    } catch (error) {
      report.schemaErrors.push(Failed to load lib/data/.json: );
    }
    
    // Only add report if there are errors
    if (
      report.schemaErrors.length > 0 ||
      report.missingLayerReferences.length > 0 ||
      report.fieldMismatches.length > 0
    ) {
      reports.push(report);
    }
  });
  
  // Generate report
  console.log('=== VALIDATION REPORT ===\n');
  
  if (reports.length === 0) {
    console.log('✓ No validation errors found across all models!');
  } else {
    console.log(Found issues in  model(s):\n);
    
    reports.forEach((report) => {
      console.log(## Model: );
      
      if (report.schemaErrors.length > 0) {
        console.log('\nSchema Errors:');
        report.schemaErrors.forEach((error) => console.log(  - ));
      }
      
      if (report.missingLayerReferences.length > 0) {
        console.log('\nMissing Layer References:');
        report.missingLayerReferences.forEach((ref) => console.log(  - ));
      }
      
      if (report.fieldMismatches.length > 0) {
        console.log('\nField Mismatches (data/models.json vs lib/data):');
        report.fieldMismatches.forEach((mismatch) => {
          console.log(
              - : models.json=, lib/data=
          );
        });
      }
      
      console.log('\n---\n');
    });
  }
  
  // Write report to file
  const reportPath = join(PROJECT_ROOT, 'scripts/data-validation-report.md');
  const reportContent = generateMarkdownReport(reports, modelsSummaries.length);
  writeFileSync(reportPath, reportContent);
  console.log(\nReport written to: );
}

function generateMarkdownReport(reports: ValidationReport[], totalModels: number): string {
  let md = '# Model Data Validation Report\n\n';
  md += Generated: \n;
  md += Total models checked: \n;
  md += Models with issues: \n\n;
  
  if (reports.length === 0) {
    md += '✓ No validation errors found across all models!\n';
    return md;
  }
  
  reports.forEach((report) => {
    md += ## Model: \n\n;
    
    if (report.schemaErrors.length > 0) {
      md += '### Schema Errors\n\n';
      report.schemaErrors.forEach((error) => {
        md += - \n;
      });
      md += '\n';
    }
    
    if (report.missingLayerReferences.length > 0) {
      md += '### Missing Layer References\n\n';
      report.missingLayerReferences.forEach((ref) => {
        md += - \n;
      });
      md += '\n';
    }
    
    if (report.fieldMismatches.length > 0) {
      md += '### Field Mismatches (data/models.json vs lib/data)\n\n';
      report.fieldMismatches.forEach((mismatch) => {
        md += - ****: models.json=\${mismatch.modelsJsonValue}\, lib/data=\${mismatch.libDataValue}\\n;
      });
      md += '\n';
    }
    
    md += '---\n\n';
  });
  
  return md;
}

main();
