import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { NeuralNetworkModelSchema } from '../lib/schema/model.schema';

const PROJECT_ROOT = process.cwd();
const MODELS_JSON_PATH = join(PROJECT_ROOT, 'data/models.json');
const LIB_DATA_DIR = join(PROJECT_ROOT, 'lib/data');
const GRAPHS_DIR = join(PROJECT_ROOT, 'data/graphs');
const OUTPUT_DIR = join(PROJECT_ROOT, 'data/models');
const CHANGELOG_PATH = join(PROJECT_ROOT, 'scripts/data-merge-changelog.md');

interface Conflict {
  modelId: string;
  field: string;
  libDataValue: any;
  modelsJsonValue: any;
  resolvedValue: any;
}

function loadJson(path: string): any {
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${path}: ${error}`);
  }
}

function writeJson(path: string, data: any): void {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

function main() {
  console.log('Starting data merge...\n');
  
  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  
  // Load models.json
  const modelsSummaries = loadJson(MODELS_JSON_PATH) as any[];
  console.log(`Loaded ${modelsSummaries.length} model summaries from data/models.json\n`);
  
  const conflicts: Conflict[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  modelsSummaries.forEach((summary: any) => {
    const modelId = summary.id;
    console.log(`Processing model: ${modelId}`);
    
    try {
      // Load lib/data/{id}.json
      const libDataPath = join(LIB_DATA_DIR, `${modelId}.json`);
      const libData = loadJson(libDataPath);
      
      // Load data/graphs/{id}.json
      const graphDataPath = join(GRAPHS_DIR, `${modelId}.json`);
      const graphData = loadJson(graphDataPath);
      
      // Merge: start with lib/data structure
      const merged = { ...libData };
      
      // Resolve conflicts by preferring data/models.json values
      const fieldMappings = {
        totalParameters: summary.totalParameters,
        totalFLOPs: summary.totalFLOPs,
        top1Accuracy: summary.top1Accuracy,
        top5Accuracy: summary.top5Accuracy,
        depth: summary.depth,
        colorTheme: summary.colorTheme,
        memoryUsage: summary.memoryUsage,
      };
      
      Object.entries(fieldMappings).forEach(([field, modelsValue]) => {
        const libValue = merged[field];
        if (libValue !== undefined && libValue !== modelsValue) {
          conflicts.push({
            modelId,
            field,
            libDataValue: libValue,
            modelsJsonValue: modelsValue,
            resolvedValue: modelsValue,
          });
          merged[field] = modelsValue;
        }
      });
      
      // Add layout info from graphs under architecture.layout
      if (merged.architecture) {
        merged.architecture.layout = {
          nodes: graphData.nodes,
          edges: graphData.edges,
          groups: graphData.groups,
          groupedNodes: graphData.groupedNodes,
          groupedEdges: graphData.groupedEdges,
        };
      }
      
      // Validate against schema
      const validationResult = NeuralNetworkModelSchema.safeParse(merged);
      if (!validationResult.success) {
        console.error(`  ✗ Validation failed for ${modelId}:`);
        validationResult.error.issues.forEach((err) => {
          console.error(`    Path: ${err.path.join('.')} - ${err.message}`);
        });
        errorCount++;
        return;
      }
      
      // Write merged file
      const outputPath = join(OUTPUT_DIR, `${modelId}.json`);
      writeJson(outputPath, merged);
      console.log(`  ✓ Merged successfully`);
      successCount++;
      
    } catch (error) {
      console.error(`  ✗ Error processing ${modelId}: ${error}`);
      errorCount++;
    }
  });
  
  console.log(`\n=== Merge Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Conflicts resolved: ${conflicts.length}\n`);
  
  // Write changelog
  const changelog = generateChangelog(conflicts, modelsSummaries.length, successCount, errorCount);
  writeFileSync(CHANGELOG_PATH, changelog, 'utf-8');
  console.log(`Changelog written to: ${CHANGELOG_PATH}`);
}

function generateChangelog(conflicts: Conflict[], total: number, success: number, errors: number): string {
  let md = '# Data Merge Changelog\n\n';
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Total models: ${total}\n`;
  md += `Successfully merged: ${success}\n`;
  md += `Errors: ${errors}\n`;
  md += `Conflicts resolved: ${conflicts.length}\n\n`;
  
  if (conflicts.length === 0) {
    md += 'No conflicts found - all data sources were consistent.\n';
  } else {
    md += '## Resolved Conflicts\n\n';
    md += 'The following conflicts were resolved by preferring values from `data/models.json`\n\n';
    
    // Group by model
    const byModel = new Map<string, Conflict[]>();
    conflicts.forEach((c) => {
      if (!byModel.has(c.modelId)) {
        byModel.set(c.modelId, []);
      }
      byModel.get(c.modelId)!.push(c);
    });
    
    byModel.forEach((modelConflicts, modelId) => {
      md += `### ${modelId}\n\n`;
      modelConflicts.forEach((c) => {
        md += `- **${c.field}**:\n`;
        md += `  - lib/data: \`${c.libDataValue}\`\n`;
        md += `  - data/models.json: \`${c.modelsJsonValue}\`\n`;
        md += `  - Resolved to: \`${c.resolvedValue}\`\n\n`;
      });
    });
  }
  
  return md;
}

main();
/*
 * Deprecated legacy migration helper.
 *
 * This script documents the one-time merge from lib/data/*.json and
 * data/graphs/*.json into canonical data/models/*.json files. It is retained
 * for audit history and should not be used as the runtime data pipeline.
 */
