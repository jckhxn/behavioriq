#!/usr/bin/env node
/**
 * Quick verification script for domain labels and shortId functionality
 */

// Import the centralized domain constants
import {
  DOMAIN_LABELS,
  DOMAIN_LABELS_SHORT,
  RISK_COLORS,
} from "../lib/constants/domains.js";

console.log("🔍 Testing Domain Label Constants...");
console.log("\nFull Domain Labels:");
Object.entries(DOMAIN_LABELS).forEach(([key, value]) => {
  console.log(`  ${key}: "${value}"`);
});

console.log("\nShort Domain Labels:");
Object.entries(DOMAIN_LABELS_SHORT).forEach(([key, value]) => {
  console.log(`  ${key}: "${value}"`);
});

console.log("\nRisk Colors (sample):");
Object.entries(RISK_COLORS)
  .slice(0, 2)
  .forEach(([key, colors]) => {
    console.log(`  ${key}: ${JSON.stringify(colors, null, 2)}`);
  });

// Test shortId validation
import {
  isValidShortAssessmentId,
  generateShortAssessmentId,
} from "../lib/utils/shortId.js";

console.log("\n🔑 Testing ShortId Functionality...");
const newId = generateShortAssessmentId();
console.log(`Generated new ID: ${newId}`);
console.log(`Is valid (new): ${isValidShortAssessmentId(newId)}`);
console.log(
  `Is valid (old format ASS-ABC123): ${isValidShortAssessmentId("ASS-ABC123")}`
);
console.log(
  `Is valid (invalid format): ${isValidShortAssessmentId("INVALID-ID")}`
);

console.log("\n✅ All tests completed successfully!");
