"use client";

import { useState, useEffect } from "react";
interface ChildProfile {
  id: string;
  name: string;
}
import { useUser } from "@/lib/hooks/use-supabase-user";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CreditsDisplay } from "@/components/dashboard/CreditsDisplay";
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
  Trash2,
  MoreHorizontal,
  Share,
  Lock,
  Globe,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AssessmentDetailSidebar } from "./AssessmentDetailSidebar";
import { toast } from "sonner";
import ConversationalTrialModule from "@/components/dashboard/ConversationalTrialModule";
import { formatPrice, PRICING } from "@/lib/config/pricing";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { RenameAssessmentDialog } from "./RenameAssessmentDialog";
import { cn } from "@/lib/utils";

interface Assessment {
  id: string;
  shortId?: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
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
  childProfile?: {
    id: string;
    name: string;
  };
  childprofileid?: string;
}

export function AssessmentsView() {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  // Fetch child profiles for filter tabs
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch("/api/children");
        if (res.ok) {
          const data = await res.json();
          setChildProfiles(data);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchChildren();
  }, []);
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

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [assessmentToRename, setAssessmentToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

    // Filter by child profile
    if (selectedChildId && selectedChildId !== "all") {
      filtered = filtered.filter(
        (assessment) =>
          assessment.childProfile?.id === selectedChildId ||
          assessment.childprofileid === selectedChildId
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((assessment) =>
        assessment.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((assessment) =>
        filterStatus === "IN_PROGRESS"
          ? assessment.status === "IN_PROGRESS" ||
            assessment.status === "ABANDONED"
          : assessment.status === filterStatus
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, filterStatus, selectedChildId]);

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

  const handleRenameClick = (assessmentId: string, currentName: string) => {
    setAssessmentToRename({ id: assessmentId, name: currentName });
    setRenameDialogOpen(true);
  };

  const handleRenameSuccess = (newName: string) => {
    if (assessmentToRename) {
      // Update the assessment in local state
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === assessmentToRename.id ? { ...a, subjectName: newName } : a
        )
      );
      setFilteredAssessments((prev) =>
        prev.map((a) =>
          a.id === assessmentToRename.id ? { ...a, subjectName: newName } : a
        )
      );
    }
    setAssessmentToRename(null);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "bg-dash-mint-50 text-dash-mint-700";
      case "moderate":
        return "bg-dash-amber-50 text-dash-amber-700";
      case "high":
        return "bg-dash-rose-50 text-dash-rose-700";
      case "very_high":
        return "bg-dash-rose-50 text-dash-rose-700";
      default:
        return "bg-dash-sunk text-dash-ink-500";
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
    assessments.filter(
      (a) => a.status === "IN_PROGRESS" || a.status === "ABANDONED"
    ).length;

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
      <div className="py-16 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-dash-indigo-500 opacity-60 animate-pulse" />
      </div>
    );
  }

  // Filter child profiles to only those with assessments
  const childIdsWithAssessments = Array.from(
    new Set(
      assessments
        .map((a) => a.childProfile?.id || a.childprofileid)
        .filter(Boolean)
    )
  );
  const filteredChildProfiles = childProfiles.filter((child) =>
    childIdsWithAssessments.includes(child.id)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-1">
            Dashboard
          </p>
          <h2
            className="text-[28px] font-semibold text-dash-ink-900"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            Assessments
          </h2>
        </div>
        {(userLicense?.type === "BASIC" &&
          userLicense?.maxAssessments === 0) ||
        userLicense?.maxAssessments === 0 ? (
          <button
            id="create-assessment-btn"
            disabled
            className="h-9 px-4 rounded-lg bg-dash-indigo-500 text-white text-[13px] font-semibold border-none cursor-not-allowed opacity-50 flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} />
            New assessment
          </button>
        ) : (
          <Link href="/assessment/new">
            <button
              id="create-assessment-btn"
              className="h-9 px-4 rounded-lg bg-dash-indigo-500 text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              New assessment
            </button>
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
          <div className="bg-dash-amber-50 border border-dash-amber-700/20 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-dash-amber-700/10 shrink-0">
                <Lock className="h-5 w-5 text-dash-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dash-amber-700">
                  Basic Account — View Only Access
                </h3>
                <p className="text-[13px] text-dash-amber-700/80 mt-1">
                  You have view-only access to your past assessments. Purchase
                  an assessment or subscribe for unlimited access.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <button className="h-8 px-3 rounded-lg bg-dash-amber-700 text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity w-full">
                      Buy Assessment — {formatPrice(PRICING.SINGLE_ASSESSMENT)}
                    </button>
                  </Link>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <button className="h-8 px-3 rounded-lg border border-dash-amber-700/40 text-dash-amber-700 bg-transparent text-[13px] font-medium cursor-pointer hover:bg-dash-amber-700/10 transition-colors w-full">
                      <span className="hidden sm:inline">Subscribe — </span>
                      {formatPrice(PRICING.MONTHLY_CORE)}/mo
                    </button>
                  </Link>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <button className="h-8 px-3 rounded-lg border border-dash-amber-700/40 text-dash-amber-700 bg-transparent text-[13px] font-medium cursor-pointer hover:bg-dash-amber-700/10 transition-colors w-full">
                      <span className="hidden sm:inline">Subscribe — </span>
                      {formatPrice(PRICING.ANNUAL_CORE)}/yr
                      <span className="hidden md:inline">
                        {" "}
                        (Save $
                        {(PRICING.MONTHLY_CORE * 12 - PRICING.ANNUAL_CORE) /
                          100}
                        !)
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-4">
          <p className="text-[12px] text-dash-ink-500 mb-1">Total Assessments</p>
          <div className="text-[26px] font-semibold text-dash-ink-900">
            {assessments.length}
          </div>
        </div>
        <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-4">
          <p className="text-[12px] text-dash-ink-500 mb-1">Completed / In Progress</p>
          <div className="text-[26px] font-semibold text-dash-ink-900">
            {getCompletedCount()} / {getInProgressCount()}
          </div>
        </div>
        <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-4">
          <p className="text-[12px] text-dash-ink-500 mb-1">Average Score</p>
          <div className="text-[26px] font-semibold text-dash-ink-900">
            {getAverageScore()}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Child filter tabs */}
        {filteredChildProfiles.length > 0 && (
          <>
            <button
              className={cn(
                "h-8 px-3 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors",
                selectedChildId === null || selectedChildId === "all"
                  ? "bg-dash-indigo-50 text-dash-indigo-600"
                  : "bg-dash-sunk text-dash-ink-700 hover:text-dash-ink-900"
              )}
              onClick={() => setSelectedChildId("all")}
            >
              All Children
            </button>
            {filteredChildProfiles.map((child) => (
              <button
                key={child.id}
                className={cn(
                  "h-8 px-3 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors",
                  selectedChildId === child.id
                    ? "bg-dash-indigo-50 text-dash-indigo-600"
                    : "bg-dash-sunk text-dash-ink-700 hover:text-dash-ink-900"
                )}
                onClick={() => setSelectedChildId(child.id)}
              >
                {child.name || "Unnamed"}
              </button>
            ))}
          </>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dash-ink-300 pointer-events-none"
          />
          <input
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-dash-ink-200 bg-dash-canvas text-[13px] text-dash-ink-900 font-[inherit] outline-none focus:border-dash-indigo-500"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status filter tabs */}
        <button
          className={cn(
            "h-8 px-3 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors",
            filterStatus === "ALL"
              ? "bg-dash-indigo-50 text-dash-indigo-600"
              : "bg-dash-sunk text-dash-ink-700 hover:text-dash-ink-900"
          )}
          onClick={() => setFilterStatus("ALL")}
        >
          All
        </button>
        <button
          className={cn(
            "h-8 px-3 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors",
            filterStatus === "COMPLETED"
              ? "bg-dash-indigo-50 text-dash-indigo-600"
              : "bg-dash-sunk text-dash-ink-700 hover:text-dash-ink-900"
          )}
          onClick={() => setFilterStatus("COMPLETED")}
        >
          Completed
        </button>
        <button
          className={cn(
            "h-8 px-3 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors",
            filterStatus === "IN_PROGRESS"
              ? "bg-dash-indigo-50 text-dash-indigo-600"
              : "bg-dash-sunk text-dash-ink-700 hover:text-dash-ink-900"
          )}
          onClick={() => setFilterStatus("IN_PROGRESS")}
        >
          In Progress
        </button>
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="py-16 text-center">
          <FileText size={32} className="text-dash-ink-300 mx-auto mb-3" />
          <div className="text-[15px] font-semibold text-dash-ink-900 mb-1">
            {assessments.length === 0
              ? "No assessments yet"
              : "No matching assessments"}
          </div>
          <p className="text-[13px] text-dash-ink-500">
            {assessments.length === 0
              ? "Get started by creating your first assessment."
              : "Try adjusting your search or filter criteria."}
          </p>
          {assessments.length === 0 && (
            <Link href="/assessment/new">
              <button className="mt-4 h-9 px-4 rounded-lg bg-dash-indigo-500 text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity">
                Start New Assessment
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-dash-surface border border-dash-ink-100 rounded-xl p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  {/* Name + badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <h3 className="text-[15px] font-semibold text-dash-ink-900 truncate">
                      {assessment.subjectName}
                    </h3>
                    {assessment.shortId && (
                      <span className="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-dash-sunk text-dash-ink-500">
                        {assessment.shortId}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
                        assessment.status === "COMPLETED"
                          ? "bg-dash-mint-50 text-dash-mint-700"
                          : "bg-dash-amber-50 text-dash-amber-700"
                      )}
                    >
                      {assessment.status === "COMPLETED" ? (
                        <CheckCircle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {assessment.status === "COMPLETED"
                        ? "Complete"
                        : "In Progress"}
                    </span>
                    {assessment.status === "COMPLETED" &&
                      assessment.scores && (
                        <span
                          className={cn(
                            "inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md",
                            getRiskLevelColor(
                              getOverallRiskLevel(assessment.scores) || ""
                            )
                          )}
                        >
                          {getOverallRiskLevel(assessment.scores)} Risk
                        </span>
                      )}
                  </div>

                  {/* Dates row */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-[12px] text-dash-ink-500">
                      <Calendar size={12} />
                      <span className="hidden sm:inline">Started: </span>
                      <span className="hidden sm:inline">
                        {format(new Date(assessment.startedAt), "MMM dd, yyyy")}
                      </span>
                      <span className="sm:hidden">
                        {format(new Date(assessment.startedAt), "MM/dd/yy")}
                      </span>
                    </div>
                    {assessment.completedAt && (
                      <div className="flex items-center gap-1 text-[12px] text-dash-ink-500">
                        <CheckCircle size={12} />
                        <span className="hidden sm:inline">Completed: </span>
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

                  {/* Domain score chips */}
                  {assessment.scores &&
                    assessment.scores.length > 0 &&
                    (() => {
                      // Filter out incomplete scores (0/0 or in-progress)
                      const completedScores = assessment.scores.filter(
                        (score) =>
                          score.totalPossible > 0 && score.rawScore >= 0
                      );

                      if (completedScores.length === 0) return null;

                      const isExpanded = expandedAssessments.has(assessment.id);
                      const displayScores = isExpanded
                        ? completedScores
                        : completedScores.slice(0, 3);

                      return (
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1.5">
                            {displayScores.map((score, index) => (
                              <span
                                key={`${assessment.id}-${score.domain}-${index}`}
                                className="inline-flex text-[11px] text-dash-ink-500 bg-dash-sunk px-2 py-0.5 rounded-md"
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
                              </span>
                            ))}
                          </div>

                          {completedScores.length > 3 && (
                            <button
                              className="mt-1.5 h-6 px-2 rounded-md text-[11px] text-dash-ink-500 bg-transparent border-none cursor-pointer hover:text-dash-ink-900 flex items-center gap-1"
                              onClick={() => toggleExpanded(assessment.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={11} />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={11} />
                                  Show All ({completedScores.length} domains)
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {assessment.status !== "COMPLETED" ? (
                    <>
                      <button
                        className="h-8 px-3 rounded-lg border border-dash-ink-200 bg-dash-surface text-[13px] font-medium text-dash-ink-700 cursor-pointer hover:bg-dash-sunk transition-colors flex items-center gap-1.5"
                        onClick={() => handleViewAssessment(assessment.id)}
                      >
                        <Play size={12} />
                        <span className="hidden sm:inline">
                          {assessment.isConversational
                            ? "Resume Chat"
                            : "Continue"}
                        </span>
                        <span className="sm:hidden">
                          {assessment.isConversational ? "Resume" : "Continue"}
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleRenameClick(
                                assessment.id,
                                assessment.subjectName
                              )
                            }
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Rename Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShareClick(assessment.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                          >
                            <Share className="h-4 w-4 mr-2" />
                            Share Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(assessment.id)}
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
                      <button
                        className="h-8 px-3 rounded-lg border border-dash-ink-200 bg-dash-surface text-[13px] font-medium text-dash-ink-700 cursor-pointer hover:bg-dash-sunk transition-colors flex items-center gap-1.5"
                        onClick={() => handleViewAssessment(assessment.id)}
                      >
                        <Eye size={12} />
                        <span className="hidden sm:inline">View Results</span>
                        <span className="sm:hidden">View</span>
                      </button>
                      <button
                        className={cn(
                          "h-8 px-3 rounded-lg border border-dash-ink-200 bg-dash-surface text-[13px] font-medium text-dash-ink-700 cursor-pointer hover:bg-dash-sunk transition-colors flex items-center gap-1.5",
                          generatingPdfId === assessment.id
                            ? "cursor-wait opacity-75"
                            : ""
                        )}
                        onClick={() => generatePDF(assessment.id)}
                        disabled={generatingPdfId === assessment.id}
                      >
                        {generatingPdfId === assessment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                            <span className="hidden sm:inline animate-pulse">
                              Generating...
                            </span>
                          </>
                        ) : (
                          <>
                            <Download size={12} />
                            <span className="hidden sm:inline">PDF</span>
                          </>
                        )}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleRenameClick(
                                assessment.id,
                                assessment.subjectName
                              )
                            }
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Rename Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShareClick(assessment.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                          >
                            <Share className="h-4 w-4 mr-2" />
                            Share Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(assessment.id)}
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
            </div>
          ))}
        </div>
      )}

      {/* Assessment Detail — centered modal */}
      <Dialog open={!!selectedAssessmentId} onOpenChange={(open) => { if (!open) handleCloseSidebar(); }}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {selectedAssessmentId && (
            <AssessmentDetailSidebar
              assessmentId={selectedAssessmentId}
              onClose={handleCloseSidebar}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rename Assessment Dialog */}
      <RenameAssessmentDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        assessmentId={assessmentToRename?.id || ""}
        currentName={assessmentToRename?.name || ""}
        onSuccess={handleRenameSuccess}
      />

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

      {/* Delete Assessment Confirmation Dialog */}
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

      {/* Delete Share Link Confirmation Dialog */}
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
  );
}
