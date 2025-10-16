# PDF Generation System

## Overview

The PDF generation system now supports **beautiful Tailwind-styled PDFs** using Puppeteer to render HTML+CSS as high-quality PDF documents.

## Architecture

### Files

- **`generator.ts`** - Main entry point with fallback logic
- **`tailwind-generator.ts`** - New Tailwind-based PDF generator (primary)
- **Legacy generator** - Built-in fallback using pdf-lib

### How It Works

1. API route calls `generateAssessmentPDF()`
2. System tries Tailwind generator first (Puppeteer + HTML)
3. Falls back to legacy generator if Puppeteer fails
4. Returns PDF buffer to client

## Features

### Tailwind PDF (New) ✨

- **Beautiful Design**: Pixel-perfect Tailwind CSS styling
- **Dynamic Content**: Real assessment data, AI recommendations, domain scores
- **Color-Coded Scores**: Visual indicators for performance levels
- **Progress Bars**: Animated progress bars for each domain
- **Responsive Layout**: Professional report layout optimized for printing
- **Logo Support**: Optional organization logo (configurable)

### Data Included

- ✅ Student/subject name
- ✅ Assessment date and evaluator
- ✅ Domain scores with descriptions
- ✅ Color-coded risk levels (Excellent/Good/Fair/Needs Support)
- ✅ Progress bars showing percentage completion
- ✅ AI-generated recommendations (from database)
- ✅ Executive summary
- ✅ Professional footer with disclaimers

## Configuration

### Environment Variables

```bash
# Enable/disable Tailwind PDF (enabled by default)
USE_TAILWIND_PDF=true  # Set to "false" to use legacy generator
```

### Customization Options (Future)

These can be added to the assessment model or user settings:

```typescript
{
  logoUrl?: string;           // Organization logo
  organizationName?: string;  // School/district name
  schoolName?: string;        // Specific school
  // grade?: string;            // removed grade level logic
}
```

## Usage

### Generating a PDF

```typescript
import { generateAssessmentPDF } from "@/lib/pdf/generator";

const assessmentData = {
  id: "assessment-id",
  subjectName: "John Doe",
  startedAt: "2025-01-15T10:00:00Z",
  completedAt: "2025-01-15T10:30:00Z",
  status: "COMPLETED",
  scores: [
    {
      domain: "ATTENTION",
      domainName: "Attention & Focus",
      rawScore: 8,
      totalPossible: 10,
      riskLevel: "LOW",
    },
    // ... more scores
  ],
  user: {
    name: "Teacher Name",
    email: "teacher@school.edu",
  },
};

const pdfBuffer = await generateAssessmentPDF(assessmentData);
```

### API Endpoint

```bash
POST /api/assessments/[id]/pdf
```

Returns PDF file with proper headers for download.

## Testing

### 1. Test PDF Generation Locally

```bash
# Make sure dev server is running
npm run dev

# Generate a PDF for a completed assessment
curl -X POST http://localhost:3000/api/assessments/[assessment-id]/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test-report.pdf

# Open the PDF
open test-report.pdf  # macOS
# or
xdg-open test-report.pdf  # Linux
```

### 2. Test Through UI

1. Complete an assessment
2. Navigate to assessment results page
3. Click "Download PDF" or "Generate Report"
4. PDF should download with beautiful Tailwind styling

### 3. Verify AI Recommendations

```bash
# First, generate AI recommendations
curl -X POST http://localhost:3000/api/assessments/[id]/recommendations

# Then generate PDF (should include recommendations)
curl -X POST http://localhost:3000/api/assessments/[id]/pdf --output report.pdf
```

## Troubleshooting

### Puppeteer Issues

**Error**: `Failed to launch browser`

```bash
# Install Chromium dependencies (Linux)
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

**Error**: `Protocol error` or timeout

- Increase timeout in Puppeteer config
- Check server memory (Puppeteer needs ~150MB per instance)
- Consider using `puppeteer-core` with external Chrome in production

### Fallback to Legacy

If Tailwind PDF fails, system automatically falls back to legacy pdf-lib generator:

```
[PDF] Tailwind generator failed, falling back to legacy
[PDF] Using legacy PDF generator
```

This ensures PDFs are always generated, even if Puppeteer has issues.

## Performance

### Tailwind PDF

- **Generation Time**: ~2-5 seconds
- **Memory Usage**: ~150MB per generation
- **File Size**: ~50-200KB (depends on content)

### Legacy PDF

- **Generation Time**: ~500ms
- **Memory Usage**: ~20MB per generation
- **File Size**: ~30-80KB

## Production Deployment

### Vercel

Puppeteer works on Vercel with some configuration:

```javascript
// vercel.json
{
  "functions": {
    "app/api/assessments/[id]/pdf/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Docker

```dockerfile
# Install Chromium in Docker
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### Alternative: Serverless-Friendly

For serverless without Puppeteer, use:

- **Vercel PDF API** (paid)
- **@react-pdf/renderer** (no browser needed)
- **pdf-lib** (legacy generator - already implemented)

## Future Enhancements

- [ ] Multi-page support for long reports
- [ ] Charts and graphs (using Chart.js in HTML)
- [ ] Custom branding (logo, colors, fonts)
- [ ] Email PDF directly from report page
- [ ] Batch PDF generation for multiple assessments
- [ ] PDF templates by assessment type
- [ ] Localization/translation support
- [ ] Accessibility (WCAG compliant PDFs)

## License

Internal use only.
