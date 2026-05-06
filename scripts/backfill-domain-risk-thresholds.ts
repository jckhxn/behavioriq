import { prisma } from "../lib/db/prisma";

type JsonObject = Record<string, any>;

const hasRiskThresholds = (config: unknown): boolean => {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return false;
  }

  const scoringConfig = config as JsonObject;
  const thresholds = scoringConfig.riskThresholds || scoringConfig.thresholds;
  return Boolean(thresholds && typeof thresholds === "object");
};

const getQuestionMax = (question: any): number => {
  const options = Array.isArray(question?.options) ? question.options : [];
  const numericValues = options
    .map((option: any) => Number(option?.value))
    .filter((value: number) => Number.isFinite(value));

  if (numericValues.length > 0) {
    return Math.max(...numericValues);
  }

  const numericWeight = Number(question?.weight);
  if (Number.isFinite(numericWeight) && numericWeight > 0) {
    return numericWeight;
  }

  return 1;
};

const buildDefaultRiskThresholds = (questions: unknown): JsonObject => {
  const list = Array.isArray(questions) ? questions : [];
  const totalPossible = list.reduce((sum, question) => sum + getQuestionMax(question), 0);

  if (totalPossible <= 0) {
    return {
      moderate: 1,
      high: 2,
      very_high: 3,
    };
  }

  const moderate = Math.max(1, Math.ceil(totalPossible * 0.25));
  const high = Math.max(moderate, Math.ceil(totalPossible * 0.5));
  const veryHigh = Math.max(high, Math.ceil(totalPossible * 0.75));

  return {
    moderate,
    high,
    very_high: veryHigh,
  };
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const templates = await prisma.domainTemplate.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      questions: true,
      scoringConfig: true,
    },
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const template of templates) {
    const currentConfig: JsonObject =
      template.scoringConfig && typeof template.scoringConfig === "object" && !Array.isArray(template.scoringConfig)
        ? (template.scoringConfig as JsonObject)
        : {};

    if (!force && hasRiskThresholds(currentConfig)) {
      skippedCount += 1;
      continue;
    }

    const riskThresholds = buildDefaultRiskThresholds(template.questions);
    const nextConfig = {
      ...currentConfig,
      riskThresholds,
    };

    if (!dryRun) {
      await prisma.domainTemplate.update({
        where: { id: template.id },
        data: { scoringConfig: nextConfig },
      });
    }

    updatedCount += 1;
    console.log(
      `${dryRun ? "[dry-run] would update" : "updated"} ${template.slug} (${template.name}) -> ${JSON.stringify(riskThresholds)}`
    );
  }

  console.log("\nBackfill complete");
  console.log(`Total templates: ${templates.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (already configured): ${skippedCount}`);
  console.log(`Mode: ${dryRun ? "dry-run" : "write"}`);
  console.log(`Force: ${force}`);
}

main()
  .catch((error) => {
    console.error("Failed to backfill domain risk thresholds:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
