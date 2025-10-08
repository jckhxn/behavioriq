const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugShareLink() {
  try {
    const shareCode = "HFZ5XIG6";

    console.log(`🔍 Checking share link: ${shareCode}\n`);

    const shareLink = await prisma.shareableLink.findUnique({
      where: { shareCode },
      include: {
        assessment: {
          include: {
            scores: {
              include: {
                domainTemplate: true,
              },
            },
            responses: true,
          },
        },
      },
    });

    if (!shareLink) {
      console.log("❌ Share link not found");
      return;
    }

    console.log("✅ Share link found:");
    console.log(`  ID: ${shareLink.id}`);
    console.log(`  Share Code: ${shareLink.shareCode}`);
    console.log(`  Privacy: ${shareLink.privacy}`);
    console.log(`  Active: ${shareLink.isActive}`);
    console.log(`  View Count: ${shareLink.viewCount}\n`);

    console.log("📊 Assessment:");
    console.log(`  ID: ${shareLink.assessment.id}`);
    console.log(`  Short ID: ${shareLink.assessment.shortId}`);
    console.log(`  Subject: ${shareLink.assessment.subjectName}`);
    console.log(`  Status: ${shareLink.assessment.status}`);
    console.log(`  Scores: ${shareLink.assessment.scores.length}`);
    console.log(`  Responses: ${shareLink.assessment.responses.length}\n`);

    if (shareLink.assessment.scores.length > 0) {
      console.log("🎯 Scores Details:");
      shareLink.assessment.scores.forEach((score, idx) => {
        console.log(`\n  Score ${idx + 1}:`);
        console.log(`    ID: ${score.id}`);
        console.log(`    Domain (enum): ${score.domain || "null"}`);
        console.log(`    Domain Name: ${score.domainName || "null"}`);
        console.log(
          `    Domain Template ID: ${score.domainTemplateId || "null"}`
        );
        console.log(
          `    Domain Template Name: ${score.domainTemplate?.name || "null"}`
        );
        console.log(`    Raw Score: ${score.rawScore}/${score.totalPossible}`);
        console.log(`    Risk Level: ${score.riskLevel}`);
        console.log(`    Confidence: ${score.confidence}`);
      });
    } else {
      console.log("⚠️  No scores found for this assessment");
    }

    console.log("\n📝 Responses:");
    console.log(`  Total responses: ${shareLink.assessment.responses.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugShareLink();
