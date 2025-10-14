"use client";

import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";
import { PDFStyleEditor } from "@/components/admin/PDFStyleEditor";

export default function TemplatesAndStylesTab() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Templates & Styles</h2>
      <div
        className="flex flex-col md:flex-row gap-8 justify-center"
        style={{ minHeight: 400 }}
      >
        <div className="flex-1 min-w-[320px] md:max-w-[50%]">
          <EmailTemplateEditor />
        </div>
        <div className="flex-1 min-w-[320px] md:max-w-[50%]">
          <PDFStyleEditor />
        </div>
      </div>
    </div>
  );
}
