"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Database } from "lucide-react";

interface Assessment {
  id: string;
  domain: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  _count: {
    questions: number;
  };
}

export function AssessmentManager() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

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
            Manage assessment configurations stored in the database
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{assessment.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{assessment.domain}</Badge>
                    <Badge
                      variant={assessment.isActive ? "default" : "secondary"}
                      className={assessment.isActive ? "bg-green-500" : ""}
                    >
                      {assessment.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {assessment._count.questions} questions
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toggleAssessmentStatus(assessment.id, assessment.isActive)
                    }
                  >
                    {assessment.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
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
            Get started by adding your first assessment configuration.
          </p>
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add First Assessment
          </Button>
        </Card>
      )}
    </div>
  );
}
