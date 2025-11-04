import React, { useState } from "react";
import { WidgetState, ToolOutput } from "./types";

const Checkout: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("core_monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsNeeded, setCreditsNeeded] = useState(1);
  const [sessionId, setSessionId] = useState<string>("");

  React.useEffect(() => {
    if (window.openai?.widgetState) {
      const state = window.openai.widgetState;
      setSessionId(state.sessionId || "");
      setCreditsNeeded(state.creditsNeeded || 1);
    }
  }, []);

  const plans = [
    {
      id: "single_assessment",
      name: "Single Assessment",
      credits: 1,
      price: 9.99,
      popular: false,
    },
    {
      id: "core_monthly",
      name: "Core Plan",
      credits: 2,
      price: 59.0,
      period: "/month",
      popular: true,
    },
    {
      id: "family_monthly",
      name: "Family Plan",
      credits: 5,
      price: 99.0,
      period: "/month",
      popular: false,
    },
  ];

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/chatgpt/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": sessionId,
        },
        body: JSON.stringify({
          planType: selectedPlan,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    if (window.openai?.sendFollowUpMessage) {
      window.openai.sendFollowUpMessage(
        "I want to continue without purchasing credits right now."
      );
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Purchase Credits</h1>
          <p style={styles.subtitle}>
            You need {creditsNeeded} credit{creditsNeeded > 1 ? "s" : ""} for this assessment
          </p>
        </div>

        <div style={styles.plansGrid}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                ...styles.planCard,
                ...(selectedPlan === plan.id
                  ? styles.planCardSelected
                  : {}),
              }}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div style={styles.popularBadge}>MOST POPULAR</div>
              )}
              <div style={styles.planName}>{plan.name}</div>
              <div style={styles.planPrice}>
                ${plan.price.toFixed(2)}
                {plan.period && <span style={styles.period}>{plan.period}</span>}
              </div>
              <div style={styles.planCredits}>{plan.credits} credits</div>
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={{
            ...styles.button,
            ...styles.btnPrimary,
            opacity: isProcessing ? 0.5 : 1,
            cursor: isProcessing ? "not-allowed" : "pointer",
          }}
          onClick={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay $${selectedPlanData?.price.toFixed(2)}`}
        </button>

        <button
          style={{ ...styles.button, ...styles.btnSecondary }}
          onClick={handleSkip}
          disabled={isProcessing}
        >
          Maybe Later
        </button>

        <div style={styles.disclaimer}>
          Secure payment powered by Stripe. Your payment information is encrypted.
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "600px",
    width: "100%",
    padding: "32px",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b7280",
  },
  plansGrid: {
    display: "grid",
    gap: "12px",
    marginBottom: "24px",
  },
  planCard: {
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#667eea",
    background: "#eef2ff",
  },
  popularBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#667eea",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
  },
  planName: {
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "4px",
  },
  planPrice: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#667eea",
    marginBottom: "4px",
  },
  period: {
    fontSize: "14px",
    color: "#6b7280",
  },
  planCredits: {
    fontSize: "13px",
    color: "#6b7280",
  },
  button: {
    width: "100%",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "12px",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  btnSecondary: {
    background: "#f3f4f6",
    color: "#374151",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center",
  },
};

export default Checkout;
