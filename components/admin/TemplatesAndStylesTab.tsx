"use client";

import { GrapesJSEmailEditor } from "@/components/admin/GrapesJSEmailEditor";
import { PDFStyleEditor } from "@/components/admin/PDFStyleEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Palette } from "lucide-react";

export default function TemplatesAndStylesTab() {
  return (
    <div className="w-full px-4">
      <h2 className="text-2xl font-bold mb-6">Templates & Styles</h2>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            PDF Styles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="w-full">
          <GrapesJSEmailEditor />
        </TabsContent>

        <TabsContent value="pdf" className="w-full">
          <PDFStyleEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
