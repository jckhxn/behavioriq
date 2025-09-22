"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Database,
  Upload,
  Download,
  Eye,
  Settings,
} from "lucide-react";
import { AssessmentUploadDialog } from "./AssessmentUploadDialog";

interface Assessment {
  id: string;
  domain: string;
  name: string;
  displayName?: string;
  description: string;
  order: number;
  isActive: boolean;
  totalPossibleScore?: number;
  clinicallySignificantScore?: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
    terminationRules: number;
  };
}

export function AssessmentManager() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await fetch("/api/admin/assessments");
      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssessmentStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/assessments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (response.ok) {
        loadAssessments();
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const deleteAssessment = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadAssessments();
      } else {
        const error = await response.json();
        alert(`Error deleting assessment: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("Failed to delete assessment");
    }
  };

  const exportAssessment = async (assessment: Assessment) => {
    try {
      const response = await fetch(
        `/api/admin/assessments/${assessment.id}/export`
      );
      if (response.ok) {
        const config = await response.json();
        const blob = new Blob([JSON.stringify(config, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${assessment.name.toLowerCase().replace(/\s+/g, "-")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting assessment:", error);
      alert("Failed to export assessment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Database className="h-8 w-8 animate-pulse mx-auto text-primary" />
          <p>Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            Assessment Management
          </h2>
          <p className="text-muted-foreground">
            Manage assessment configurations and upload new ones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Assessment
          </Button>
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="card-gradient">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {assessment.displayName || assessment.name}
                    </CardTitle>
                    {assessment.displayName && (
                      <Badge variant="outline" className="text-xs">
                        {assessment.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{assessment.domain}</Badge>
                    <Badge
                      variant={assessment.isActive ? "default" : "secondary"}
                      className={assessment.isActive ? "bg-green-500" : ""}
                    >
                      {assessment.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Order: {assessment.order}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{assessment._count.questions} questions</span>
                    <span>
                      {assessment._count.terminationRules} termination rules
                    </span>
                    {assessment.totalPossibleScore && (
                      <span>Max score: {assessment.totalPossibleScore}</span>
                    )}
                    {assessment.clinicallySignificantScore && (
                      <span>
                        Clinical threshold:{" "}
                        {assessment.clinicallySignificantScore}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportAssessment(assessment)}
                    title="Export as JSON"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="View details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Edit configuration">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleAssessmentStatus(assessment.id, assessment.isActive)
                    }
                    title={assessment.isActive ? "Deactivate" : "Activate"}
                    className={
                      assessment.isActive ? "text-yellow-600" : "text-green-600"
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteAssessment(assessment.id, assessment.name)
                    }
                    className="text-red-600 hover:text-red-700"
                    title="Delete assessment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {assessment.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {assessment.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {assessments.length === 0 && (
        <Card className="card-gradient p-8 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Assessments Found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by uploading an assessment configuration or creating one
            manually.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Assessment
            </Button>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Manually
            </Button>
          </div>
        </Card>
      )}

      <AssessmentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={loadAssessments}
      />
    </div>
  );
}
