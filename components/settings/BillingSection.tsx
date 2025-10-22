"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  PauseCircle,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { usePlanData } from "@/hooks/use-plan-data";
import type { PricingResponse, UserPlanResponse } from "@/types/plan";
import { trackTelemetry } from "@/lib/utils/telemetry";

type ModalState =
  | { type: "upgrade"; target: "core" | "family" }
  | { type: "switch-annual"; target: "core" | "family" }
  | { type: "upgrade-core-family"; prorateInfo?: ProrateInfo }
  | { type: "downgrade-family-core" }
  | { type: "add-credits" }
  | { type: "pause" }
  | { type: "cancel" }
  | null;

interface ProrateInfo {
  currentPlan: { name: string; priceCents: number; term: string };
  targetPlan: { name: string; priceCents: number; term: string };
  daysRemaining: number;
  totalDaysInBillingPeriod: number;
  currentPlanCredit: number;
  targetPlanCharge: number;
  finalCharge: number;
}

type CancelChoice = "pause" | "lite" | "annual" | "cancel";

interface PaymentMethodSummary {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

interface InvoiceSummary {
  id: string;
  date: string | null;
  description: string;
  amount: number;
  currency: string | null;
  status: string;
  downloadUrl: string | null;
}

const PLAN_LABELS: Record<UserPlanResponse["plan"], { name: string; badge: string }> = {
  free: { name: "Free Snapshot", badge: "Free" },
  one_time: { name: "Single Report", badge: "One-Time" },
  core: { name: "Core Membership", badge: "Core" },
  family: { name: "Family Membership", badge: "Family" },
};

export default function BillingSection() {
  const router = useRouter();
  const { plan, pricing, refresh, ribbonVisible } = usePlanData();
  const [activeTab, setActiveTab] = useState("plan");
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cancelChoice, setCancelChoice] = useState<CancelChoice>("pause");
  const [creditQuantity, setCreditQuantity] = useState(1);
  const [anonymousDefault, setAnonymousDefault] = useState(plan?.anonymousModeEnabled ?? false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [prorateLoading, setProrateLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    email: "",
    company: "",
    address: "",
  country: "",
  region: "",
});

  const formatMoney = (
    amountCents?: number | null,
    currency: string | null = "usd"
  ) => {
    if (amountCents == null) return null;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency ? currency.toUpperCase() : "USD",
      }).format(amountCents / 100);
    } catch {
      return `$${(amountCents / 100).toFixed(2)}`;
    }
  };

  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : null;

  useEffect(() => {
    if (plan) {
      setAnonymousDefault(plan.anonymousModeEnabled);
    }
  }, [plan?.anonymousModeEnabled]);

  useEffect(() => {
    trackTelemetry("billing.view", {
      tab: activeTab,
      plan: plan?.plan ?? "unknown",
    });
  }, [activeTab, plan?.plan]);

  useEffect(() => {
    if (activeTab === "payments" && paymentMethods.length === 0 && !paymentLoading) {
      loadPaymentMethods();
    }
    if (activeTab === "invoices" && invoices.length === 0 && !invoiceLoading) {
      loadInvoices();
    }
  }, [activeTab]);

  const loadPaymentMethods = async () => {
    try {
      setPaymentLoading(true);
      const response = await fetch("/api/billing/payment-methods");
      if (!response.ok) throw new Error("Unable to load payment methods");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payment methods");
    } finally {
      setPaymentLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setInvoiceLoading(true);
      const response = await fetch("/api/billing/invoices");
      if (!response.ok) throw new Error("Unable to load invoices");
      const data = await response.json();
      setInvoices(data.invoices ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load invoices");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const startCheckout = useCallback(
    async (target: "core" | "family", term: "monthly" | "annual", source: "plan" | "modal") => {
      try {
        setConfirmLoading(true);
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: target, term, source }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "Unable to start checkout");
        }
        const data = await response.json();
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        }
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to start checkout");
      } finally {
        setConfirmLoading(false);
      }
    },
    [router]
  );

  const applyPlanMutation = useCallback(
    async (path: string, payload?: Record<string, unknown>) => {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Request failed");
      }
      return response.json().catch(() => ({}));
    },
    []
  );

  const handleAnonymousToggle = async (checked: boolean) => {
    try {
      setAnonymousDefault(checked);
      await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_anonymous_mode", enabled: checked }),
      });
      toast.success(`Anonymous mode default ${checked ? "enabled" : "disabled"}`);
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update anonymous mode");
    }
  };

  const planSummary = useMemo(() => {
    if (!plan) return "";
    switch (plan.plan) {
      case "free":
        return "Free Snapshot active. Upgrade for 2 credits/mo, rollover, member pricing.";
      case "one_time":
        return "You purchased a $97 report. Save on future reports with a subscription.";
      case "core":
        return `${plan.remainingCredits}/${plan.monthlyCredits ?? 2} credits • Rollover limit ${plan.rolloverCap ?? 6} • Enhanced $${pricing?.amounts.enhancedMember.amount ?? 9}.`;
      case "family":
        return `${plan.remainingCredits}/${plan.monthlyCredits ?? 5} credits • Rollover limit ${plan.rolloverCap ?? 15} • Unlimited child chat • Unlimited Enhanced.`;
      default:
        return "Manage your plan and billing settings.";
    }
  }, [plan, pricing?.amounts.enhancedMember.amount]);

  const openUpgradeModal = (target: "core" | "family") => {
    if (target === "core") {
      trackTelemetry("billing.click_upgrade_core", { plan: plan?.plan });
    } else {
      trackTelemetry("billing.click_upgrade_family", { plan: plan?.plan });
    }
    setModal({ type: "upgrade", target });
  };

  const openUpgradeCoreFamilyModal = async () => {
    try {
      setProrateLoading(true);
      trackTelemetry("billing.click_upgrade_family", { plan: plan?.plan });

      const response = await fetch("/api/checkout/proration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "family", term: "monthly" }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to calculate proration");
      }

      const prorateInfo = await response.json();
      setModal({ type: "upgrade-core-family", prorateInfo });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to calculate upgrade cost");
    } finally {
      setProrateLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!modal || !plan || !pricing) return;
    try {
      setConfirmLoading(true);
      switch (modal.type) {
        case "upgrade": {
          const term = "monthly" as const;
          await startCheckout(modal.target, term, "modal");
          break;
        }
        case "switch-annual": {
          trackTelemetry("billing.click_switch_annual", { plan: plan.plan, target: modal.target });
          await applyPlanMutation("/api/plan/switch-annual", { plan: modal.target });
          toast.success("Annual plan scheduled");
          break;
        }
        case "upgrade-core-family": {
          // Route through checkout instead of direct upgrade
          await startCheckout("family", "monthly", "modal");
          break;
        }
        case "downgrade-family-core": {
          trackTelemetry("billing.downgrade_requested", { plan: plan.plan });
          await applyPlanMutation("/api/plan/downgrade", { target: "core" });
          toast.success("Downgrade scheduled for next cycle");
          break;
        }
        case "add-credits": {
          trackTelemetry("billing.click_add_credits", { plan: plan.plan, qty: creditQuantity });
          await applyPlanMutation("/api/plan/add-credits", { qty: creditQuantity });
          toast.success(`${creditQuantity} credit${creditQuantity > 1 ? "s" : ""} added`);
          break;
        }
        case "pause": {
          const result = await applyPlanMutation("/api/plan/pause");
          trackTelemetry("billing.pause_started", { plan: plan.plan, resumeAt: result?.resumeAt });
          toast.success("Plan paused", {
            description: result?.resumeAt ? `Auto-resume on ${new Date(result.resumeAt).toLocaleDateString()}` : undefined,
          });
          break;
        }
        case "cancel": {
          trackTelemetry("billing.cancel_confirmed", { plan: plan.plan, choice: cancelChoice });
          const result = await applyPlanMutation("/api/plan/cancel", { choice: cancelChoice });
          toast.success("Request received", {
            description: result?.effectiveAt
              ? `Effective ${new Date(result.effectiveAt).toLocaleDateString()}`
              : undefined,
          });
          break;
        }
        default:
          break;
      }
      setModal(null);
      refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  const renderPrimaryActions = () => {
    if (!plan || !pricing) return null;
    switch (plan.plan) {
      case "free":
        return (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => openUpgradeModal("core")}>Start Core — {pricing.amounts.coreMonthly.formatted}/mo</Button>
            <Button variant="outline" onClick={() => openUpgradeModal("family")}>
              Start Family — {pricing.amounts.familyMonthly.formatted}/mo
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/checkout/single?billing=one_time&source=billing")}
            >
              Get Single Report — {pricing.amounts.single.formatted}
            </Button>
          </div>
        );
      case "one_time":
        return (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => openUpgradeModal("core")}>Start Core — {pricing.amounts.coreMonthly.formatted}/mo</Button>
            <Button variant="outline" onClick={() => openUpgradeModal("family")}>
              Start Family — {pricing.amounts.familyMonthly.formatted}/mo
            </Button>
          </div>
        );
      case "core":
        return (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setModal({ type: "add-credits" })}>Add credits ({pricing.amounts.memberCredit.formatted})</Button>
            <Button variant="outline" onClick={() => setModal({ type: "switch-annual", target: "core" })}>
              Switch to Annual — {pricing.amounts.coreAnnual.formatted}/yr
            </Button>
            <Button variant="secondary" onClick={openUpgradeCoreFamilyModal} disabled={prorateLoading}>
              {prorateLoading ? "Calculating..." : "Upgrade to Family"}
            </Button>
          </div>
        );
      case "family":
        return (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setModal({ type: "switch-annual", target: "family" })}>
              Switch to Annual — {pricing.amounts.familyAnnual.formatted}/yr
            </Button>
            <Button variant="secondary" onClick={() => setModal({ type: "downgrade-family-core" })}>
              Downgrade to Core
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSecondaryActions = () => (
    <div className="mt-4 flex flex-wrap gap-3 text-sm text-primary/80">
      <button
        type="button"
        className="underline-offset-2 hover:underline"
        onClick={() => toast.message("Apply promo code", { description: "Promo codes coming soon" })}
      >
        Apply promo code
      </button>
      <button
        type="button"
        className="underline-offset-2 hover:underline"
        onClick={() => toast.message("Membership benefits", { description: "Core saves on every report and unlocks rollover up to 6." })}
      >
        View benefits
      </button>
      <button
        type="button"
        className="underline-offset-2 hover:underline"
        onClick={() => router.push("/docs/PRIVACY_POLICY.pdf")}
      >
        Fair-use & privacy
      </button>
    </div>
  );

  const renderTrustFooter = () => (
    <div className="mt-6 rounded-2xl border border-[#223043] bg-[#0f141b] p-4 text-sm text-slate-200">
      <p className="font-semibold text-white">Why families trust us</p>
      <ul className="mt-2 space-y-1 text-xs text-slate-300">
        <li>Instant results + instant school-ready PDF.</li>
        <li>AI stores no data; Anonymous Mode available; encrypted end-to-end.</li>
        <li>Cancel anytime. Pause up to 2 months (max 2 times/year).</li>
      </ul>
    </div>
  );

  const renderPlanCard = () => {
    if (!plan || !pricing) {
      return (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Loading plan...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </CardContent>
        </Card>
      );
    }

    const planMeta = PLAN_LABELS[plan.plan];
    const paused = Boolean(plan.pausedUntil);

    return (
      <Card className="border border-[#223043] bg-[#141a21] text-slate-100">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
                  {planMeta.badge}
                </Badge>
                <span className="text-sm text-slate-300">Current Plan</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">{planMeta.name}</CardTitle>
              <p className="text-sm text-slate-300">{planSummary}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`border-transparent px-3 py-1 text-xs ${anonymousDefault ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/60 text-slate-200"}`}>
                Anonymous Mode: {anonymousDefault ? "On" : "Off"}
              </Badge>
              {(plan.foundersPricingActive || pricing.foundersActive) && (
                <Badge variant="outline" className="border-transparent bg-primary/15 px-3 py-1 text-xs text-primary">
                  Founders pricing active
                </Badge>
              )}
              {paused && plan.pausedUntil && (
                <Badge variant="outline" className="border-transparent bg-yellow-500/15 px-3 py-1 text-xs text-yellow-200">
                  Paused until {new Date(plan.pausedUntil).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>{plan.remainingCredits} credits remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span>Rollover up to {plan.rolloverCap ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>FERPA/HIPAA-ready</span>
            </div>
          </div>

          {plan.stripe && (
            <div className="rounded-xl border border-[#223043] bg-[#0f141b] px-4 py-3 text-sm text-slate-200 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">Billing status</p>
                  <p className="text-xs text-slate-300 capitalize">
                    {plan.stripe.status.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatMoney(plan.stripe.amountCents, plan.stripe.currency) ?? "Subscription"}
                    {plan.term ? ` / ${plan.term === "annual" ? "year" : "month"}` : ""}
                  </p>
                  <p className="text-xs text-slate-300">
                    {formatDate(plan.stripe.currentPeriodEnd)
                      ? `Renews ${formatDate(plan.stripe.currentPeriodEnd)}`
                      : "Renewal date unavailable"}
                  </p>
                </div>
              </div>
              {plan.paymentMethod && (
                <div className="rounded-lg border border-[#223043] bg-[#0f141b] px-3 py-2 text-xs text-slate-300">
                  <p className="font-semibold text-white">Default payment method</p>
                  <p>
                    {(plan.paymentMethod.brand
                      ? `${plan.paymentMethod.brand.toUpperCase()} •••• ${plan.paymentMethod.last4 ?? ""}`
                      : "Payment method on file").trim()}
                    {plan.paymentMethod.expMonth && plan.paymentMethod.expYear
                      ? ` • Expires ${plan.paymentMethod.expMonth}/${plan.paymentMethod.expYear}`
                      : ""}
                  </p>
                </div>
              )}
              {plan.stripe.trialEnd && (
                <p className="text-xs text-slate-300">
                  Trial ends {formatDate(plan.stripe.trialEnd)}.
                </p>
              )}
              {plan.stripe.cancelAtPeriodEnd && (
                <p className="text-xs text-amber-400">
                  Cancels at period end. Access remains until {formatDate(plan.stripe.currentPeriodEnd) ?? "the current cycle ends"}.
                </p>
              )}
            </div>
          )}

          {renderPrimaryActions()}

          <div className="flex flex-col gap-2 sm:flex-row">
            {(plan.plan === "core" || plan.plan === "family") && (
              <Button
                variant="ghost"
                className="justify-start text-sm text-slate-100"
                onClick={() => {
                  setModal({ type: "pause" });
                }}
              >
                <PauseCircle className="mr-2 h-4 w-4" /> Pause membership
              </Button>
            )}
            {(plan.plan === "core" || plan.plan === "family") && (
              <Button
                variant="ghost"
                className="justify-start text-sm text-rose-200"
                onClick={() => {
                  trackTelemetry("billing.cancel_opened", { plan: plan.plan });
                  setModal({ type: "cancel" });
                }}
              >
                <TriangleAlert className="mr-2 h-4 w-4" /> Cancel plan
              </Button>
            )}
            {paused && (
              <Button
                variant="outline"
                className="justify-start text-sm"
                onClick={async () => {
                  try {
                    await applyPlanMutation("/api/plan/resume");
                    trackTelemetry("billing.pause_resumed", { plan: plan.plan });
                    toast.success("Plan resumed");
                    refresh();
                  } catch (error) {
                    toast.error("Failed to resume plan");
                  }
                }}
              >
                Resume now
              </Button>
            )}
          </div>

          {renderSecondaryActions()}
          {renderTrustFooter()}
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 text-slate-200">
        <TabsTrigger value="plan" className="px-4 py-2 data-[state=active]:bg-primary/20">
          Plan & Billing
        </TabsTrigger>
        <TabsTrigger value="payments" className="px-4 py-2 data-[state=active]:bg-primary/20">
          Payment Methods
        </TabsTrigger>
        <TabsTrigger value="invoices" className="px-4 py-2 data-[state=active]:bg-primary/20">
          Invoices
        </TabsTrigger>
        <TabsTrigger value="settings" className="px-4 py-2 data-[state=active]:bg-primary/20">
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="plan" className="space-y-6">
        {renderPlanCard()}
      </TabsContent>

      <TabsContent value="payments" className="space-y-4">
        <Card className="border border-[#223043] bg-[#141a21] text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5" /> Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => toast.message("Add payment method", { description: "Stripe setup flow coming soon" })}
            >
              Add new card
            </Button>
            <Separator className="bg-[#223043]" />
            {paymentLoading ? (
              <div className="h-24 animate-pulse rounded-xl bg-muted" />
            ) : paymentMethods.length === 0 ? (
              <p className="text-sm text-slate-300">No payment methods on file.</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-xl border border-[#223043] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">
                        {(method.brand ? method.brand.toUpperCase() : "Card")}
                        {method.last4 ? ` •••• ${method.last4}` : ""}
                      </p>
                      {method.expMonth && method.expYear && (
                        <p className="text-xs text-slate-400">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {method.isDefault && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          Default
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.message("Remove card", { description: "Remove coming soon" })}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4">
        <Card className="border border-[#223043] bg-[#141a21] text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" /> Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceLoading ? (
              <div className="h-32 animate-pulse rounded-xl bg-muted" />
            ) : invoices.length === 0 ? (
              <p className="text-sm text-slate-300">No invoices yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.date ? formatDate(invoice.date) : "—"}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: invoice.currency?.toUpperCase() ?? "USD",
                        }).format(invoice.amount)}
                      </TableCell>
                      <TableCell className="capitalize">{invoice.status ? invoice.status.toLowerCase() : "unknown"}</TableCell>
                      <TableCell className="text-right">
                        {invoice.downloadUrl ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={invoice.downloadUrl} target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card className="border border-[#223043] bg-[#141a21] text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5" /> Billing Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="billing-email">Receipts email</Label>
                <Input
                  id="billing-email"
                  value={settingsForm.email}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="you@example.com"
                  className="mt-1 border-[#223043] bg-[#0f141b]"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={settingsForm.company}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, company: event.target.value }))}
                  placeholder="Company or school name"
                  className="mt-1 border-[#223043] bg-[#0f141b]"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={settingsForm.country}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, country: event.target.value }))}
                  placeholder="United States"
                  className="mt-1 border-[#223043] bg-[#0f141b]"
                />
              </div>
              <div>
                <Label htmlFor="region">State / Region</Label>
                <Input
                  id="region"
                  value={settingsForm.region}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, region: event.target.value }))}
                  placeholder="CA"
                  className="mt-1 border-[#223043] bg-[#0f141b]"
                />
              </div>
            </div>
            <Separator className="bg-[#223043]" />
            <div className="flex items-center justify-between rounded-xl border border-[#223043] bg-[#0f141b] px-4 py-3">
              <div>
                <p className="font-semibold text-white">Anonymous Mode default</p>
                <p className="text-xs text-slate-300">Enable anonymous data handling by default for new assessments.</p>
              </div>
              <Switch checked={anonymousDefault} onCheckedChange={handleAnonymousToggle} />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => toast.success("Billing settings saved")}
                className="bg-primary hover:bg-primary/90"
              >
                Save settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="bg-[#141a21] text-slate-100">
          <DialogHeader>
            <DialogTitle>{modalTitle(modal)}</DialogTitle>
            <DialogDescription className="text-slate-300">{modalDescription(modal, plan, pricing)}</DialogDescription>
          </DialogHeader>

          {modal?.type === "upgrade-core-family" && modal?.prorateInfo && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#223043] bg-[#0f141b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Current Plan</p>
                    <p className="font-semibold text-white">{modal.prorateInfo.currentPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Remaining credit</p>
                    <p className="font-semibold text-green-400">
                      -${(modal.prorateInfo.currentPlanCredit / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#223043] pt-3">
                  <p className="text-xs text-slate-400">
                    {modal.prorateInfo.daysRemaining} of {modal.prorateInfo.totalDaysInBillingPeriod} days remaining in your current billing period
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#223043] bg-[#0f141b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">New Plan</p>
                    <p className="font-semibold text-white">{modal.prorateInfo.targetPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Plan price</p>
                    <p className="font-semibold text-white">
                      ${(modal.prorateInfo.targetPlanCharge / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-primary bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">You'll be charged today</p>
                    <p className="text-2xl font-bold text-white">
                      ${(modal.prorateInfo.finalCharge / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>New billing cycle</p>
                    <p>starts immediately</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Your Core plan credit will be applied toward your Family plan upgrade.
              </p>
            </div>
          )}

          {modal?.type === "add-credits" && (
            <div className="space-y-3">
              <Label htmlFor="credit-qty">Credits to add</Label>
              <Input
                id="credit-qty"
                type="number"
                min={1}
                value={creditQuantity}
                onChange={(event) => setCreditQuantity(Number(event.target.value))}
                className="border-[#223043] bg-[#0f141b]"
              />
              <p className="text-xs text-slate-400">
                Add-on credits expire after 90 days and do not count toward rollover cap.
              </p>
            </div>
          )}

          {modal?.type === "cancel" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">Before you go, choose what works best for you:</p>
              <div className="space-y-2">
                {([
                  { value: "pause" as CancelChoice, label: "Pause 2 months (recommended)" },
                  { value: "lite" as CancelChoice, label: "Downgrade to Lite — $29/mo" },
                  { value: "annual" as CancelChoice, label: "Switch to Annual (save + bonuses)" },
                  { value: "cancel" as CancelChoice, label: "Continue to cancel" },
                ]).map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${cancelChoice === option.value ? "border-primary text-primary" : "border-[#223043] text-slate-200"}`}
                    onClick={() => setCancelChoice(option.value)}
                  >
                    <input
                      type="radio"
                      name="cancel-choice"
                      value={option.value}
                      checked={cancelChoice === option.value}
                      onChange={() => setCancelChoice(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setModal(null)} disabled={confirmLoading}>
              Close
            </Button>
            <Button onClick={handleConfirm} disabled={confirmLoading} className="bg-primary hover:bg-primary/90">
              {confirmLoading ? "Processing..." : modalConfirmLabel(modal)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

function modalTitle(modal: ModalState) {
  if (!modal) return "";
  switch (modal.type) {
    case "upgrade":
      return modal.target === "core" ? "Upgrade to Core" : "Upgrade to Family";
    case "switch-annual":
      return "Switch to annual billing";
    case "upgrade-core-family":
      return "Upgrade to Family";
    case "downgrade-family-core":
      return "Downgrade to Core";
    case "add-credits":
      return "Add assessment credits";
    case "pause":
      return "Pause membership";
    case "cancel":
      return "Cancel membership";
    default:
      return "";
  }
}

function modalDescription(modal: ModalState, plan?: UserPlanResponse | null, pricing?: PricingResponse | null) {
  if (!modal || !plan || !pricing) return "";
  switch (modal.type) {
    case "upgrade":
      return modal.target === "core"
        ? `Core includes 2 credits/mo, rollover up to 6, and Enhanced at ${pricing.amounts.enhancedMember.formatted}.`
        : `Family includes 5 credits/mo, rollover up to 15, and unlimited Enhanced.`;
    case "switch-annual":
      return modal.target === "core"
        ? "Pay annually and save $51. Starts today; renews in 12 months."
        : "Pay annually and save $69. Starts today; renews in 12 months.";
    case "upgrade-core-family":
      return "Prorate your remaining Core month into Family so you never lose momentum.";
    case "downgrade-family-core":
      return "Downgrade takes effect at your next billing date. You’ll lose unlimited Enhanced and rollover caps to 6.";
    case "add-credits":
      return `One-time credits are $${pricing.amounts.memberCredit.amount.toFixed(0)} each and expire after 90 days.`;
    case "pause":
      return "Pause for up to 2 months (max twice per year). Credits stay safe and resume automatically.";
    case "cancel":
      return "Let us know how to handle your membership. You’ll keep access through the current period.";
    default:
      return "";
  }
}

function modalConfirmLabel(modal: ModalState) {
  if (!modal) return "Confirm";
  switch (modal.type) {
    case "upgrade":
      return "Continue to checkout";
    case "switch-annual":
      return "Switch to annual";
    case "upgrade-core-family":
      return "Proceed to Checkout";
    case "downgrade-family-core":
      return "Schedule downgrade";
    case "add-credits":
      return "Add credits";
    case "pause":
      return "Pause membership";
    case "cancel":
      return "Submit request";
    default:
      return "Confirm";
  }
}
