import React, { useState } from "react";
import { ToolOutput } from "./types";

type AuthStep = "email" | "check-email";

const AuthPrompt: React.FC = () => {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send magic link");
      }

      setStep("check-email");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    if (window.openai?.toolOutput) {
      const output: ToolOutput = {
        content: [
          {
            type: "text",
            text: `User wants to create an account with email: ${email}`,
          },
        ],
        structuredContent: {
          action: "createAccount",
          email: email,
        },
      };
      window.openai.toolOutput(output);
    }
  };

  const handleResend = () => {
    setStep("email");
    setEmail("");
    setError(null);
  };

  if (step === "check-email") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✉️</div>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.description}>
            We've sent a magic link to <strong>{email}</strong>. Click it to verify your account.
          </p>

          <div style={styles.nextSteps}>
            <p style={styles.nextStepsTitle}>What happens next:</p>
            <ul style={styles.stepsList}>
              <li>Click the link in your email</li>
              <li>Your account will be verified</li>
              <li>You'll be able to start full assessments immediately</li>
            </ul>
          </div>

          <button
            style={{ ...styles.button, ...styles.btnSecondary }}
            onClick={handleResend}
          >
            Didn't receive an email? Try again
          </button>

          <div style={styles.disclaimer}>
            Didn't work? Check your spam folder or try a different email.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>
        <h1 style={styles.title}>Create Your Account</h1>
        <p style={styles.description}>
          Sign in with your email to access full assessments and personalized insights for your child.
        </p>

        <form onSubmit={handleEmailSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            disabled={isLoading}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...styles.btnPrimary,
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <div style={styles.divider}>or</div>

        <button
          style={{ ...styles.button, ...styles.btnSecondary }}
          onClick={handleCreateAccount}
          disabled={isLoading}
        >
          Create Password Account
        </button>

        <div style={styles.disclaimer}>
          We'll never share your email. Sign in takes less than a minute.
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
    maxWidth: "500px",
    width: "100%",
    padding: "40px",
    textAlign: "center",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "12px",
  },
  description: {
    fontSize: "15px",
    color: "#6b7280",
    marginBottom: "24px",
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  btnSecondary: {
    background: "#f3f4f6",
    color: "#374151",
    width: "100%",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  divider: {
    textAlign: "center",
    color: "#d1d5db",
    margin: "24px 0 16px",
    position: "relative",
  },
  nextSteps: {
    background: "#f0f4ff",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
    textAlign: "left",
  },
  nextStepsTitle: {
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "8px",
  },
  stepsList: {
    marginLeft: "20px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.8,
  },
  disclaimer: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "16px",
  },
};

export default AuthPrompt;
