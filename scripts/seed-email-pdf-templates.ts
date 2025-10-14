import { prisma } from "@/lib/db/prisma";

async function seedTemplates() {
  console.log("Seeding default email template and PDF styles...");

  try {
    // Create default email template if it doesn't exist
    const emailTemplate = await prisma.emailTemplate.upsert({
      where: { name: "default" },
      update: {},
      create: {
        name: "default",
        subject: "Your AI Diagnostic Assessment Report",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #667eea; margin-bottom: 20px; }
    .report-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
    a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <h1>Your Assessment Report is Ready</h1>
  <p>Thank you for completing your AI Diagnostic assessment. Your personalized report is now available.</p>

  <div class="report-card">
    <h2>Next Steps</h2>
    <p>Review your comprehensive assessment report which includes:</p>
    <ul>
      <li>Detailed risk analysis across multiple domains</li>
      <li>Personalized recommendations</li>
      <li>Evidence-based interventions</li>
      <li>Resource links and support options</li>
    </ul>
  </div>

  <p>If you have any questions about your report, please don't hesitate to contact our support team.</p>

  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} AI Diagnostic. All rights reserved.</p>
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
        `.trim(),
        updatedAt: new Date(),
      },
    });
    console.log("✓ Email template created/updated:", emailTemplate.name);

    // Create default PDF style if it doesn't exist
    const pdfStyle = await prisma.pDFStyle.upsert({
      where: { name: "default" },
      update: {},
      create: {
        name: "default",
        css: `
/* Default PDF Styles */
@page {
  margin: 2cm;
  size: letter;
}

body {
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #333;
}

h1 {
  color: #667eea;
  font-size: 24pt;
  margin-bottom: 20px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

h2 {
  color: #4c51bf;
  font-size: 18pt;
  margin-top: 30px;
  margin-bottom: 15px;
}

h3 {
  color: #5a67d8;
  font-size: 14pt;
  margin-top: 20px;
  margin-bottom: 10px;
}

.risk-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 10pt;
}

.risk-low { background: #c6f6d5; color: #22543d; }
.risk-moderate { background: #feebc8; color: #7c2d12; }
.risk-high { background: #fed7d7; color: #742a2a; }
.risk-very-high { background: #fed7d7; color: #742a2a; font-weight: bold; }

.recommendation {
  background: #f7fafc;
  border-left: 4px solid #667eea;
  padding: 15px;
  margin: 15px 0;
}

.page-break {
  page-break-after: always;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background: #edf2f7;
  font-weight: bold;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 9pt;
  color: #718096;
}
        `.trim(),
        updatedAt: new Date(),
      },
    });
    console.log("✓ PDF style created/updated:", pdfStyle.name);

    console.log("\n✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplates();
