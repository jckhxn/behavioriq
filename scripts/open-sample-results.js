#!/usr/bin/env node

// Quick access script to open the sample assessment results
const assessmentId = "cmg5yscgr0001onw2sbkv9n8n";
const url = `http://localhost:3000/assessment/${assessmentId}/results`;

console.log("🚀 Opening sample assessment results...");
console.log(`📍 Assessment ID: ${assessmentId}`);
console.log(`🌐 URL: ${url}`);
console.log(
  "\n✨ You can now check how all domains are displayed on the results page!"
);
console.log("\nExpected domains to see:");
console.log("  • Antisocial Behavior (Score: 49/50, Risk: LOW)");
console.log("  • Violence Risk (Score: 32/50, Risk: VERY_HIGH)");
console.log("  • Attention Issues (Score: 17/50, Risk: MODERATE)");
console.log("  • Emotional Regulation (Score: 19/50, Risk: MODERATE)");
console.log("  • Conduct Problems (Score: 25/50, Risk: VERY_HIGH)");
console.log(
  "\n🔍 Navigate to the URL above to verify the domain names display correctly!"
);

// Try to open in browser if on macOS
if (process.platform === "darwin") {
  const { exec } = require("child_process");
  exec(`open "${url}"`, (error) => {
    if (error) {
      console.log(
        "\n⚠️  Could not auto-open browser. Please visit the URL manually."
      );
    } else {
      console.log("\n🎉 Opened in your default browser!");
    }
  });
}
