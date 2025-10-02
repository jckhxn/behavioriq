"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AssessmentTemplateManager from "./AssessmentTemplateManager";
import DomainTemplateManager from "./DomainTemplateManager";
import { FileText, Layers, Plus, Upload, Package } from "lucide-react";

export function AssessmentBuilder() {
  const [activeSubTab, setActiveSubTab] = useState("templates");
  const [bulkUploadTrigger, setBulkUploadTrigger] = useState(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Assessment Management
        </h2>
        <p className="text-muted-foreground">
          Create and manage all assessment templates and domain libraries for
          your organization. All assessments are database-driven and fully
          customizable.
        </p>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("templates")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessment Templates
            </CardTitle>
            <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Create Complete Assessments
            </div>
            <p className="text-xs text-muted-foreground">
              Build full assessments by combining domains, or upload complete
              JSON assessments
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("domains")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Domain Library
            </CardTitle>
            <Layers className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Domain Templates</div>
            <p className="text-xs text-muted-foreground">
              Create reusable domain templates with questions and scoring rules
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => setActiveSubTab("templates")}
              >
                <Upload className="h-3 w-3" />
                <span>Bulk Upload Assessment</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => setActiveSubTab("domains")}
              >
                <Package className="h-3 w-3" />
                <span>Upload Domain JSON</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => setActiveSubTab("templates")}
              >
                <Plus className="h-3 w-3" />
                <span>Create From Scratch</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessment Templates
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Domain Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <AssessmentTemplateManager />
        </TabsContent>

        <TabsContent value="domains" className="mt-6">
          <DomainTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
