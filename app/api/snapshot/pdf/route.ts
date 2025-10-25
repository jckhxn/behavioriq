import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";

interface SnapshotPdfPayload {
  trialId: string;
  sessionId: string;
}

/**
 * POST /api/snapshot/pdf
 *
 * Generates a watermarked snapshot PDF of trial results.
 * The PDF includes only the assessment summary, NOT recommendations.
 * Watermarked with: "SNAPSHOT – NOT A DIAGNOSIS"
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SnapshotPdfPayload;
    const { trialId, sessionId } = body;

    if (!trialId || !sessionId) {
      return NextResponse.json(
        { error: "trialId and sessionId are required" },
        { status: 400 }
      );
    }

    // Fetch trial data
    const trial = await prisma.assessmentTrial.findUnique({
      where: { id: trialId },
      include: { session: true },
    });

    if (!trial) {
      return NextResponse.json(
        { error: "Trial not found" },
        { status: 404 }
      );
    }

    if (!trial.scoreSnapshot) {
      return NextResponse.json(
        { error: "Trial has not been scored" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateSnapshotPDF(trial);

    // For MVP: Return data URL (browser can save it)
    // In production: Upload to storage service (S3, GCS, etc) and return signed URL
    const base64Pdf = pdfBuffer.toString("base64");
    const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`;

    return NextResponse.json({
      pdfUrl: pdfDataUrl,
    });
  } catch (error) {
    console.error("[snapshot/pdf] failed", error);
    return NextResponse.json(
      { error: "Unable to generate snapshot PDF" },
      { status: 500 }
    );
  }
}

/**
 * Generate a watermarked snapshot PDF
 */
async function generateSnapshotPDF(trial: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // 8.5" x 11" (letter)
  const { width, height } = page.getSize();

  const fontSize = 12;
  const boldFontSize = 14;
  const titleFontSize = 18;

  // Get fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let yPosition = height - 40;

  // Title
  page.drawText("Behavior Assessment Snapshot", {
    x: 40,
    y: yPosition,
    size: titleFontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  // Meta information
  const childFirstName = trial.childFirstName || "Anonymous";
  const ageBand = trial.ageBand || "Unknown";
  const completedAt = new Date(trial.createdAt).toLocaleDateString();

  page.drawText(`Child: ${childFirstName} | Age: ${ageBand} | Date: ${completedAt}`, {
    x: 40,
    y: yPosition,
    size: fontSize,
    font: regularFont,
    color: rgb(80, 80, 80),
  });

  yPosition -= 20;

  // Warning box
  page.drawRectangle({
    x: 40,
    y: yPosition - 40,
    width: width - 80,
    height: 40,
    borderColor: rgb(220, 53, 69),
    borderWidth: 2,
    color: rgb(255, 240, 240),
  });

  page.drawText("⚠️  SCREENING TOOL ONLY – NOT A DIAGNOSIS", {
    x: 50,
    y: yPosition - 18,
    size: boldFontSize,
    font: boldFont,
    color: rgb(220, 53, 69),
  });

  yPosition -= 60;

  // Parse snapshot
  let snapshot;
  try {
    snapshot =
      typeof trial.scoreSnapshot === "string"
        ? JSON.parse(trial.scoreSnapshot)
        : trial.scoreSnapshot;
  } catch {
    snapshot = { domains: [] };
  }

  // Domain scores section
  if (snapshot.domains && Array.isArray(snapshot.domains)) {
    page.drawText("Assessment Domains", {
      x: 40,
      y: yPosition,
      size: boldFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    for (const domain of snapshot.domains.slice(0, 6)) {
      // Limit to 6 domains to fit on page
      const domainName = domain.domain || "Unknown";
      const score = domain.score
        ? Math.round((domain.score / 4) * 100)
        : 0;
      const level = domain.level || "unknown";

      page.drawText(`${domainName}: ${score}/100 (${level})`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 15;

      if (yPosition < 100) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([612, 792]);
        page = newPage;
        yPosition = height - 40;
      }
    }

    yPosition -= 10;
  }

  // Recommendation preview
  if (snapshot.recommendationPreview) {
    page.drawText("Next Steps", {
      x: 40,
      y: yPosition,
      size: boldFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 18;

    // Word wrap the recommendation text
    const words = snapshot.recommendationPreview.split(" ");
    let line = "";
    const maxLineWidth = 90; // Characters per line

    for (const word of words) {
      if ((line + word).length > maxLineWidth) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font: regularFont,
          color: rgb(60, 60, 60),
        });
        yPosition -= 15;
        line = word;
      } else {
        line += (line ? " " : "") + word;
      }
    }

    if (line) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: regularFont,
        color: rgb(60, 60, 60),
      });
    }

    yPosition -= 30;
  }

  // Watermark
  page.drawText("SNAPSHOT – NOT A DIAGNOSIS", {
    x: width / 2 - 80,
    y: height / 2,
    size: 40,
    font: regularFont,
    color: rgb(200, 200, 200),
    opacity: 0.3,
    rotate: -45,
  });

  // Footer
  const footerY = 20;
  page.drawText(
    "For full assessment report with recommendations, visit BehaviorIQ.app",
    {
      x: 40,
      y: footerY,
      size: 9,
      font: regularFont,
      color: rgb(120, 120, 120),
    }
  );

  // Serialize PDF to buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
