"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Minus, RefreshCw, User, Crown, Settings as SettingsIcon } from "lucide-react";
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
    license: {
      id: string;
      type: string;
      maxAssessments: number | null;
    };
  } | null;
  totalDocuments: number;
  totalAssessments: number;
  totalChatSessions: number;
}

export function UserManagementTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [assessmentCreditsChange, setAssessmentCreditsChange] = useState(0);
  const [conversationalCreditsChange, setConversationalCreditsChange] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleManageUser = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const updates: string[] = [];

      // Update role if changed
      if (selectedRole && selectedRole !== selectedUser.role) {
        const roleResponse = await fetch(
          `/api/admin/users/${selectedUser.id}/role`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: selectedRole }),
          }
        );
        if (!roleResponse.ok) throw new Error("Failed to update role");
        updates.push(`role to ${selectedRole}`);
      }

      // Update license if changed
      if (
        selectedLicenseType &&
        selectedLicenseType !== selectedUser.activeLicense?.license.type
      ) {
        const licenseResponse = await fetch(
          `/api/admin/users/${selectedUser.id}/license`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ licenseType: selectedLicenseType }),
          }
        );
        if (!licenseResponse.ok) throw new Error("Failed to update license");
        updates.push(`license to ${selectedLicenseType}`);
      }

      // Update credits if changed
      if (assessmentCreditsChange !== 0 || conversationalCreditsChange !== 0) {
        const creditsResponse = await fetch(
          `/api/admin/users/${selectedUser.id}/credits`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assessmentCredits: assessmentCreditsChange,
              conversationalCredits: conversationalCreditsChange,
            }),
          }
        );
        if (!creditsResponse.ok) throw new Error("Failed to update credits");

        const creditChanges = [];
        if (assessmentCreditsChange !== 0) {
          creditChanges.push(
            `${assessmentCreditsChange > 0 ? "+" : ""}${assessmentCreditsChange} assessment credits`
          );
        }
        if (conversationalCreditsChange !== 0) {
          creditChanges.push(
            `${conversationalCreditsChange > 0 ? "+" : ""}${conversationalCreditsChange} conversational credits`
          );
        }
        updates.push(creditChanges.join(", "));
      }

      if (updates.length > 0) {
        toast.success(
          `Updated ${selectedUser.email}: ${updates.join(", ")}`
        );
      } else {
        toast.info("No changes made");
      }

      setManageDialogOpen(false);
      setAssessmentCreditsChange(0);
      setConversationalCreditsChange(0);
      setSelectedRole("");
      setSelectedLicenseType("");
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error managing user:", error);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
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
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getLicenseBadge = (type: string) => {
    const colors: Record<string, string> = {
      ENTERPRISE:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      PROFESSIONAL:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      BASIC: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    };

    return (
      <Badge className={`${colors[type] || colors.BASIC} text-xs`}>{type}</Badge>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search and Actions */}
      <Card className="border-border bg-card">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm" className="h-8">
              <RefreshCw className="h-3 w-3 mr-1" />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Users ({users.length})</CardTitle>
          <CardDescription className="text-xs">
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">License</TableHead>
                    <TableHead className="text-right text-xs">
                      Assessment Credits
                    </TableHead>
                    <TableHead className="text-right text-xs">
                      Conv Credits
                    </TableHead>
                    <TableHead className="text-right text-xs">
                      Assessments
                    </TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-xs">{user.email}</div>
                          {user.name && (
                            <div className="text-xs text-muted-foreground">
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
                          <Badge variant="outline" className="text-xs">
                            No License
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {user.activeLicense ? (
                          <span>
                            {user.activeLicense.creditsRemaining} /{" "}
                            {user.activeLicense.assessmentsAllowed}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {user.activeLicense ? (
                          <span>
                            {user.activeLicense.conversationalCreditsRemaining} /{" "}
                            {user.activeLicense.conversationalAssessmentsAllowed}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {user.totalAssessments}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedRole(user.role);
                            setSelectedLicenseType(user.activeLicense?.license.type || "");
                            setAssessmentCreditsChange(0);
                            setConversationalCreditsChange(0);
                            setManageDialogOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          <SettingsIcon className="h-3 w-3 mr-1" />
                          Manage
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

      {/* Manage User Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Manage User</DialogTitle>
            <DialogDescription className="text-xs">
              Update role, license, and credits for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role-select" className="text-xs font-semibold">
                Role
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER" className="text-xs">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      USER
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3" />
                      ADMIN
                    </div>
                  </SelectItem>
                  <SelectItem value="SUPER_ADMIN" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3" />
                      SUPER_ADMIN
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current: {selectedUser?.role}
              </p>
            </div>

            {/* License Selection */}
            <div className="space-y-2">
              <Label htmlFor="license-select" className="text-xs font-semibold">
                License Type
              </Label>
              <Select
                value={selectedLicenseType}
                onValueChange={setSelectedLicenseType}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select license" />
                </SelectTrigger>
                <SelectContent>
                  {/* Core Plans */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Core Plans
                  </div>
                  <SelectItem value="CORE" className="text-xs">
                    CORE - $59/mo (2 credits)
                  </SelectItem>
                  <SelectItem value="ANNUAL_CORE" className="text-xs">
                    CORE - $249/yr (2 credits)
                  </SelectItem>

                  {/* Family Plans */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Family Plans
                  </div>
                  <SelectItem value="FAMILY" className="text-xs">
                    FAMILY - $99/mo (5 credits)
                  </SelectItem>
                  <SelectItem value="ANNUAL_FAMILY" className="text-xs">
                    FAMILY - $349/yr (5 credits)
                  </SelectItem>

                  {/* District Plans */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    District Plans
                  </div>
                  <SelectItem value="DISTRICT_PILOT" className="text-xs">
                    District Pilot (90-day)
                  </SelectItem>
                  <SelectItem value="DISTRICT_STANDARD" className="text-xs">
                    District Standard
                  </SelectItem>
                  <SelectItem value="DISTRICT_PROFESSIONAL" className="text-xs">
                    District Professional
                  </SelectItem>
                  <SelectItem value="DISTRICT_ENTERPRISE" className="text-xs">
                    District Enterprise
                  </SelectItem>

                  {/* Promotional Plans */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Promotional
                  </div>
                  <SelectItem value="DISCOUNTED_CORE" className="text-xs">
                    CORE - Founders Pricing
                  </SelectItem>
                  <SelectItem value="DISCOUNTED_FAMILY" className="text-xs">
                    FAMILY - Founders Pricing
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current: {selectedUser?.activeLicense?.license.type || "None"}
              </p>
            </div>

            {/* Credits Management */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-xs font-semibold">Credit Adjustments</Label>

              {/* Assessment Credits */}
              <div className="space-y-2">
                <Label htmlFor="assessment-credits-change" className="text-xs">
                  Assessment Credits Change
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setAssessmentCreditsChange((prev) => prev - 1)
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="assessment-credits-change"
                    type="number"
                    value={assessmentCreditsChange}
                    onChange={(e) =>
                      setAssessmentCreditsChange(parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="h-8 text-xs text-center"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setAssessmentCreditsChange((prev) => prev + 1)
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {selectedUser?.activeLicense?.creditsRemaining || 0}{" "}
                  remaining / {selectedUser?.activeLicense?.assessmentsAllowed || 0}{" "}
                  total
                  {assessmentCreditsChange !== 0 && (
                    <span className={assessmentCreditsChange > 0 ? "text-green-600" : "text-red-600"}>
                      {" "}→ {(selectedUser?.activeLicense?.creditsRemaining || 0) + assessmentCreditsChange} remaining
                    </span>
                  )}
                </p>
              </div>

              {/* Conversational Credits */}
              <div className="space-y-2">
                <Label htmlFor="conversational-credits-change" className="text-xs">
                  Conversational Credits Change
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConversationalCreditsChange((prev) => prev - 1)
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="conversational-credits-change"
                    type="number"
                    value={conversationalCreditsChange}
                    onChange={(e) =>
                      setConversationalCreditsChange(parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="h-8 text-xs text-center"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConversationalCreditsChange((prev) => prev + 1)
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current:{" "}
                  {selectedUser?.activeLicense?.conversationalCreditsRemaining || 0}{" "}
                  remaining /{" "}
                  {selectedUser?.activeLicense?.conversationalAssessmentsAllowed || 0}{" "}
                  total
                  {conversationalCreditsChange !== 0 && (
                    <span className={conversationalCreditsChange > 0 ? "text-green-600" : "text-red-600"}>
                      {" "}→ {(selectedUser?.activeLicense?.conversationalCreditsRemaining || 0) + conversationalCreditsChange} remaining
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setManageDialogOpen(false)}
              size="sm"
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleManageUser}
              disabled={saving}
              size="sm"
              className="text-xs"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
