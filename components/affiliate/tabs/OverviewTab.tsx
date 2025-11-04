"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

interface AffiliateOverviewData {
  refCode: string;
  stats: {
    clicks: number;
    signups: number;
    conversionRate: number;
    pending: number;
    payable: number;
    paid: number;
  };
  balances: {
    payableCents: number;
    totalEarnedCents: number;
    totalPaidOutCents: number;
  };
  nextPayoutEstimate?: {
    eligible: boolean;
    estimatedDate?: string;
    amountCents?: number;
    amountNeeded?: number;
  };
}

export function OverviewTab() {
  const [data, setData] = useState<AffiliateOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/affiliate/me");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">No Affiliate Program</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <p>You haven't joined the affiliate program yet.</p>
          <p className="text-sm mt-2">
            Contact support to get started earning commissions on referrals.
          </p>
        </CardContent>
      </Card>
    );
  }

  const payableAmount = data.balances.payableCents / 100;
  const totalEarned = data.balances.totalEarnedCents / 100;
  const totalPaidOut = data.balances.totalPaidOutCents / 100;

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Payable Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${payableAmount.toFixed(2)}</div>
            <p className="text-xs text-blue-700 mt-1">Ready to payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaidOut.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Total transferred</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Payout Estimator */}
      {data.nextPayoutEstimate && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Next Payout Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.nextPayoutEstimate.eligible ? (
              <div>
                <p className="font-semibold text-green-900">
                  Eligible for payout!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Estimated transfer: {data.nextPayoutEstimate.estimatedDate || "Next business day"}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-green-700">
                  Need ${((data.nextPayoutEstimate.amountNeeded || 0) / 100).toFixed(2)} more to reach minimum payout
                </p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((data.balances.payableCents / 5000) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-green-700 mt-1">
                  ${payableAmount.toFixed(2)} / $50.00
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to earn commissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
            <code className="flex-1 text-sm break-all">
              {typeof window !== "undefined" &&
                `${window.location.origin}?ref=${data.refCode}`}
            </code>
            <CopyButton
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}?ref=${data.refCode}`
                  : ""
              }
              variant="outline"
              size="sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const text = `Check out AI Diagnostic: ${typeof window !== "undefined" ? window.location.origin : ""}?ref=${data.refCode}`;
                navigator.share ? navigator.share({ text }) : null;
              }}
            >
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.stats.clicks}</div>
              <div className="text-xs text-gray-600 mt-1">Clicks</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.stats.signups}</div>
              <div className="text-xs text-gray-600 mt-1">Signups</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {data.stats.conversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-blue-700 mt-1">Conversion Rate</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{data.stats.pending}</div>
              <div className="text-xs text-green-700 mt-1">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-3 border-b last:border-b-0">
            <span className="text-sm text-gray-600">Pending (Hold Period)</span>
            <Badge variant="outline">{data.stats.pending}</Badge>
          </div>
          <div className="flex justify-between items-center p-3 border-b last:border-b-0">
            <span className="text-sm text-gray-600">Payable (Ready Now)</span>
            <Badge variant="default" className="bg-blue-600">{data.stats.payable}</Badge>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-gray-600">Paid Out</span>
            <Badge variant="secondary">{data.stats.paid}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
