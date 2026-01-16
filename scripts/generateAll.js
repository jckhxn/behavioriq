#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
const { main: generateKeywords } = require("./generateKeywords");
const { generateAllArticles } = require("./generateContent");

async function run() {
  const args = process.argv.slice(2);
  const overwrite = args.includes("--overwrite") || args.includes("-o");
  const topic = args.filter((a) => a !== "--overwrite" && a !== "-o").join(" ").trim();

  if (!topic) {
    console.error("Usage: npm run generate:pseo \"<topic>\"");
    process.exit(1);
  }

  console.log(`\n🧠 Generating keyword list for: ${topic}`);
  await generateKeywords(topic);

  console.log("\n✍️  Generating content for all keywords...");
  await generateAllArticles({ overwrite });

  console.log("\n✅ pSEO generation complete.");
  console.log(
    "Review JSON files under data/keywords/ and data/generated/, then trigger a deploy or commit the changes."
  );
}

if (require.main === module) {
  run().catch((error) => {
    console.error("generateAll failed:", error);
    process.exit(1);
  });
}

module.exports = { run };
