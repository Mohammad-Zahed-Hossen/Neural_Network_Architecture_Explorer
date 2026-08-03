#!/usr/bin/env tsx

/**
 * Regression Test Suite for Platform Validation Pipeline
 * 
 * Verifies that the validation engine correctly flags:
 * - Duplicate IDs
 * - Invalid references
 * - Invalid defaults
 * - Orphan entities
 * - Capability mismatches
 */

import { validatePlatform } from '../lib/validation';
import {
  capabilityMismatchFixture,
  duplicateDomainFixture,
  invalidDefaultFixture,
  invalidReferenceFixture,
  orphanVisualizerFixture,
} from '../tests/validation-fixtures/fixtures';

function runRegressionTests(): void {
  console.log('\nRunning Validation Framework Regression Tests...\n');
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, failureDetails?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✔ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (failureDetails) console.error(`   Details: ${failureDetails}`);
    }
  }

  // Test 1: Duplicate Domain ID
  const dupReport = validatePlatform(duplicateDomainFixture);
  assert(
    dupReport.issues.some((i) => i.code === 'DUPLICATE_ID' && i.entityId === 'vision'),
    'Detects Duplicate Domain ID',
    JSON.stringify(dupReport.issues)
  );

  // Test 2: Invalid Reference
  const refReport = validatePlatform(invalidReferenceFixture);
  assert(
    refReport.issues.some((i) => i.code === 'INVALID_REFERENCE' && i.field === 'supportedPerspectives'),
    'Detects Invalid Perspective Reference',
    JSON.stringify(refReport.issues)
  );

  // Test 3: Invalid Default Reference
  const defReport = validatePlatform(invalidDefaultFixture);
  assert(
    defReport.issues.some((i) => i.code === 'INVALID_DEFAULT' || i.code === 'INVALID_REFERENCE'),
    'Detects Invalid Default Reference',
    JSON.stringify(defReport.issues)
  );

  // Test 4: Orphan Visualizer
  const orphanReport = validatePlatform(orphanVisualizerFixture);
  assert(
    orphanReport.issues.some((i) => i.code === 'ORPHAN_ENTITY' && i.entityId === 'layer-health'),
    'Detects Orphan Visualizer Warning',
    JSON.stringify(orphanReport.issues)
  );

  // Test 5: Capability Mismatch
  const capReport = validatePlatform(capabilityMismatchFixture);
  assert(
    capReport.issues.some((i) => i.code === 'CAPABILITY_INCONSISTENCY'),
    'Detects Simulation Capability Mismatch Warning',
    JSON.stringify(capReport.issues)
  );

  console.log(`\nRegression Test Summary: ${passedTests}/${totalTests} tests passed.\n`);

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRegressionTests();
