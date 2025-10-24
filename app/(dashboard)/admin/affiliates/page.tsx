"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AffiliateStats {
  revenue: { referredUSD: string };
  balance: { payableUSD: string };
  payouts: { totalUSD: string };
  referrers: { active: number; suspended: number; total: number };
  attribution: { clicks: number; signups: number; conversionRate: string };
  fraud: { voidedCommissions: number; clawedBackCommissions: number; fraudRatePercent: string };
  cac: { blendedCACUSD: string };
}

export default function AffiliatesAdminPage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/affiliates/stats?days=30");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Affiliate Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your affiliate program</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Flags</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Referred Revenue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Referred Revenue (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.revenue.referredUSD}</div>
                <p className="text-xs text-gray-500">Total from commissions</p>
              </CardContent>
            </Card>

            {/* Payable Balance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Payable Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.balance.payableUSD}</div>
                <p className="text-xs text-gray-500">Ready for payout</p>
              </CardContent>
            </Card>

            {/* Total Paid Out */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Paid Out (All Time)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.payouts.totalUSD}</div>
                <p className="text-xs text-gray-500">Via Stripe Connect</p>
              </CardContent>
            </Card>

            {/* Blended CAC */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Blended CAC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.cac.blendedCACUSD}</div>
                <p className="text-xs text-gray-500">Cost per customer</p>
              </CardContent>
            </Card>
          </div>

          {/* Attribution & Fraud Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attribution Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Clicks</span>
                  <span className="font-semibold">{stats?.attribution.clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Signups / Attributions</span>
                  <span className="font-semibold">{stats?.attribution.signups}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate</span>
                  <span className="font-semibold">{stats?.attribution.conversionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fraud Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Voided Commissions</span>
                  <span className="font-semibold">{stats?.fraud.voidedCommissions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clawed Back</span>
                  <span className="font-semibold">{stats?.fraud.clawedBackCommissions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fraud Rate</span>
                  <span className="font-semibold text-red-600">
                    {stats?.fraud.fraudRatePercent}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrer Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Referrer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.referrers.active}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.referrers.suspended}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats?.referrers.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REFERRERS TAB */}
        <TabsContent value="referrers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Referrers</CardTitle>
              <CardDescription>Manage active and suspended referrers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Referrer management table - use admin API to manage
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMMISSIONS TAB */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Management</CardTitle>
              <CardDescription>View, void, and mark commissions as payable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Commission management table - use admin API to manage
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYOUTS TAB */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>View and trigger manual payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Payout history table - use admin API to trigger payouts
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FRAUD TAB */}
        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Flags & Review Queue</CardTitle>
              <CardDescription>Review flagged referrals and suspected fraud</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Fraud queue table - commissions with household flags and high velocity
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
