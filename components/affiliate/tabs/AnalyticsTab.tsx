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
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsData {
  earnings: Array<{
    date: string;
    amount: number;
    commissionCount: number;
  }>;
  breakdown: Array<{
    type: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  metrics: {
    averageCommission: number;
    bestMonth: string;
    growthRate: number;
  };
}

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        range: timeRange,
        groupBy: timeRange === "30" ? "day" : "week",
      });

      const res = await fetch(`/api/affiliate/analytics?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalEarnings = () => {
    return data?.earnings.reduce((sum, day) => sum + day.amount, 0) || 0;
  };

  const calculateTotalCommissions = () => {
    return data?.earnings.reduce((sum, day) => sum + day.commissionCount, 0) || 0;
  };

  if (loading) {
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

  if (!data || !data.earnings || data.earnings.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">No Analytics Data Yet</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>Analytics data will appear here once you have commissions in the selected date range.</p>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = calculateTotalEarnings();
  const totalCommissions = calculateTotalCommissions();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Date Range</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Period Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalEarnings / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total earned in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommissions}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total commissions earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((data?.metrics.averageCommission || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Per commission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      {data?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Growth Rate</p>
                <p className="text-xs text-gray-600">Month-over-month change</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-900">
                  {data.metrics.growthRate > 0 ? "+" : ""}
                  {data.metrics.growthRate.toFixed(1)}%
                </span>
                {data.metrics.growthRate > 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Best Month</p>
                <p className="text-xs text-gray-600">Highest earning month</p>
              </div>
              <span className="text-lg font-bold text-green-900">
                {data.metrics.bestMonth}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Breakdown */}
      {data?.breakdown && data.breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
            <CardDescription>
              Distribution by commission type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.breakdown.map((item) => (
                <div
                  key={item.type}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      {item.type}
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <span>{item.count} commissions</span>
                    <span>${(item.amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Chart (Text-based) */}
      {data?.earnings && data.earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
            <CardDescription>
              Daily earnings for selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.earnings.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700 w-24">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (day.amount / (totalEarnings / data.earnings.length || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-sm font-semibold text-gray-900">
                      ${(day.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {day.commissionCount} commission(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
