import React, { useState, useEffect } from "react";
import { withUTM } from "../../lib/utils";
import { PRICING_DISPLAY_PLANS } from "../../lib/config/pricing";

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(false);
  useEffect(() => {
    function handleResize() {
      setMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return mobile;
}

function useShowStickyCTA(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setShow(docHeight > 0 && scrollY / docHeight > 0.3);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return show;
}

export default function LandingPagePricing() {
  // Map config to UI plan cards
  const plans = PRICING_DISPLAY_PLANS.map((plan) => {
    let subtitle = "";
    let cta = "";
    let ctaAnnual = "";
    let ctaHref = "";
    let bullets: React.ReactNode[] = [];
    let finePrint = "";
    let badge = plan.badge || null;
    let mostPopular = plan.badge === "Most Popular";
    let rollover = null;
    let ctaGa = {
      plan: plan.id.toLowerCase(),
      billing: "monthly",
      placement: "card",
    };
    let ctaGaAnnual = {
      plan: `annual_${plan.id.toLowerCase()}`,
      billing: "annual",
      placement: "card",
    };
    let savings = undefined;
    // Custom mapping for each plan
    if (plan.id === "SINGLE") {
      subtitle = "One professional report";
      cta = "Get the $97 Report";
      ctaHref = withUTM("/checkout/single");
      bullets = [
        "1 full parent assessment",
        "School-ready PDF in minutes",
        <>
          Add child conversation for <span className="font-semibold">$9</span>
        </>,
        "HIPAA-compliant, private",
      ];
      finePrint = "No subscription. Instant download.";
    } else if (plan.id === "CORE") {
      subtitle = "For focused parents";
      cta = `Start Core — $${plan.monthlyCents! / 100}/mo`;
      ctaAnnual = `Start Core — $${plan.annualCents! / 100}/yr`;
      ctaHref = withUTM("/checkout/core");
      bullets = [
        <>
          <span className="font-semibold">1 assessment credit / month</span>
        </>,
        <>
          Unlimited conversational AI{" "}
          <span className="font-semibold">included</span>
        </>,
        "PDF exports & shareable summaries",
        "Live chat support",
      ];
      finePrint = "Cancel anytime. Credits roll over up to 6.";
      savings = "$111/yr";
      rollover = 6;
    } else if (plan.id === "FAMILY") {
      subtitle = "For multi-child families";
      cta = `Start Family — $${plan.monthlyCents! / 100}/mo`;
      ctaAnnual = `Start Family — $${plan.annualCents! / 100}/yr`;
      ctaHref = withUTM("/checkout/family");
      bullets = [
        <>
          <span className="font-semibold">4 assessment credits / month</span>
        </>,
        <>
          <span className="font-semibold">Rollover up to 15</span>
        </>,
        <>
          <span className="font-semibold">
            Conversational AI included (unlimited)
          </span>
        </>,
        "Multi-child profiles & progress",
        "Priority support + live chat",
      ];
      finePrint = "Cancel anytime. Credits roll over up to 15.";
      savings = "$191/yr";
      rollover = 15;
    }
    return {
      id: plan.id.toLowerCase(),
      name: plan.name,
      subtitle,
      price: plan.monthlyCents
        ? plan.monthlyCents / 100
        : plan.annualCents
          ? plan.annualCents / 100
          : 0,
      priceAnnual: plan.annualCents
        ? plan.annualCents / 100
        : plan.monthlyCents
          ? plan.monthlyCents / 100
          : 0,
      cta,
      ctaAnnual,
      ctaHref,
      bullets,
      finePrint,
      badge,
      mostPopular,
      rollover,
      ctaGa,
      ctaGaAnnual,
      savings,
    };
  });

  const [annual, setAnnual] = useState(false);
  const isMobile: boolean = useIsMobile();
  const showSticky = useShowStickyCTA();

  // Placeholder for GA4/UTM event hooks
  const handlePlanClick = (
    plan: string,
    billing: string,
    placement: string
  ) => {
    // window.gtag && window.gtag("event", "plan_click", { plan, billing, placement });
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Get Answers in Hours — Not Weeks
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Research-backed AI behavioral assessments for children.
          </p>
        </header>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1"
            role="group"
            aria-label="Billing toggle"
          >
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${!annual ? "bg-white dark:bg-gray-900 shadow" : "text-gray-600 dark:text-gray-300"}`}
              aria-pressed={!annual}
              onClick={() => setAnnual(false)}
              type="button"
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${annual ? "bg-white dark:bg-gray-900 shadow" : "text-gray-600 dark:text-gray-300"}`}
              aria-pressed={annual}
              onClick={() => setAnnual(true)}
              type="button"
            >
              Annual
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border ${plan.mostPopular ? "border-2 border-blue-500 shadow-md bg-blue-50 dark:bg-blue-900/40" : "border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900"} p-6`}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
                  aria-label="Most Popular"
                >
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {plan.subtitle}
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {plan.id === "single"
                    ? "$97"
                    : annual
                      ? `$${plan.priceAnnual}`
                      : `$${plan.price}`}
                </span>
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  {plan.id === "single"
                    ? " / one-time"
                    : annual
                      ? " / year"
                      : " / month"}
                </span>
                {annual && plan.savings && plan.id !== "single" && (
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                    Save {plan.savings}
                  </div>
                )}
              </div>
              <a
                href={plan.ctaHref}
                className="mt-5 inline-block w-full text-center bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                data-ga-event="plan_click"
                data-ga-plan={plan.id}
                data-ga-billing={
                  annual && plan.id !== "single" ? "annual" : plan.ctaGa.billing
                }
                data-ga-placement="card"
                aria-label={plan.badge ? "Most Popular" : undefined}
                onClick={() =>
                  handlePlanClick(
                    plan.id,
                    annual && plan.id !== "single"
                      ? "annual"
                      : plan.ctaGa.billing,
                    "card"
                  )
                }
              >
                {annual && plan.ctaAnnual ? plan.ctaAnnual : plan.cta}
              </a>
              <ul className="mt-6 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {plan.bullets.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {plan.finePrint}
              </p>
            </div>
          ))}
        </div>

        {/* Enterprise Banner */}
        <div className="mt-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">District / Enterprise</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Unlimited seats, SIS integration, admin analytics.
            </p>
          </div>
          <a
            href={withUTM("/contact-sales")}
            className="mt-4 md:mt-0 inline-block bg-gray-900 dark:bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-blue-600"
            data-ga-event="plan_click"
            data-ga-plan="district"
            data-ga-billing="contact"
            data-ga-placement="card"
          >
            Contact Sales
          </a>
        </div>
      </section>

      {/* Sticky CTA (mobile only, after scroll) */}
      {isMobile && showSticky && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center py-3 px-4">
          <button
            className="w-full max-w-xs bg-blue-600 text-white rounded-xl py-3 font-semibold text-base shadow hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
            data-ga-event="plan_click"
            data-ga-plan="core"
            data-ga-billing={annual ? "annual" : "monthly"}
            data-ga-placement="sticky"
            onClick={() =>
              handlePlanClick("core", annual ? "annual" : "monthly", "sticky")
            }
            aria-label="Start Free Snapshot"
          >
            Start Free Snapshot
          </button>
        </div>
      )}
    </>
  );
}
