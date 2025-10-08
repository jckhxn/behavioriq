"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Users, Calendar, Key } from "lucide-react";

interface License {
  id: string;
  licenseKey: string;
  type: "BASIC" | "PROFESSIONAL" | "ENTERPRISE"; // TRIAL removed - legacy type
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  maxUsers: number;
  validUntil: string | null;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
  users: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      lastLoginAt: string | null;
    };
  }>;
  _count: {
    users: number;
  };
}

export default function LicenseManager() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "BASIC" as const,
    maxUsers: 1,
    validUntil: "",
    organizationId: "",
  });

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/licenses");
      const data = await response.json();

      if (response.ok) {
        setLicenses(data.licenses);
      } else {
        toast.error(data.error || "Failed to fetch licenses");
      }
    } catch (error) {
      toast.error("Failed to fetch licenses");
      console.error("License fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createLicense = async () => {
    try {
      const payload = {
        ...formData,
        validUntil: formData.validUntil || null,
        organizationId: formData.organizationId || null,
      };

      const response = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("License created successfully");
        setCreateDialogOpen(false);
        setFormData({
          type: "BASIC",
          maxUsers: 1,
          validUntil: "",
          organizationId: "",
        });
        fetchLicenses();
      } else {
        toast.error(data.error || "Failed to create license");
      }
    } catch (error) {
      toast.error("Failed to create license");
      console.error("License creation error:", error);
    }
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case "TRIAL":
        return "bg-gray-100 text-gray-800";
      case "BASIC":
        return "bg-blue-100 text-blue-800";
      case "PROFESSIONAL":
        return "bg-purple-100 text-purple-800";
      case "ENTERPRISE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>License Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading licenses...</div>
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
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              License Management
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create License
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New License</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">License Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRIAL">Trial</SelectItem>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="PROFESSIONAL">
                          Professional
                        </SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxUsers">Maximum Users</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      min="1"
                      value={formData.maxUsers}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxUsers: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createLicense}>Create License</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No licenses found. Create your first license to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {licenses.map((license) => (
                <Card key={license.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getLicenseTypeColor(license.type)}>
                          {license.type}
                        </Badge>
                        <Badge className={getStatusColor(license.status)}>
                          {license.status}
                        </Badge>
                        {license.organization && (
                          <Badge variant="outline">
                            {license.organization.name}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground font-mono">
                        Key: {license.licenseKey}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {license._count.users}/{license.maxUsers} users
                        </div>
                        {license.validUntil && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Expires:{" "}
                            {new Date(license.validUntil).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Assign User
                      </Button>
                    </div>
                  </div>

                  {license.users.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">
                        Assigned Users
                      </h4>
                      <div className="space-y-1">
                        {license.users.map((userLicense) => (
                          <div
                            key={userLicense.user.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {userLicense.user.name || userLicense.user.email}
                            </span>
                            <span className="text-muted-foreground">
                              {userLicense.user.lastLoginAt
                                ? `Last login: ${new Date(userLicense.user.lastLoginAt).toLocaleDateString()}`
                                : "Never logged in"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
