import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { generateTailwindPDF } from "./tailwind-generator";

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

/**
 * Generate assessment PDF
 * Uses new Tailwind-based generator for beautiful PDFs
 * Falls back to legacy generator if needed
 */
export async function generateAssessmentPDF(
  assessment: AssessmentData
): Promise<Buffer> {
  // Use new Tailwind-based PDF generator
  const USE_TAILWIND_PDF = process.env.USE_TAILWIND_PDF !== "false"; // Enabled by default

  if (USE_TAILWIND_PDF) {
    try {
      console.log("[PDF] Using Tailwind PDF generator");
      return await generateTailwindPDF(assessment);
    } catch (error) {
      console.error("[PDF] Tailwind generator failed, falling back to legacy:", error);
      // Fall through to legacy generator
    }
  }

  // Legacy PDF generator (fallback)
  console.log("[PDF] Using legacy PDF generator");
  return await generateLegacyPDF(assessment);
}

/**
 * Legacy PDF generator using pdf-lib
 * Kept as fallback
 */
async function generateLegacyPDF(assessment: AssessmentData): Promise<Buffer> {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add a page
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { height } = page.getSize();

  let yPosition = height - 60;

  // Title
  page.drawText("Behavioral Assessment Report", {
    x: 50,
    y: yPosition,
    size: 24,
    font: timesBoldFont,
    color: rgb(0.1, 0.2, 0.5),
  });

  yPosition -= 50;

  // Subject Information Section
  page.drawText(`Subject: ${assessment.subjectName}`, {
    x: 50,
    y: yPosition,
    size: 16,
    font: timesBoldFont,
  });

  yPosition -= 25;

  page.drawText(`Assessment ID: ${assessment.id}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesFont,
  });

  yPosition -= 20;

  page.drawText(
    `Completed: ${assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : "In Progress"}`,
    {
      x: 50,
      y: yPosition,
      size: 12,
      font: timesFont,
    }
  );

  yPosition -= 20;

  page.drawText(`Assessor: ${assessment.user.name || assessment.user.email}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesFont,
  });

  yPosition -= 40;

  // Assessment Results Section
  page.drawText("Assessment Results", {
    x: 50,
    y: yPosition,
    size: 18,
    font: timesBoldFont,
    color: rgb(0.1, 0.2, 0.5),
  });

  yPosition -= 30;

  // Draw table headers
  page.drawText("Domain", {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesBoldFont,
  });

  page.drawText("Score", {
    x: 250,
    y: yPosition,
    size: 12,
    font: timesBoldFont,
  });

  page.drawText("Risk Level", {
    x: 350,
    y: yPosition,
    size: 12,
    font: timesBoldFont,
  });

  // Draw a line under headers
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: 500, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });

  yPosition -= 25;

  // Scores
  assessment.scores.forEach((score) => {
    // Determine risk level color
    let riskColor = rgb(0, 0, 0); // Default black
    const riskLevel = score.riskLevel.toLowerCase();
    if (riskLevel.includes("low"))
      riskColor = rgb(0, 0.7, 0); // Green
    else if (riskLevel.includes("moderate"))
      riskColor = rgb(0.8, 0.6, 0); // Orange
    else if (riskLevel.includes("high")) riskColor = rgb(0.8, 0, 0); // Red

    page.drawText(score.domain, {
      x: 50,
      y: yPosition,
      size: 11,
      font: timesFont,
    });

    page.drawText(`${score.rawScore}/${score.totalPossible}`, {
      x: 250,
      y: yPosition,
      size: 11,
      font: timesFont,
    });

    page.drawText(score.riskLevel, {
      x: 350,
      y: yPosition,
      size: 11,
      font: timesFont,
      color: riskColor,
    });

    yPosition -= 20;
  });

  yPosition -= 20;

  // Areas of Concern
  const highRiskDomains = assessment.scores.filter((s) =>
    s.riskLevel.toLowerCase().includes("high")
  );

  if (highRiskDomains.length > 0) {
    page.drawText("Areas of Concern:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: timesBoldFont,
      color: rgb(0.8, 0, 0),
    });

    yPosition -= 25;

    highRiskDomains.forEach((domain) => {
      page.drawText(`• ${domain.domain}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: timesFont,
      });
      yPosition -= 18;
    });
  }

  // Recommendations section
  yPosition -= 20;
  page.drawText("Recommendations:", {
    x: 50,
    y: yPosition,
    size: 14,
    font: timesBoldFont,
    color: rgb(0.1, 0.2, 0.5),
  });

  yPosition -= 25;

  const recommendations = [
    "Consult with a qualified professional for comprehensive evaluation",
    "Consider follow-up assessments to track progress over time",
    "Implement targeted interventions for high-risk areas",
    "Monitor behavioral patterns in various settings",
  ];

  recommendations.forEach((rec) => {
    page.drawText(`• ${rec}`, {
      x: 70,
      y: yPosition,
      size: 10,
      font: timesFont,
    });
    yPosition -= 15;
  });

  // Disclaimer at bottom
  yPosition = 100;
  page.drawText("DISCLAIMER", {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesBoldFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  yPosition -= 20;

  const disclaimerText = [
    "This assessment is for educational and screening purposes only and does not constitute",
    "a medical diagnosis. The results should be interpreted by qualified professionals.",
    "Please consult with a licensed healthcare provider for proper evaluation and treatment",
    "recommendations. This tool is not a substitute for professional clinical judgment.",
  ];

  disclaimerText.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 12;
  });

  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
