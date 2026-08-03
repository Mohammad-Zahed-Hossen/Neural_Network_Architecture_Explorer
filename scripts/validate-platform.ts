#!/usr/bin/env tsx

/**
 * Platform Validation Entry Point
 * 
 * Executed during build and CI pipelines to validate platform registry integrity,
 * referential consistency, capability compatibility, and graph structure.
 * 
 * Exits with code 0 on success, or code 1 on validation error.
 */

import { formatValidationIssue, validatePlatform } from '../lib/validation';

function runPlatformValidation(): void {
  console.log('\n==================================================');
  console.log('       NEURAL NETWORK ARCHITECTURE EXPLORER');
  console.log('          Platform Validation Framework');
  console.log('==================================================\n');

  const report = validatePlatform();

  console.log(`[Summary] Registered Capabilities:`);
  console.log(`  - Domains:         ${report.stats.domainsCount}`);
  console.log(`  - Perspectives:    ${report.stats.perspectivesCount}`);
  console.log(`  - Visualizers:     ${report.stats.visualizersCount}`);
  console.log(`  - Graph Behaviors: ${report.stats.graphBehaviorsCount}\n`);

  if (report.issues.length === 0) {
    console.log('✔ All Platform Registries PASS validation (0 Errors, 0 Warnings).\n');
  } else {
    console.log(`[Issues Detected] (${report.stats.errorsCount} Errors, ${report.stats.warningsCount} Warnings, ${report.stats.infoCount} Info):\n`);

    for (const issue of report.issues) {
      console.log(`  ${formatValidationIssue(issue)}`);
    }
    console.log('');
  }

  console.log('--------------------------------------------------');
  if (report.pass) {
    console.log('Result: PASS — Platform Registry Architecture Validated.');
    console.log('==================================================\n');
    process.exit(0);
  } else {
    console.error('Result: FAIL — Platform Registry Integrity Errors Encountered.');
    console.error('Build aborted due to platform validation failure.');
    console.log('==================================================\n');
    process.exit(1);
  }
}

runPlatformValidation();
