"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateDashboard } from "@/components/affiliate/AffiliateDashboard";

interface AffiliateData {
  refCode: string;
  status: string;
  stats: {
    clicks: number;
    signups: number;
    paid: number;
    pending: number;
    payable: number;
    paidOut: number;
  };
  balances: {
    payableCents: number;
    totalEarnedCents: number;
    totalPaidOutCents: number;
  };
  stripe: {
    isOnboarded: boolean;
    isReady: boolean;
    transfersEnabled: boolean;
    pendingRequirements: string[];
  };
  nextPayoutEligibleDate: string;
}

export default function EarnRewardsPage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      setError(null);
      const res = await fetch("/api/affiliate/me");
      if (res.status === 404) {
        setData(null);
      } else if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const json = await res.json();
        setError(json.error || "Failed to fetch affiliate data");
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    setRegistering(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/register", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        console.log("Registration successful:", json);
        // Delay a moment then refresh to show new affiliate data
        setTimeout(() => {
          fetchAffiliateData();
        }, 500);
      } else {
        const json = await res.json();
        setError(json.error || "Failed to register");
      }
    } catch (error) {
      console.error("Failed to register:", error);
      setError("Network error - please try again");
    } finally {
      setRegistering(false);
    }
  };

  const handleConnectOnboarding = async () => {
    try {
      setError(null);
      const res = await fetch("/api/affiliate/connect-onboarding", {
        method: "POST",
      });
      const json = await res.json();
      if (json.onboardingUrl) {
        window.location.href = json.onboardingUrl;
      } else if (json.dashboardUrl) {
        window.location.href = json.dashboardUrl;
      } else {
        setError(json.message || json.error || "Failed to start onboarding");
      }
    } catch (error) {
      console.error("Failed to start onboarding:", error);
      setError("Network error - please try again");
    }
  };

  const handleRequestPayout = async () => {
    try {
      setError(null);
      const res = await fetch("/api/affiliate/payout", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert("Payout initiated! Funds will arrive in 1-3 business days.");
        await fetchAffiliateData();
      } else {
        setError(json.error || "Failed to request payout");
      }
    } catch (error) {
      console.error("Failed to request payout:", error);
      setError("Network error - please try again");
    }
  };

  const copyReferralLink = () => {
    if (data?.refCode) {
      const link = `${process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com"}/?ref=${data.refCode}`;
      navigator.clipboard.writeText(link);
      alert("Referral link copied!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  // Show signup form if no affiliate account exists
  if (!data && !error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div>
          <h1 className="text-3xl font-bold">Earn Rewards</h1>
          <p className="text-gray-600 mt-2">Give $20 off. Get $20 cash.</p>
        </div>

        <div className="max-w-md mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Become an Affiliate</CardTitle>
              <CardDescription>Start earning rewards by referring friends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Earn $20 for each qualified referral, plus bonuses when they upgrade to premium plans.
              </p>
              <Button
                onClick={handleRegister}
                disabled={registering}
                className="w-full"
              >
                {registering ? "Creating..." : "Create My Referral Link"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div>
          <h1 className="text-3xl font-bold">Earn Rewards</h1>
          <p className="text-gray-600 mt-2">Give $20 off. Get $20 cash.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-4 mt-8">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => fetchAffiliateData()}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Guard clause - data must exist at this point
  if (!data) {
    return null;
  }

  // Show new comprehensive affiliate dashboard
  return (
    <div className="max-w-7xl mx-auto p-8">
      <AffiliateDashboard />
    </div>
  );
}
