"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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

const AffiliateRewardsSection: React.FC = () => {
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


  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading your affiliate dashboard...</p>
      </div>
    );
  }

  // Show signup form if no affiliate account exists
  if (!data && !error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Earn Rewards</h2>
          <p className="text-sm text-gray-600">Give $20 off. Get $20 cash.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Become an Affiliate</CardTitle>
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
              size="sm"
            >
              {registering ? "Creating..." : "Create My Referral Link"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Earn Rewards</h2>
          <p className="text-sm text-gray-600">Give $20 off. Get $20 cash.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800">{error}</p>
          <Button
            onClick={() => fetchAffiliateData()}
            className="mt-2"
            variant="outline"
            size="sm"
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

  const payableUSD = (data.balances.payableCents / 100).toFixed(2);
  const totalEarnedUSD = (data.balances.totalEarnedCents / 100).toFixed(2);
  const totalPaidOutUSD = (data.balances.totalPaidOutCents / 100).toFixed(2);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Earn Rewards</h2>
        <p className="text-sm text-gray-600">Give $20 off. Get $20 cash.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your Referral Link</CardTitle>
          <CardDescription className="text-xs">Share to earn $20 per qualified referral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-gray-100 rounded p-3 font-mono text-xs break-all">
              {`${process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com"}/?ref=${data.refCode}`}
            </div>
            <CopyButton
              value={`${process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com"}/?ref=${data.refCode}`}
              onCopied={() => {
                toast.success("Referral link copied to clipboard!")
              }}
            />
          </div>
          <Button
            onClick={() => {
              const link = `${process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com"}/?ref=${data.refCode}`;
              const text = `Got instant clarity using BehaviorIQ™. $20 off your child's AI screening: ${link} (I may earn a referral reward.)`;
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
              );
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Share on X
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600 font-medium">Clicks</div>
            <div className="text-xl font-bold">{data.stats.clicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600 font-medium">Signups</div>
            <div className="text-xl font-bold">{data.stats.signups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600 font-medium">Conversion</div>
            <div className="text-xl font-bold">
              {data.stats.clicks > 0
                ? ((data.stats.signups / data.stats.clicks) * 100).toFixed(1)
                : "0"}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Commission Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-semibold text-yellow-600">{data.stats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Payable</span>
              <span className="font-semibold text-green-600">{data.stats.payable}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Out</span>
              <span className="font-semibold text-blue-600">{data.stats.paid}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Payable</span>
              <span className="font-semibold">${payableUSD}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Earned</span>
              <span className="font-semibold">${totalEarnedUSD}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid Out</span>
              <span className="font-semibold">${totalPaidOutUSD}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connect Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payout Setup</CardTitle>
          <CardDescription className="text-xs">Connect your Stripe account to receive payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!data.stripe.isOnboarded ? (
            <>
              <p className="text-xs text-gray-600">
                Complete Stripe Connect setup to enable payouts. We'll collect your tax information and banking details.
              </p>
              <Button onClick={handleConnectOnboarding} size="sm" className="w-full">
                Start Stripe Connect Setup
              </Button>
            </>
          ) : data.stripe.isReady ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-green-800">
                  ✅ Your account is verified and ready for payouts.
                </p>
              </div>
              {parseFloat(payableUSD) >= 50 ? (
                <Button onClick={handleRequestPayout} className="bg-green-600 hover:bg-green-700 w-full" size="sm">
                  Request Payout Now (${payableUSD})
                </Button>
              ) : (
                <p className="text-xs text-gray-600">
                  Minimum payout: $50 (Current: ${payableUSD})
                </p>
              )}
            </>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800 mb-1 font-semibold">
                  ⚠️ Verification pending
                </p>
                <ul className="text-xs text-yellow-800 list-disc pl-4 space-y-0.5">
                  {data.stripe.pendingRequirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </div>
              <Button onClick={handleConnectOnboarding} size="sm" className="w-full">
                Continue Verification
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-xs mb-1">How long does it take to get paid?</h4>
            <p className="text-xs text-gray-600">
              Commissions are held for 14 days. After that, they become payable. Payouts are processed when your balance reaches $50.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-1">What counts as a qualified referral?</h4>
            <p className="text-xs text-gray-600">
              First-time customers only. They must complete a purchase and not refund within 14 days.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-1">Do I need to pay taxes?</h4>
            <p className="text-xs text-gray-600">
              If you earn $600+ per year, we'll send a 1099-NEC tax form via Stripe Connect.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-1">Can I refer friends and family?</h4>
            <p className="text-xs text-gray-600">
              Yes, but we have household verification to prevent abuse.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateRewardsSection;
