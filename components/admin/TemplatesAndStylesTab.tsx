"use client";

import { PDFStyleEditor } from "@/components/admin/PDFStyleEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Palette, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Email templates are now managed as React components in the codebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Email templates are defined using React Email components for type safety and maintainability.
                To preview and test templates during development, use:
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm">
                npm run email:preview
              </div>
              <p className="text-sm text-muted-foreground">
                This opens a live preview dashboard where you can see all email templates with hot reload.
              </p>
              <Button variant="outline" asChild>
                <a
                  href="https://react.email"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  React Email Documentation
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="w-full">
          <PDFStyleEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
