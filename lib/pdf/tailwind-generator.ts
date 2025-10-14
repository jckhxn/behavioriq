/**
 * Tailwind-styled PDF Generator using Puppeteer
 *
 * Renders beautiful HTML+Tailwind CSS as PDF
 */

import puppeteer from "puppeteer";
import { prisma } from "@/lib/db/prisma";

interface AssessmentData {
  id: string;
  subjectName: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  scores: Array<{
    domain: string;
    domainName?: string;
    rawScore: number;
    totalPossible: number;
    riskLevel: string;
  }>;
  user: {
    name: string | null;
    email: string;
  };
}

interface DomainScore {
  domain: string;
  score: number;
  maxScore: number;
  description: string;
}

/**
 * Generate assessment PDF with Tailwind styling
 */
export async function generateTailwindPDF(
  assessment: AssessmentData
): Promise<Buffer> {
  console.log("[PDF] Starting Tailwind PDF generation for", assessment.id);

  // Fetch recommendations from database
  const recommendations = await prisma.recommendation.findMany({
    where: {
      assessmentId: assessment.id,
      category: "AI Generated",
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  const aiRecommendations = recommendations[0]?.content ||
    "No AI recommendations available. Please generate recommendations first.";

  // Parse recommendations into array
  const recommendationsList = parseRecommendations(aiRecommendations);

  // Transform scores to match the design interface
  const domainScores: DomainScore[] = assessment.scores.map((score) => ({
    domain: score.domainName || formatDomainName(score.domain),
    score: score.rawScore,
    maxScore: score.totalPossible,
    description: getDomainDescription(score.domain, score.riskLevel),
  }));

  // Generate summary
  const summary = generateSummary(assessment, domainScores);

  // Generate HTML
  const html = generateHTML({
    studentName: assessment.subjectName,
    assessmentDate: formatDate(assessment.completedAt || assessment.startedAt),
    evaluator: assessment.user.name || assessment.user.email,
    schoolName: "N/A", // Can be added to assessment model later
    grade: "N/A", // Can be added to assessment model later
    domainScores,
    recommendations: recommendationsList,
    summary,
    logoUrl: undefined, // Can be configured later
  });

  // Launch Puppeteer and generate PDF
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Explicitly use new headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security", // Allow loading CDN scripts
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-first-run",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();

    // Set content with proper base URL for assets
    // Use 'domcontentloaded' instead of 'networkidle0' to avoid CDN timeout issues
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000, // 60 seconds timeout
    });

    // Wait for Tailwind to be loaded and initialized
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait a bit for Tailwind CDN to load and apply styles
        setTimeout(resolve, 1500);
      });
    });

    console.log("[PDF] Tailwind styles loaded, generating PDF...");

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log("[PDF] Successfully generated Tailwind PDF");
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("[PDF] Error generating Tailwind PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate HTML with Tailwind styling
 */
function generateHTML(data: {
  studentName: string;
  assessmentDate: string;
  evaluator: string;
  schoolName: string;
  grade: string;
  domainScores: DomainScore[];
  recommendations: string[];
  summary: string;
  logoUrl?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f59e0b',
            success: '#10b981',
            info: '#3b82f6',
            warning: '#f59e0b',
            destructive: '#ef4444',
            muted: {
              DEFAULT: '#f3f4f6',
              foreground: '#6b7280',
            },
            foreground: '#1f2937',
          },
        },
      },
    }
  </script>
  <style>
    @page {
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
    }
    .print-container {
      max-width: 1024px;
      margin: 0 auto;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <!-- Header Section -->
    <header class="border-b-4 border-primary pb-8 mb-8">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-4xl font-bold tracking-tight mb-2 text-primary">Behavior Screener Report</h1>
          <p class="text-muted-foreground text-lg">Early Assessment Tool</p>
        </div>
        <div class="flex flex-col items-end gap-3">
          ${data.logoUrl ? `
            <img
              src="${data.logoUrl}"
              alt="Organization Logo"
              class="h-16 w-auto object-contain"
            />
          ` : ''}
          <div class="text-right">
            <div class="text-sm text-muted-foreground mb-1">Report Date</div>
            <div class="font-mono text-sm">${data.assessmentDate}</div>
          </div>
        </div>
      </div>

      <!-- Student Information Grid -->
      <div class="grid grid-cols-2 gap-x-12 gap-y-4 mt-8">
        <div>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-1">Student Name</div>
          <div class="font-medium text-lg">${data.studentName}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-1">Grade Level</div>
          <div class="font-medium text-lg">${data.grade}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-1">School</div>
          <div class="font-medium text-lg">${data.schoolName}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-1">Evaluator</div>
          <div class="font-medium text-lg">${data.evaluator}</div>
        </div>
      </div>
    </header>

    <!-- Domain Scores Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6 tracking-tight text-primary">Domain Scores</h2>
      <div class="space-y-6">
        ${data.domainScores.map((domain) => {
          const percentage = (domain.score / domain.maxScore) * 100;
          const scoreLevel =
            percentage >= 85 ? "Excellent" :
            percentage >= 70 ? "Good" :
            percentage >= 55 ? "Fair" :
            "Needs Support";

          const scoreColor =
            percentage >= 85 ? "text-success" :
            percentage >= 70 ? "text-info" :
            percentage >= 55 ? "text-warning" :
            "text-destructive";

          const barColor =
            percentage >= 85 ? "bg-success" :
            percentage >= 70 ? "bg-info" :
            percentage >= 55 ? "bg-warning" :
            "bg-destructive";

          return `
            <div class="p-6 border border-gray-200 rounded-lg border-l-4 border-l-primary">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg mb-1">${domain.domain}</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">${domain.description}</p>
                </div>
                <div class="text-right ml-6">
                  <div class="text-3xl font-bold font-mono ${scoreColor}">${domain.score}</div>
                  <div class="text-xs text-muted-foreground">out of ${domain.maxScore}</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-2">
                <div class="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full ${barColor}"
                    style="width: ${percentage}%"
                  ></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-medium text-muted-foreground">${percentage.toFixed(0)}%</span>
                  <span class="text-xs font-semibold ${scoreColor}">${scoreLevel}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <!-- Summary Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4 tracking-tight text-primary">Screening Summary</h2>
      <div class="p-6 border border-gray-200 rounded-lg border-l-4 border-l-accent bg-accent/5">
        <p class="text-base leading-relaxed text-foreground">${data.summary}</p>
      </div>
    </section>

    <!-- Recommendations Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4 tracking-tight text-primary">Suggested Next Steps</h2>
      <div class="p-6 border border-gray-200 rounded-lg border-l-4 border-l-secondary">
        <ol class="space-y-4">
          ${data.recommendations.map((recommendation, index) => `
            <li class="flex gap-4">
              <span class="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded flex-shrink-0 h-fit">
                ${String(index + 1).padStart(2, "0")}
              </span>
              <span class="text-base leading-relaxed">${recommendation}</span>
            </li>
          `).join('')}
        </ol>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t-2 border-primary/20 pt-8 mt-12">
      <div class="flex justify-between items-start text-sm text-muted-foreground">
        <div>
          <p class="font-medium mb-1 text-primary">Early Screening Tool</p>
          <p class="text-xs">This is a preliminary assessment and not a diagnostic evaluation</p>
        </div>
        <div class="text-right">
          <p class="font-mono">${data.assessmentDate}</p>
          <p class="mt-1">Page 1 of 1</p>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>
  `;
}

/**
 * Helper: Format domain name from enum
 */
function formatDomainName(domain: string): string {
  return domain
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Helper: Get domain description based on risk level
 */
function getDomainDescription(domain: string, riskLevel: string): string {
  const riskDescriptions: Record<string, string> = {
    LOW: "Performance is within expected range for this developmental domain.",
    MODERATE: "Some areas may benefit from additional support and monitoring.",
    HIGH: "Significant challenges observed that warrant professional attention.",
    VERY_HIGH: "Critical concerns requiring immediate professional evaluation.",
  };

  return riskDescriptions[riskLevel] || "Assessment results for this domain.";
}

/**
 * Helper: Generate summary text
 */
function generateSummary(
  assessment: AssessmentData,
  domainScores: DomainScore[]
): string {
  const totalDomains = domainScores.length;
  const averagePercentage =
    domainScores.reduce((sum, d) => sum + (d.score / d.maxScore) * 100, 0) /
    totalDomains;

  const highRiskDomains = assessment.scores.filter((s) =>
    s.riskLevel.includes("HIGH")
  ).length;

  let summaryText = `This behavioral screening assessed ${totalDomains} developmental domains for ${assessment.subjectName}. `;

  if (averagePercentage >= 75) {
    summaryText +=
      "Overall performance is strong across most assessed areas. ";
  } else if (averagePercentage >= 60) {
    summaryText +=
      "Overall performance shows a mix of strengths and areas needing support. ";
  } else {
    summaryText +=
      "Overall performance indicates multiple areas requiring attention and support. ";
  }

  if (highRiskDomains > 0) {
    summaryText += `${highRiskDomains} domain${highRiskDomains > 1 ? "s show" : " shows"} elevated risk levels requiring professional follow-up. `;
  }

  summaryText +=
    "This screening tool provides preliminary insights and should be followed by comprehensive professional evaluation for accurate diagnosis and intervention planning.";

  return summaryText;
}

/**
 * Helper: Format date
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Helper: Parse AI recommendations into array
 */
function parseRecommendations(aiText: string): string[] {
  // Try to extract numbered or bulleted lists
  const lines = aiText.split('\n').filter(line => line.trim());

  const recommendations: string[] = [];

  for (const line of lines) {
    // Match patterns like "1.", "•", "-", "*" at start of line
    const cleaned = line.trim()
      .replace(/^[\d]+\.\s*/, '')  // Remove "1. "
      .replace(/^[•\-\*]\s*/, '')  // Remove "• ", "- ", "* "
      .trim();

    // Only add substantial lines (more than 20 chars)
    if (cleaned.length > 20) {
      recommendations.push(cleaned);
    }
  }

  // If we couldn't parse any recommendations, return defaults
  if (recommendations.length === 0) {
    return [
      "Consult with a qualified professional for comprehensive evaluation",
      "Consider follow-up assessments to track progress over time",
      "Implement targeted interventions based on identified areas of concern",
      "Monitor behavioral patterns across different settings and contexts",
      "Maintain open communication with educators and healthcare providers",
    ];
  }

  // Limit to top 10 recommendations
  return recommendations.slice(0, 10);
}
