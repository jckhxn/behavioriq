"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAssessmentPage() {
  const [subjectName, setSubjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const createAssessment = async () => {
    if (!subjectName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: subjectName.trim() }),
      });

      if (response.ok) {
        const assessment = await response.json();
        router.push(`/assessment/${assessment.id}`);
      } else {
        console.error("Failed to create assessment");
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && subjectName.trim()) {
      createAssessment();
    }
  };

  if (!session) {
    return null; // Will redirect via middleware
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
            </Link>
          </div>

          {/* Main Card */}
          <Card className="shadow-lg dark:shadow-xl border dark:border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Start New Assessment
              </CardTitle>
              <CardDescription>
                Enter the name of the person you'd like to assess
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject-name" className="text-sm font-medium">
                  Subject Name
                </Label>
                <Input
                  id="subject-name"
                  placeholder="Enter the person's name..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-lg"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={createAssessment}
                  disabled={!subjectName.trim() || isCreating}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-lg py-6"
                >
                  {isCreating ? "Creating Assessment..." : "Start Assessment"}
                </Button>

                <Link href="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              This assessment will help identify behavioral patterns and provide
              insights for better understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
