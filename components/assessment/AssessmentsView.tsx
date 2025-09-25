"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Calendar,
  Search,
  Download,
  Eye,
  Play,
  Clock,
  CheckCircle,
  Plus,
  TrendingUp,
  Target,
  Trash2,
  MoreHorizontal,
  Share,
  Link2,
  Lock,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AssessmentDomain } from "@prisma/client";
import { AssessmentDetailSidebar } from "./AssessmentDetailSidebar";

interface Assessment {
  id: string;
  shortId?: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  completedAt?: string;
  scores?: Array<{
    domain: string;
    rawScore: number;
    totalPossible: number;
    riskLevel: string;
    timestamp?: string;
    domainDisplayName?: string;
  }>;
}

export function AssessmentsView() {
  const { data: session } = useSession();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "COMPLETED" | "IN_PROGRESS"
  >("ALL");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [assessmentToShare, setAssessmentToShare] = useState<string | null>(
    null
  );
  const [sharePrivacy, setSharePrivacy] = useState<
    "PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED"
  >("PRIVATE");
  const [sharePassword, setSharePassword] = useState("");
  const [shareExpiresAt, setShareExpiresAt] = useState("");
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareableLinks, setShareableLinks] = useState<any[]>([]);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  // Assessment detail sidebar state
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = assessments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((assessment) =>
        assessment.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (assessment) => assessment.status === filterStatus
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, filterStatus]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/pdf`, {
        method: "POST",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assessment-${assessmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  const handleDeleteClick = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the assessment from the local state
        setAssessments((prev) =>
          prev.filter((assessment) => assessment.id !== assessmentToDelete)
        );
        setDeleteDialogOpen(false);
        setAssessmentToDelete(null);

        // Show success message (you might want to add a toast notification here)
        console.log("Assessment deleted successfully");
      } else {
        const error = await response.json();
        console.error("Failed to delete assessment:", error);
        // Show error message to user
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      // Show error message to user
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  // Share functions
  const handleShareClick = (assessmentId: string) => {
    setAssessmentToShare(assessmentId);
    setShareDialogOpen(true);
    // Reset form state
    setSharePrivacy("PRIVATE");
    setSharePassword("");
    setShareExpiresAt("");
  };

  // Assessment detail sidebar handlers
  const handleViewAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
  };

  const handleCloseSidebar = () => {
    setSelectedAssessmentId(null);
  };

  const handleShareConfirm = async () => {
    if (!assessmentToShare) return;

    setIsCreatingShare(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId: assessmentToShare,
          privacy: sharePrivacy,
          password:
            sharePrivacy === "PASSWORD_PROTECTED" ? sharePassword : undefined,
          expiresAt: shareExpiresAt || undefined,
        }),
      });

      if (response.ok) {
        const shareLink = await response.json();

        // Copy share URL to clipboard
        await navigator.clipboard.writeText(shareLink.shareUrl);

        // Add to local state
        setShareableLinks((prev) => [shareLink, ...prev]);

        setShareDialogOpen(false);
        setAssessmentToShare(null);

        // Show success message (you might want to add a toast notification here)
        alert(
          `Share link created and copied to clipboard!\n${shareLink.shareUrl}`
        );
      } else {
        const error = await response.json();
        console.error("Failed to create share link:", error);
        alert("Failed to create share link. Please try again.");
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      alert("Failed to create share link. Please try again.");
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleShareCancel = () => {
    setShareDialogOpen(false);
    setAssessmentToShare(null);
    setSharePrivacy("PRIVATE");
    setSharePassword("");
    setShareExpiresAt("");
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "very_high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getOverallRiskLevel = (scores: Assessment["scores"]) => {
    if (!scores || scores.length === 0) return null;

    const riskLevels = scores.map((s) => s.riskLevel.toLowerCase());
    if (riskLevels.includes("very_high")) return "Very High";
    if (riskLevels.includes("high")) return "High";
    if (riskLevels.includes("moderate")) return "Moderate";
    return "Low";
  };

  const getCompletedCount = () =>
    assessments.filter((a) => a.status === "COMPLETED").length;

  const getInProgressCount = () =>
    assessments.filter((a) => a.status === "IN_PROGRESS").length;

  const getAverageScore = () => {
    const completed = assessments.filter(
      (a) => a.status === "COMPLETED" && a.scores
    );
    if (completed.length === 0) return 0;

    const totalScore = completed.reduce((sum, assessment) => {
      if (!assessment.scores) return sum;
      const avgScore =
        assessment.scores.reduce(
          (scoreSum, score) => scoreSum + score.rawScore / score.totalPossible,
          0
        ) / assessment.scores.length;
      return sum + avgScore;
    }, 0);

    return Math.round((totalScore / completed.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content */}
      <div
        className={`space-y-4 p-4 md:p-8 pt-6 transition-all duration-300 overflow-auto ${
          selectedAssessmentId ? "w-1/2" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
            <p className="text-muted-foreground">
              Manage and view your assessment history
            </p>
          </div>
          <Link href="/assessment/new">
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed / In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getCompletedCount()} / {getInProgressCount()}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageScore()}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "ALL" ? "default" : "outline"}
                  onClick={() => setFilterStatus("ALL")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                  onClick={() => setFilterStatus("COMPLETED")}
                  size="sm"
                >
                  Completed
                </Button>
                <Button
                  variant={
                    filterStatus === "IN_PROGRESS" ? "default" : "outline"
                  }
                  onClick={() => setFilterStatus("IN_PROGRESS")}
                  size="sm"
                >
                  In Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessments List */}
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">
                  {assessments.length === 0
                    ? "No assessments yet"
                    : "No matching assessments"}
                </h3>
                <p className="mt-1 text-muted-foreground">
                  {assessments.length === 0
                    ? "Get started by creating your first assessment."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {assessments.length === 0 && (
                  <Link href="/">
                    <Button className="mt-4">Create Assessment</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {assessment.subjectName}
                        </h3>
                        {assessment.shortId && (
                          <Badge variant="outline" className="text-xs">
                            {assessment.shortId}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            assessment.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                          className="flex items-center gap-1"
                        >
                          {assessment.status === "COMPLETED" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {assessment.status === "COMPLETED"
                            ? "Complete"
                            : "In Progress"}
                        </Badge>
                        {assessment.status === "COMPLETED" &&
                          assessment.scores && (
                            <Badge
                              className={getRiskLevelColor(
                                getOverallRiskLevel(assessment.scores) || ""
                              )}
                            >
                              {getOverallRiskLevel(assessment.scores)} Risk
                            </Badge>
                          )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Started:{" "}
                            {format(
                              new Date(assessment.startedAt),
                              "MMM dd, yyyy"
                            )}
                          </div>
                          {assessment.completedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Completed:{" "}
                              {format(
                                new Date(assessment.completedAt),
                                "MMM dd, yyyy"
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {assessment.scores && assessment.scores.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(() => {
                            // Deduplicate scores by domain, keeping the latest score per domain
                            const latestScoresByDomain: Record<string, any> =
                              {};
                            assessment.scores.forEach((score) => {
                              if (
                                !latestScoresByDomain[score.domain] ||
                                new Date(score.timestamp || 0) >
                                  new Date(
                                    latestScoresByDomain[score.domain]
                                      .timestamp || 0
                                  )
                              ) {
                                latestScoresByDomain[score.domain] = score;
                              }
                            });

                            return Object.values(latestScoresByDomain).map(
                              (score, index) => (
                                <Badge
                                  key={`${assessment.id}-${score.domain}-latest`}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {score.domainDisplayName || score.domain}:{" "}
                                  {score.rawScore}/{score.totalPossible}
                                </Badge>
                              )
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {assessment.status === "IN_PROGRESS" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAssessment(assessment.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleShareClick(assessment.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Share className="h-4 w-4 mr-2" />
                                Share Assessment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(assessment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Assessment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAssessment(assessment.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Link href={`/assessment/${assessment.id}/results`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Results
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePDF(assessment.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleShareClick(assessment.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Share className="h-4 w-4 mr-2" />
                                Share Assessment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(assessment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Assessment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Share Assessment Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Assessment</DialogTitle>
              <DialogDescription>
                Create a shareable link for this assessment. You can control who
                can access it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy Setting</Label>
                <Select
                  value={sharePrivacy}
                  onValueChange={(value) =>
                    setSharePrivacy(
                      value as "PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Public - Anyone with the link can view
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Private - Only you can view
                      </div>
                    </SelectItem>
                    <SelectItem value="PASSWORD_PROTECTED">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Password Protected - Requires password
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sharePrivacy === "PASSWORD_PROTECTED" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    placeholder="Enter password for access"
                  />
                </div>
              )}

              {shareableLink && (
                <div className="space-y-2">
                  <Label>Shareable Link</Label>
                  <div className="flex space-x-2">
                    <Input value={shareableLink} readOnly />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(shareableLink);
                        // You might want to add a toast notification here
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleShareCancel}>
                Cancel
              </Button>
              <Button onClick={handleShareConfirm} disabled={isSharing}>
                {isSharing
                  ? "Creating..."
                  : shareableLink
                    ? "Update Link"
                    : "Create Link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Assessment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this assessment? This action
                cannot be undone. All associated data including scores,
                messages, and recommendations will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Assessment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessment Detail Sidebar */}
      {selectedAssessmentId && (
        <div className="w-1/2 bg-background border-l shadow-lg flex flex-col h-full min-h-0">
          <AssessmentDetailSidebar
            assessmentId={selectedAssessmentId}
            onClose={handleCloseSidebar}
          />
        </div>
      )}
    </div>
  );
}
