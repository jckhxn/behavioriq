-- CreateTable for EmailTemplate
CREATE TABLE IF NOT EXISTS "email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable for PDFStyle
CREATE TABLE IF NOT EXISTS "pdf_styles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_styles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_name_key" ON "email_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "pdf_styles_name_key" ON "pdf_styles"("name");
