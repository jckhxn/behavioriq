import React from "react";

interface AffiliateFraudEmailProps {
  name: string;
  reason: string;
}

const AffiliateFraudEmail: React.FC<AffiliateFraudEmailProps> = ({
  name,
  reason,
}) => (
  <div style={{ fontFamily: "sans-serif", color: "#222", padding: 24 }}>
    <h1 style={{ color: "#d32f2f" }}>Account Suspended</h1>
    <p>Hi {name},</p>
    <p>
      Your affiliate account has been suspended due to the following reason:
    </p>
    <div
      style={{
        background: "#ffcdd2",
        padding: 12,
        borderRadius: 6,
        margin: "16px 0",
        fontWeight: "bold",
      }}
    >
      {reason}
    </div>
    <p>
      If you believe this is a mistake, please reply to this email or contact
      support.
    </p>
    <p>
      Best,
      <br />
      The AI Diagnostic Team
    </p>
  </div>
);

export default AffiliateFraudEmail;
