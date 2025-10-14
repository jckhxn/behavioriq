"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/use-supabase-user";
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
import { CreditsDisplay } from "@/components/dashboard/CreditsDisplay";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AssessmentDomain } from "@prisma/client";
import { AssessmentDetailSidebar } from "./AssessmentDetailSidebar";
import { toast } from "sonner";
import ConversationalTrialModule from "@/components/dashboard/ConversationalTrialModule";
import { formatPrice, PRICING } from "@/lib/config/pricing";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";

interface Assessment {
  id: string;
  shortId?: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  completedAt?: string;
  isConversational?: boolean;
  hasEnhancedReport?: boolean;
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
  const { user } = useUser();
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
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  // License state
  const [userLicense, setUserLicense] = useState<{
    type: string;
    features: string[];
    maxAssessments?: number;
  } | null>(null);

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
  const [existingShareLinks, setExistingShareLinks] = useState<any[]>([]);
  const [showExistingLinksDialog, setShowExistingLinksDialog] = useState(false);
  const [editingShareLink, setEditingShareLink] = useState<any>(null);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<any>(null);

  // Assessment detail sidebar state
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);

  // Expanded assessments state for showing all scores
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (assessmentId: string) => {
    setExpandedAssessments((prev) => {
      const next = new Set(prev);
      if (next.has(assessmentId)) {
        next.delete(assessmentId);
      } else {
        next.add(assessmentId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchAssessments();
    fetchLicenseInfo();
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

  const fetchLicenseInfo = async () => {
    try {
      const response = await fetch("/api/user/license");
      if (response.ok) {
        const data = await response.json();
        if (data.hasLicense && data.license) {
          setUserLicense({
            type: data.license.type,
            features: data.license.features,
            maxAssessments: data.license.maxAssessments,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch license info:", error);
    }
  };

  const generatePDF = async (assessmentId: string) => {
    setGeneratingPdfId(assessmentId);

    // Show immediate feedback that PDF generation has started
    toast.info("Generating PDF report...", {
      description: "This may take a few seconds. Please wait.",
      duration: 10000,
    });

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

        // Show success message
        toast.success("PDF downloaded successfully!", {
          description: "Your assessment report is ready.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to generate PDF", {
          description: errorData.error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setGeneratingPdfId(null);
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

        // Show success message with toast notification
        toast.success("Assessment deleted successfully");
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        console.error("Failed to delete assessment:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          assessmentId: assessmentToDelete,
        });

        const errorMessage =
          errorData.error ||
          errorData.details ||
          `Failed to delete assessment (${response.status})`;
        toast.error(errorMessage);

        // If 404, the assessment doesn't exist - refetch to sync UI state
        if (response.status === 404) {
          console.log(
            "[Delete] Assessment not found - refreshing list to sync state"
          );
          await fetchAssessments();
          setDeleteDialogOpen(false);
          setAssessmentToDelete(null);
        }
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  // Share functions
  const handleShareClick = async (assessmentId: string) => {
    setAssessmentToShare(assessmentId);

    // Check for existing share links for this assessment
    try {
      const response = await fetch("/api/share");
      if (response.ok) {
        const allLinks = await response.json();
        const existingLinks = allLinks.filter(
          (link: any) =>
            link.assessment.id === assessmentId ||
            link.assessment.shortId === assessmentId
        );

        if (existingLinks.length > 0) {
          // Show existing links with options to edit
          setExistingShareLinks(existingLinks);
          setShowExistingLinksDialog(true);
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching existing share links:", error);
    }

    // No existing links, show create dialog
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
      // Determine if we're editing or creating
      const isEditing = editingShareLink !== null;
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/share/${editingShareLink.shareCode}`
        : "/api/share";

      const response = await fetch(url, {
        method,
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

        if (isEditing) {
          // Update existing link in both lists
          setExistingShareLinks((prev) =>
            prev.map((link) =>
              link.id === editingShareLink.id
                ? { ...shareLink, assessment: editingShareLink.assessment }
                : link
            )
          );
          setShareableLinks((prev) =>
            prev.map((link) =>
              link.id === editingShareLink.id
                ? { ...shareLink, assessment: editingShareLink.assessment }
                : link
            )
          );

          toast.success("Share link updated and copied to clipboard!", {
            description: shareLink.shareUrl,
            duration: 5000,
          });
        } else {
          // Add new link to local state
          setShareableLinks((prev) => [shareLink, ...prev]);

          toast.success("Share link created and copied to clipboard!", {
            description: shareLink.shareUrl,
            duration: 5000,
          });
        }

        setShareDialogOpen(false);
        setAssessmentToShare(null);
        setEditingShareLink(null); // Clear editing state
      } else {
        const error = await response.json();
        console.error(
          `Failed to ${isEditing ? "update" : "create"} share link:`,
          error
        );
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} share link. Please try again.`
        );
      }
    } catch (error) {
      console.error(
        `Error ${editingShareLink ? "updating" : "creating"} share link:`,
        error
      );
      toast.error(
        `Failed to ${editingShareLink ? "update" : "create"} share link. Please try again.`
      );
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleShareCancel = () => {
    setShareDialogOpen(false);
    setAssessmentToShare(null);
    setEditingShareLink(null); // Clear editing state
    setSharePrivacy("PRIVATE");
    setSharePassword("");
    setShareExpiresAt("");
  };

  const handleEditShareLink = (link: any) => {
    setShowExistingLinksDialog(false);
    setEditingShareLink(link); // Store the link being edited
    setAssessmentToShare(link.assessment.id);
    setSharePrivacy(link.privacy);
    setSharePassword(link.password || "");
    setShareExpiresAt(
      link.expiresAt ? new Date(link.expiresAt).toISOString().split("T")[0] : ""
    );
    setShareDialogOpen(true);
  };

  const handleDeleteShareLink = (link: any) => {
    setLinkToDelete(link);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteShareLink = async () => {
    if (!linkToDelete) return;

    try {
      const response = await fetch(`/api/share/${linkToDelete.shareCode}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from existing links list
        setExistingShareLinks((prev) =>
          prev.filter((l) => l.id !== linkToDelete.id)
        );

        // Also remove from main shareable links list
        setShareableLinks((prev) =>
          prev.filter((l) => l.id !== linkToDelete.id)
        );

        toast.success("Share link deleted successfully!");
        setDeleteConfirmOpen(false);
        setLinkToDelete(null);
      } else {
        const error = await response.json();
        console.error("Failed to delete share link:", error);
        toast.error("Failed to delete share link. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast.error("Failed to delete share link. Please try again.");
    }
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
        className={`space-y-4 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 md:pt-6 transition-all duration-300 overflow-auto ${
          selectedAssessmentId ? "hidden md:block md:w-1/2" : "w-full"
        }`}
      >
        <div className="max-w-6xl mx-auto w-full space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Assessments
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage and view your assessment history
              </p>
            </div>
            {(userLicense?.type === "BASIC" &&
              userLicense?.maxAssessments === 0) ||
            userLicense?.maxAssessments === 0 ? (
              <Button
                id="create-assessment-btn"
                disabled
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 opacity-50 cursor-not-allowed shrink-0"
              >
                <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden xs:inline">New </span>Assessment
              </Button>
            ) : (
              <Link href="/assessment/new">
                <Button
                  id="create-assessment-btn"
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shrink-0"
                >
                  <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">New </span>Assessment
                </Button>
              </Link>
            )}
          </div>

          {/* Assessment Credits Display */}
          <div id="credits-display">
            <CreditsDisplay />
          </div>

          {/* Onboarding Checklist */}
          <OnboardingChecklist />

          {/* BASIC Account with 0 Assessments Banner */}
          {userLicense?.type === "BASIC" &&
            userLicense?.maxAssessments === 0 && (
              <Card className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                        Basic Account - View Only Access
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                        You have view-only access to your past assessments.
                        Purchase an assessment or subscribe for unlimited
                        access.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                        <Link href="/pricing" className="w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-amber-600 hover:bg-amber-700 w-full"
                          >
                            Buy Assessment -{" "}
                            {formatPrice(PRICING.SINGLE_ASSESSMENT)}
                          </Button>
                        </Link>
                        <Link href="/pricing" className="w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 w-full"
                          >
                            <span className="hidden sm:inline">
                              Subscribe -{" "}
                            </span>
                            {formatPrice(PRICING.MONTHLY_SUBSCRIPTION)}/mo
                          </Button>
                        </Link>
                        <Link href="/pricing" className="w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 w-full"
                          >
                            <span className="hidden sm:inline">
                              Subscribe -{" "}
                            </span>
                            {formatPrice(PRICING.ANNUAL_SUBSCRIPTION)}/yr
                            <span className="hidden md:inline">
                              {" "}
                              (Save $
                              {(PRICING.MONTHLY_SUBSCRIPTION * 12 -
                                PRICING.ANNUAL_SUBSCRIPTION) /
                                100}
                              !)
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Conversational Trial Module - Always show for registered users */}
          {(() => {
            const conversationalAssessment = assessments.find(
              (a) => a.isConversational
            );

            if (conversationalAssessment) {
              // User has started/completed a conversational trial
              const hasCompletedTrial =
                conversationalAssessment.status === "COMPLETED";
              const hasEnhancedReport =
                conversationalAssessment.hasEnhancedReport || false;

              // Hide the module entirely if trial is complete but enhanced report not purchased
              if (hasCompletedTrial && !hasEnhancedReport) {
                return null;
              }

              return (
                <ConversationalTrialModule
                  hasCompletedTrial={hasCompletedTrial}
                  hasEnhancedReport={hasEnhancedReport}
                  assessmentId={conversationalAssessment.id}
                />
              );
            }

            // No conversational trial yet - show teaser to start one
            return (
              <ConversationalTrialModule
                hasCompletedTrial={false}
                hasEnhancedReport={false}
                assessmentId={undefined}
              />
            );
          })()}

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
                    variant={
                      filterStatus === "COMPLETED" ? "default" : "outline"
                    }
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
                    <Link href="/assessment/new">
                      <Button className="mt-4">Start New Assessment</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAssessments.map((assessment) => (
                <Card
                  key={assessment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold truncate">
                            {assessment.subjectName}
                          </h3>
                          {assessment.shortId && (
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs shrink-0"
                            >
                              {assessment.shortId}
                            </Badge>
                          )}
                          {/* Enhanced report badge disabled for now */}
                          {/* {assessment.hasEnhancedReport && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            ✨ Enhanced
                          </Badge>
                        )} */}
                          <Badge
                            variant={
                              assessment.status === "COMPLETED"
                                ? "default"
                                : "secondary"
                            }
                            className="flex items-center gap-1 text-[10px] sm:text-xs shrink-0"
                          >
                            {assessment.status === "COMPLETED" ? (
                              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            ) : (
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            )}
                            <span className="hidden xs:inline">
                              {assessment.status === "COMPLETED"
                                ? "Complete"
                                : "In Progress"}
                            </span>
                          </Badge>
                          {assessment.status === "COMPLETED" &&
                            assessment.scores && (
                              <Badge
                                className={`${getRiskLevelColor(
                                  getOverallRiskLevel(assessment.scores) || ""
                                )} text-[10px] sm:text-xs shrink-0`}
                              >
                                {getOverallRiskLevel(assessment.scores)} Risk
                              </Badge>
                            )}
                        </div>

                        <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 shrink-0">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">
                                Started:{" "}
                              </span>
                              <span className="hidden sm:inline">
                                {format(
                                  new Date(assessment.startedAt),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                              <span className="sm:hidden">
                                {format(
                                  new Date(assessment.startedAt),
                                  "MM/dd/yy"
                                )}
                              </span>
                            </div>
                            {assessment.completedAt && (
                              <div className="flex items-center gap-1 shrink-0">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">
                                  Completed:{" "}
                                </span>
                                <span className="hidden sm:inline">
                                  {format(
                                    new Date(assessment.completedAt),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                                <span className="sm:hidden">
                                  {format(
                                    new Date(assessment.completedAt),
                                    "MM/dd/yy"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {assessment.scores &&
                          assessment.scores.length > 0 &&
                          (() => {
                            // Filter out incomplete scores (0/0 or in-progress)
                            const completedScores = assessment.scores.filter(
                              (score) =>
                                score.totalPossible > 0 && score.rawScore >= 0
                            );

                            if (completedScores.length === 0) return null;

                            const isExpanded = expandedAssessments.has(
                              assessment.id
                            );
                            const displayScores = isExpanded
                              ? completedScores
                              : completedScores.slice(0, 3);

                            return (
                              <div className="mb-2 sm:mb-3">
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {displayScores.map((score, index) => (
                                    <Badge
                                      key={`${assessment.id}-${score.domain}-${index}`}
                                      variant="outline"
                                      className="text-[10px] sm:text-xs"
                                    >
                                      <span className="hidden sm:inline">
                                        {score.domainDisplayName ||
                                          score.domain ||
                                          "Unknown"}
                                        : {score.rawScore}/{score.totalPossible}
                                      </span>
                                      <span className="sm:hidden">
                                        {(
                                          score.domainDisplayName ||
                                          score.domain ||
                                          "Unknown"
                                        ).slice(0, 8)}
                                        : {score.rawScore}/{score.totalPossible}
                                      </span>
                                    </Badge>
                                  ))}
                                </div>

                                {completedScores.length > 3 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1.5 sm:mt-2 h-6 sm:h-7 text-[10px] sm:text-xs px-2"
                                    onClick={() =>
                                      toggleExpanded(assessment.id)
                                    }
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                        Show Less
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                        Show All ({completedScores.length}{" "}
                                        domains)
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            );
                          })()}
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {assessment.status === "IN_PROGRESS" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewAssessment(assessment.id)
                              }
                              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                            >
                              <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">
                                {assessment.isConversational ? "Resume Chat" : "Continue"}
                              </span>
                              <span className="sm:hidden">
                                {assessment.isConversational ? "Resume" : "Continue"}
                              </span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                                >
                                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleShareClick(assessment.id)
                                  }
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                                >
                                  <Share className="h-4 w-4 mr-2" />
                                  Share Assessment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteClick(assessment.id)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
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
                              onClick={() =>
                                handleViewAssessment(assessment.id)
                              }
                              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">
                                View Results
                              </span>
                              <span className="sm:hidden">View</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generatePDF(assessment.id)}
                              disabled={generatingPdfId === assessment.id}
                              className={`text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                                generatingPdfId === assessment.id
                                  ? "cursor-wait opacity-75"
                                  : ""
                              }`}
                            >
                              {generatingPdfId === assessment.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current sm:mr-1"></div>
                                  <span className="hidden sm:inline animate-pulse">
                                    Generating...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">PDF</span>
                                </>
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                                >
                                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleShareClick(assessment.id)
                                  }
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                                >
                                  <Share className="h-4 w-4 mr-2" />
                                  Share Assessment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteClick(assessment.id)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
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
        </div>

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
                      <div className="flex items-center text-foreground">
                        <Globe className="h-4 w-4 mr-2" />
                        Public - Anyone with the link can view
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center text-foreground">
                        <Lock className="h-4 w-4 mr-2" />
                        Private - Only you can view
                      </div>
                    </SelectItem>
                    <SelectItem value="PASSWORD_PROTECTED">
                      <div className="flex items-center text-foreground">
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
                    autoComplete="new-password"
                    data-1p-ignore
                    data-lpignore="true"
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
                        toast.success("Share link copied to clipboard!");
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
              <Button onClick={handleShareConfirm} disabled={isCreatingShare}>
                {isCreatingShare
                  ? editingShareLink
                    ? "Updating..."
                    : "Creating..."
                  : editingShareLink
                    ? "Update Link"
                    : "Create Link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Existing Share Links Dialog */}
        <Dialog
          open={showExistingLinksDialog}
          onOpenChange={setShowExistingLinksDialog}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Existing Share Links</DialogTitle>
              <DialogDescription>
                This assessment already has share links. You can manage existing
                links or create a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {existingShareLinks.map((link: any, index: number) => (
                <Card key={link.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {link.privacy === "PUBLIC" ? (
                          <Globe className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                        <span className="font-medium">{link.privacy}</span>
                        <Badge
                          variant={link.isActive ? "default" : "secondary"}
                        >
                          {link.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {link.viewCount} views • Created{" "}
                        {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                      {link.expiresAt && (
                        <p className="text-sm text-muted-foreground">
                          Expires{" "}
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/share/${link.shareCode}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Share link copied to clipboard!");
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditShareLink(link)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteShareLink(link)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowExistingLinksDialog(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowExistingLinksDialog(false);
                  setEditingShareLink(null); // Clear editing state for new link
                  setShareDialogOpen(true);
                  setSharePrivacy("PRIVATE");
                  setSharePassword("");
                  setShareExpiresAt("");
                }}
              >
                Create New Link
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Share Link</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this share link? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {linkToDelete && (
              <div className="space-y-2 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Privacy:</span>
                  <Badge>{linkToDelete.privacy}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Views:</span>
                  <span className="font-medium">
                    {linkToDelete.viewCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge
                    variant={linkToDelete.isActive ? "default" : "secondary"}
                  >
                    {linkToDelete.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setLinkToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteShareLink}>
                Delete Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessment Detail Sidebar */}
      {selectedAssessmentId && (
        <div className="w-full md:w-1/2 bg-background border-l shadow-lg flex flex-col h-full min-h-0">
          <AssessmentDetailSidebar
            assessmentId={selectedAssessmentId}
            onClose={handleCloseSidebar}
          />
        </div>
      )}
    </div>
  );
}
