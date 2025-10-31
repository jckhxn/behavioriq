"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Search,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  email: string;
  consentMarketing: boolean;
  createdAt: string;
  sessionId: string;
  purchasedOrder?: boolean;
}

interface ExportOptions {
  format: "csv" | "json";
  includeConsent: boolean;
  onlyMarketing: boolean;
}

export function LeadsManagementTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "marketing" | "no-consent">(
    "all"
  );
  const [exportDialog, setExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    includeConsent: true,
    onlyMarketing: false,
  });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/leads");
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.id.toLowerCase().includes(search.toLowerCase());

    if (filter === "marketing") {
      return matchesSearch && lead.consentMarketing;
    } else if (filter === "no-consent") {
      return matchesSearch && !lead.consentMarketing;
    }
    return matchesSearch;
  });

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((lead) => lead.id)));
    }
  };

  const deleteSelectedLeads = async () => {
    try {
      setDeleting(true);
      const response = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete leads");
      }

      const data = await response.json();
      toast.success(`Deleted ${data.deletedCount} lead${data.deletedCount !== 1 ? "s" : ""}`);
      setSelectedIds(new Set());
      setDeleteDialog(false);
      await fetchLeads();
    } catch (error) {
      console.error("Error deleting leads:", error);
      toast.error("Failed to delete leads");
    } finally {
      setDeleting(false);
    }
  };

  const exportLeads = async () => {
    try {
      setExporting(true);

      let filtered = leads;
      if (exportOptions.onlyMarketing) {
        filtered = filtered.filter((lead) => lead.consentMarketing);
      }

      let content: string;
      let filename: string;

      if (exportOptions.format === "csv") {
        // CSV format
        const headers = ["Email", "Consent", "Created At"];
        const rows = filtered.map((lead) => [
          `"${lead.email}"`,
          lead.consentMarketing ? "Yes" : "No",
          new Date(lead.createdAt).toLocaleDateString(),
        ]);

        content =
          headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");
        filename = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        // JSON format
        const json = filtered.map((lead) => ({
          email: lead.email,
          consentMarketing: lead.consentMarketing,
          createdAt: lead.createdAt,
        }));

        content = JSON.stringify(json, null, 2);
        filename = `leads-${new Date().toISOString().split("T")[0]}.json`;
      }

      // Download file
      const blob = new Blob([content], {
        type:
          exportOptions.format === "csv"
            ? "text/csv;charset=utf-8;"
            : "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Exported ${filtered.length} leads as ${exportOptions.format.toUpperCase()}`
      );
      setExportDialog(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export leads");
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const stats = {
    total: leads.length,
    marketing: leads.filter((l) => l.consentMarketing).length,
    noConsent: leads.filter((l) => !l.consentMarketing).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trial Leads</h2>
          <p className="text-muted-foreground mt-1">
            Manage and export email leads from trial assessments
          </p>
        </div>
        <Button onClick={fetchLeads} disabled={loading} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Email captures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Marketing Consent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.marketing}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${((stats.marketing / stats.total) * 100).toFixed(0)}% opted in`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              No Consent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.noConsent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${((stats.noConsent / stats.total) * 100).toFixed(0)}% opted out`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium">
            {selectedIds.size} lead{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialog(true)}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Actions & Filters */}
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="marketing">Marketing Consent</SelectItem>
              <SelectItem value="no-consent">No Consent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <Button onClick={() => setExportDialog(true)} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredLeads.length} Lead{filteredLeads.length !== 1 ? "s" : ""}
          </CardTitle>
          <CardDescription>
            {filteredLeads.length === 0
              ? "No leads match your filters"
              : `Showing ${filteredLeads.length} of ${leads.length} total leads`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-20">Consent</TableHead>
                    <TableHead className="w-40">Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className={selectedIds.has(lead.id) ? "bg-slate-100 dark:bg-slate-900" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(lead.id)}
                          onCheckedChange={() => toggleSelectLead(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.email}</TableCell>
                      <TableCell>
                        {lead.consentMarketing ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(lead.email)}
                          title="Copy email"
                        >
                          <Copy className="w-4 h-4" />
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

      {/* Export Dialog */}
      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Leads</DialogTitle>
            <DialogDescription>
              Choose format and options for exporting leads
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: any) =>
                  setExportOptions({ ...exportOptions, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Marketing Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="marketing-only"
                checked={exportOptions.onlyMarketing}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    onlyMarketing: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="marketing-only" className="cursor-pointer">
                Only export leads with marketing consent
              </Label>
            </div>

            {/* Summary */}
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Will export{" "}
                <span className="font-semibold">
                  {exportOptions.onlyMarketing
                    ? Math.max(
                        0,
                        filteredLeads.filter((l) => l.consentMarketing).length
                      )
                    : filteredLeads.length}
                </span>{" "}
                leads as{" "}
                <span className="font-semibold">
                  {exportOptions.format.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportDialog(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button onClick={exportLeads} disabled={exporting}>
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Leads
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. You are about to permanently delete{" "}
              <span className="font-semibold">{selectedIds.size}</span> lead
              {selectedIds.size !== 1 ? "s" : ""} from the database.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Note:</strong> This will delete the selected leads permanently. This action
              cannot be reversed.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteSelectedLeads}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
