"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  UserPlus,
  Settings,
  Eye,
  Key,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface SubAccount {
  id: string;
  displayName: string;
  description?: string | null;
  maxAssessments?: number | null;
  maxUsers: number;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name?: string | null;
    isActive: boolean;
    lastLoginAt?: Date | null;
  };
  _count: {
    assessments: number;
  };
}

interface CreateSubAccountData {
  email: string;
  name: string;
  displayName: string;
  description?: string;
  maxAssessments?: number;
  maxUsers?: number;
  password?: string;
}

interface SubAccountManagerProps {
  organizationId: string;
  userId: string;
}

export function SubAccountManager({
  organizationId,
  userId,
}: SubAccountManagerProps) {
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [maxAllowed, setMaxAllowed] = useState<number | undefined>();
  const [limitReason, setLimitReason] = useState<string>();

  // Create sub-account form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSubAccountData>({
    email: "",
    name: "",
    displayName: "",
    description: "",
    maxAssessments: undefined,
    maxUsers: 1,
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load sub-accounts data
  const loadSubAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/sub-accounts?organizationId=${organizationId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load sub-accounts");
      }

      setSubAccounts(data.subAccounts);
      setCanCreate(data.canCreate);
      setCurrentCount(data.currentCount);
      setMaxAllowed(data.maxAllowed);
      setLimitReason(data.reason);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load sub-accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  // Create new sub-account
  const handleCreateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/sub-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          ...createForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create sub-account");
      }

      setSuccess("Sub-account created successfully!");
      setShowCreateDialog(false);
      setCreateForm({
        email: "",
        name: "",
        displayName: "",
        description: "",
        maxAssessments: undefined,
        maxUsers: 1,
        password: "",
      });
      loadSubAccounts(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create sub-account"
      );
    } finally {
      setCreating(false);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const adjectives = ["Quick", "Bright", "Smart", "Fast", "Safe"];
    const nouns = ["Tiger", "Eagle", "River", "Mountain", "Star"];
    const numbers = Math.floor(Math.random() * 100);

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const password = `${adjective}${noun}${numbers}`;
    setCreateForm((prev) => ({ ...prev, password }));
  };

  useEffect(() => {
    loadSubAccounts();
  }, [organizationId]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sub-Account Management</CardTitle>
          <CardDescription>Loading sub-accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Sub-Account Management
              </CardTitle>
              <CardDescription>
                Manage sub-accounts under your district license
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button disabled={!canCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sub-Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Sub-Account</DialogTitle>
                  <DialogDescription>
                    Create a new sub-account for your organization. This will
                    create a new user account that you can manage.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubAccount} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={createForm.name}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={createForm.displayName}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="e.g., Lincoln Elementary School"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Optional description of this sub-account"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAssessments">Max Assessments</Label>
                      <Input
                        id="maxAssessments"
                        type="number"
                        min="1"
                        value={createForm.maxAssessments || ""}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            maxAssessments: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxUsers">Max Users</Label>
                      <Input
                        id="maxUsers"
                        type="number"
                        min="1"
                        value={createForm.maxUsers}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            maxUsers: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type="text"
                        value={createForm.password}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Leave empty for auto-generated"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create Sub-Account"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Usage Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{currentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active Sub-Accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{maxAllowed || "∞"}</div>
                <p className="text-xs text-muted-foreground">Maximum Allowed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {subAccounts.reduce(
                    (total, account) => total + account._count.assessments,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total Assessments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Limit Warning */}
          {!canCreate && limitReason && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{limitReason}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Sub-Accounts Table */}
          {subAccounts.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Sub-Accounts</h3>
              <p className="text-muted-foreground mb-4">
                Create your first sub-account to start managing users under your
                district license.
              </p>
              {canCreate && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Sub-Account
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assessments</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{account.displayName}</div>
                        {account.description && (
                          <div className="text-sm text-muted-foreground">
                            {account.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{account.user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.user.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          account.isActive && account.user.isActive
                            ? "default"
                            : "destructive"
                        }
                      >
                        {account.isActive && account.user.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {account._count.assessments}
                      </span>
                      {account.maxAssessments && (
                        <span className="text-muted-foreground">
                          /{account.maxAssessments}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.user.lastLoginAt ? (
                        <span className="text-sm">
                          {new Date(
                            account.user.lastLoginAt
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
