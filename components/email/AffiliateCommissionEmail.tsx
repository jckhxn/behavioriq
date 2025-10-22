import React from "react";

interface AffiliateCommissionEmailProps {
  name: string;
  amountCents: number;
  status: "pending" | "payable" | "paid";
}

const AffiliateCommissionEmail: React.FC<AffiliateCommissionEmailProps> = ({
  name,
  amountCents,
  status,
}) => (
  <div style={{ fontFamily: "sans-serif", color: "#222", padding: 24 }}>
    <h1 style={{ color: "#1976d2" }}>Commission Update</h1>
    <p>Hi {name},</p>
    <p>
      Your referral has generated a commission of{" "}
      <b>${(amountCents / 100).toFixed(2)}</b>.
    </p>
    <p>
      Status:{" "}
      <span
        style={{
          fontWeight: "bold",
          color:
            status === "payable"
              ? "#2e7d32"
              : status === "paid"
                ? "#1976d2"
                : "#fbc02d",
        }}
      >
        {status.toUpperCase()}
      </span>
    </p>
    {status === "pending" && (
      <p>This commission is pending until the refund window closes.</p>
    )}
    {status === "payable" && (
      <p>Your commission is now payable and can be requested for payout.</p>
    )}
    {status === "paid" && <p>Your commission has been paid out. Thank you!</p>}
    <p>Track your rewards and payouts in your dashboard.</p>
    <p style={{ fontSize: 12, color: "#888" }}>
      FTC Disclosure: You may earn commissions for referred purchases.
    </p>
    <p>
      Best,
      <br />
      The AI Diagnostic Team
    </p>
  </div>
);

export default AffiliateCommissionEmail;
