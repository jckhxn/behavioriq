"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Filter } from "lucide-react";

interface Commission {
  id: string;
  eventType: string;
  amountCents: number;
  status: string;
  holdUntilDays?: number;
  createdAt: string;
  referredEmail?: string;
}

interface CommissionsData {
  commissions: Commission[];
  total: number;
  page: number;
  totalPages: number;
}

export function CommissionsTab() {
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter, eventTypeFilter, page]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(eventTypeFilter !== "all" && { eventType: eventTypeFilter }),
      });

      const res = await fetch(`/api/affiliate/commissions?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch commissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/affiliate/commissions/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `commissions-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Failed to export commissions:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "payable":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "void":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (event: string) => {
    const labels: Record<string, string> = {
      paid_report: "Paid Report",
      core_sub: "Core Subscription",
      family_sub: "Family Subscription",
      annual_sub: "Annual Subscription",
    };
    return labels[event] || event;
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.commissions.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">No Commissions Yet</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>You don't have any commissions yet. Start sharing your referral link to earn commissions!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="payable">Payable</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="paid_report">Paid Report</SelectItem>
                  <SelectItem value="core_sub">Core Subscription</SelectItem>
                  <SelectItem value="family_sub">Family Subscription</SelectItem>
                  <SelectItem value="annual_sub">Annual Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setEventTypeFilter("all");
                  setPage(1);
                }}
                className="flex-1"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Commissions</CardTitle>
            <CardDescription>
              Total: {data?.total || 0} commissions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {data?.commissions && data.commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-gray-600">
                    <th className="text-left py-3 px-3">Date</th>
                    <th className="text-left py-3 px-3">Event</th>
                    <th className="text-right py-3 px-3">Amount</th>
                    <th className="text-center py-3 px-3">Status</th>
                    <th className="text-center py-3 px-3">Hold Period</th>
                  </tr>
                </thead>
                <tbody>
                  {data.commissions.map((commission) => (
                    <tr
                      key={commission.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 text-gray-700">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {getEventTypeLabel(commission.eventType)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-green-600">
                        ${(commission.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          className={getStatusColor(commission.status)}
                          variant="outline"
                        >
                          {commission.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        {commission.status === "pending" && commission.holdUntilDays ? (
                          <span className="text-orange-600 font-medium">
                            {commission.holdUntilDays}d remaining
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No commissions found
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
