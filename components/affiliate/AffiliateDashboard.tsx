"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/affiliate/tabs/OverviewTab";
import { CommissionsTab } from "@/components/affiliate/tabs/CommissionsTab";
import { PayoutsTab } from "@/components/affiliate/tabs/PayoutsTab";
import { AnalyticsTab } from "@/components/affiliate/tabs/AnalyticsTab";
import { SettingsTab } from "@/components/affiliate/tabs/SettingsTab";
import {
  BarChart3,
  DollarSign,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";

export function AffiliateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your referrals, commissions, and earnings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-gray-100">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Overview</span>
            <span className="sm:hidden text-xs">O</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex flex-col items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Commissions</span>
            <span className="sm:hidden text-xs">C</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex flex-col items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Payouts</span>
            <span className="sm:hidden text-xs">P</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Analytics</span>
            <span className="sm:hidden text-xs">A</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Settings</span>
            <span className="sm:hidden text-xs">S</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="commissions" className="mt-6">
          <CommissionsTab />
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <PayoutsTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
