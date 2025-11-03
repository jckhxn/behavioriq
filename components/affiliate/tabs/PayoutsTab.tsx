"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, ExternalLink, AlertCircle } from "lucide-react";

interface Payout {
  id: string;
  amountCents: number;
  status: string;
  transferId?: string;
  failureReason?: string;
  createdAt: string;
  estimatedArrivalDate?: string;
}

interface PayoutsData {
  payouts: Payout[];
  total: number;
  bankAccountInfo?: {
    last4: string;
    bankName: string;
    status: string;
  };
  payableBalance: number;
  canRequestPayout: boolean;
}

export function PayoutsTab() {
  const [data, setData] = useState<PayoutsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/affiliate/payouts");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch payout data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!data?.canRequestPayout) return;

    try {
      setRequesting(true);
      const res = await fetch("/api/affiliate/payout", { method: "POST" });
      if (res.ok) {
        await fetchData();
        alert("Payout request submitted successfully!");
      } else {
        alert("Failed to request payout");
      }
    } catch (err) {
      console.error("Failed to request payout:", err);
      alert("Error requesting payout");
    } finally {
      setRequesting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/affiliate/payouts/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payouts-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Failed to export payouts:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">No Payout Information</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <p>No payout data available. You may need to complete Stripe Connect setup.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bank Account Status */}
      {data?.bankAccountInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Account:</span> Ending in{" "}
                <code className="bg-white px-2 py-1 rounded text-sm">
                  ****{data.bankAccountInfo.last4}
                </code>
              </p>
              <p className="text-sm">
                <span className="font-medium">Bank:</span>{" "}
                {data.bankAccountInfo.bankName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                <Badge
                  className={
                    data.bankAccountInfo.status === "verified"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {data.bankAccountInfo.status}
                </Badge>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={() => window.open("/stripe/dashboard", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Manage via Stripe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payout Request */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Payout Request</CardTitle>
          <CardDescription>
            Payable Balance: ${(data?.payableBalance || 0) / 100}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.canRequestPayout ? (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your balance is ready for payout. Click below to request a
                  transfer to your bank account.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleRequestPayout}
                disabled={requesting}
                className="w-full"
              >
                {requesting
                  ? "Requesting Payout..."
                  : "Request Payout Now"}
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Minimum balance of $50 required. Current balance:{" "}
                ${(data?.payableBalance || 0) / 100}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>
              Total payouts: {data?.total || 0}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {data?.payouts && data.payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-gray-600">
                    <th className="text-left py-3 px-3">Date</th>
                    <th className="text-right py-3 px-3">Amount</th>
                    <th className="text-center py-3 px-3">Status</th>
                    <th className="text-left py-3 px-3">Transfer ID</th>
                    <th className="text-center py-3 px-3">Arrival Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 text-gray-700">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-green-600">
                        ${(payout.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          className={getStatusColor(payout.status)}
                          variant="outline"
                        >
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-xs font-mono text-gray-600">
                        {payout.transferId
                          ? payout.transferId.substring(0, 12) + "..."
                          : "—"}
                      </td>
                      <td className="py-3 px-3 text-center text-sm">
                        {payout.estimatedArrivalDate
                          ? new Date(
                              payout.estimatedArrivalDate
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payouts yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Payout Alert */}
      {data?.payouts?.some((p) => p.status === "failed") && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some payouts failed. Please check your Stripe account or contact
            support for details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
