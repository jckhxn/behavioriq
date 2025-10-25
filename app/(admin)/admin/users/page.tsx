"use client";

import { useState, useEffect } from "react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, RefreshCw, User, Crown } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  activeLicense: {
    id: string;
    assessmentsAllowed: number;
    assessmentsUsed: number;
    conversationalAssessmentsAllowed: number;
    conversationalAssessmentsUsed: number;
    creditsRemaining: number;
    conversationalCreditsRemaining: number;
    conversationalReportsAllowed: number;
    conversationalReportsUsed: number;
    conversationalReportCreditsRemaining: number | null;
    conversationalReportLimit: number | null;
    hasUnlimitedConversationalReports: boolean;
    license: {
      type: string;
      maxAssessments: number | null;
      maxConversationalReports: number | null;
    };
  } | null;
  totalDocuments: number;
  totalAssessments: number;
  totalChatSessions: number;
}

export default function AdminUsersPage() {
  const { userData } = useUserData();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [assessmentCredits, setAssessmentCredits] = useState(0);
  const [conversationalCredits, setConversationalCredits] = useState(0);
  const [
    conversationalReportCredits,
    setConversationalReportCredits,
  ] = useState(0);
  const [assigning, setAssigning] = useState(false);

  const formatCreditDisplay = (
    remaining?: number | null,
    limit?: number | null
  ) => {
    const formattedRemaining =
      remaining === null ? "∞" : Number(remaining ?? 0).toString();
    const formattedLimit =
      limit === null ? "∞" : Number(limit ?? 0).toString();
    return `${formattedRemaining} / ${formattedLimit}`;
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCreditDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
      setAssessmentCredits(0);
      setConversationalCredits(0);
      setConversationalReportCredits(0);
    }
  };

  useEffect(() => {
    if (userData && userData.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    if (userData?.role === "SUPER_ADMIN") {
      fetchUsers();
    }
  }, [userData, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCredits = async () => {
    if (!selectedUser) return;

    try {
      setAssigning(true);
      const response = await fetch(
        `/api/admin/users/${selectedUser.id}/credits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentCredits,
            conversationalCredits,
            conversationalReportCredits,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign credits");

      const assignedParts = [
        assessmentCredits
          ? `${assessmentCredits} assessment ${
              Math.abs(assessmentCredits) === 1 ? "credit" : "credits"
            }`
          : null,
        conversationalCredits
          ? `${conversationalCredits} conversational ${
              Math.abs(conversationalCredits) === 1 ? "credit" : "credits"
            }`
          : null,
        conversationalReportCredits
          ? `${conversationalReportCredits} conversational report ${
              Math.abs(conversationalReportCredits) === 1
                ? "credit"
                : "credits"
            }`
          : null,
      ].filter(Boolean);

      if (assignedParts.length) {
        toast.success(
          `Assigned ${assignedParts.join(", ")} to ${selectedUser.email}`
        );
      } else {
        toast.success(`No credits changed for ${selectedUser.email}`);
      }

      handleDialogOpenChange(false);
      fetchUsers();
    } catch (error) {
      console.error("Error assigning credits:", error);
      toast.error("Failed to assign credits");
    } finally {
      setAssigning(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      SUPER_ADMIN: { variant: "destructive", icon: Crown },
      ADMIN: { variant: "default", icon: Crown },
      USER: { variant: "secondary", icon: User },
    };

    const config = variants[role] || variants.USER;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getLicenseBadge = (type: string) => {
    const colors: Record<string, string> = {
      // Core Plans
      CORE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      ANNUAL_CORE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",

      // Family Plans
      FAMILY: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      ANNUAL_FAMILY: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",

      // District Plans
      DISTRICT_PILOT: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      DISTRICT_STANDARD: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      DISTRICT_PROFESSIONAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
      DISTRICT_ENTERPRISE: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",

      // Promotional
      DISCOUNTED_CORE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
      DISCOUNTED_FAMILY: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    };

    return (
      <Badge className={colors[type] || "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400"}>
        {type}
      </Badge>
    );
  };

  if (userData?.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, assign credits, and view system statistics
          </p>
        </div>

        {/* Search and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchUsers} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              View and manage all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead className="text-right">
                        Assessment Credits
                      </TableHead>
                      <TableHead className="text-right">Conv Credits</TableHead>
                      <TableHead className="text-right">Conv Reports</TableHead>
                      <TableHead className="text-right">Assessments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            {user.name && (
                              <div className="text-sm text-muted-foreground">
                                {user.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.activeLicense ? (
                            getLicenseBadge(user.activeLicense.license.type)
                          ) : (
                            <Badge variant="outline">No License</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.activeLicense ? (
                            <span>
                              {user.activeLicense.creditsRemaining} /{" "}
                              {user.activeLicense.assessmentsAllowed}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.activeLicense ? (
                            <span>
                              {user.activeLicense.conversationalCreditsRemaining} /{" "}
                              {user.activeLicense.conversationalAssessmentsAllowed}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.activeLicense ? (
                            <span>
                              {formatCreditDisplay(
                                user.activeLicense.conversationalReportCreditsRemaining,
                                user.activeLicense.conversationalReportLimit
                              )}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.totalAssessments}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              handleDialogOpenChange(true);
                            }}
                            disabled={!user.activeLicense}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Credits
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Credits Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Credits</DialogTitle>
            <DialogDescription>
              Add credits to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assessment-credits">Assessment Credits</Label>
              <Input
                id="assessment-credits"
                type="number"
                value={assessmentCredits}
                onChange={(e) => setAssessmentCredits(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Current: {selectedUser?.activeLicense?.creditsRemaining || 0} remaining
              </p>
            </div>
            <div>
              <Label htmlFor="conversational-credits">Conversational Credits</Label>
              <Input
                id="conversational-credits"
                type="number"
                value={conversationalCredits}
                onChange={(e) => setConversationalCredits(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Current: {selectedUser?.activeLicense?.conversationalCreditsRemaining || 0} remaining
              </p>
            </div>
            <div>
              <Label htmlFor="conversational-report-credits">
                Conversational Report Credits
              </Label>
              <Input
                id="conversational-report-credits"
                type="number"
                value={conversationalReportCredits}
                onChange={(e) =>
                  setConversationalReportCredits(parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Current:{" "}
                {selectedUser?.activeLicense
                  ? formatCreditDisplay(
                      selectedUser.activeLicense.conversationalReportCreditsRemaining,
                      selectedUser.activeLicense.conversationalReportLimit
                    )
                  : "0 / 0"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignCredits} disabled={assigning}>
              {assigning ? "Assigning..." : "Assign Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
