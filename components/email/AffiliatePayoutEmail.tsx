import React from "react";

interface AffiliatePayoutEmailProps {
  name: string;
  amountCents: number;
}

const AffiliatePayoutEmail: React.FC<AffiliatePayoutEmailProps> = ({
  name,
  amountCents,
}) => (
  <div style={{ fontFamily: "sans-serif", color: "#222", padding: 24 }}>
    <h1 style={{ color: "#388e3c" }}>Payout Sent</h1>
    <p>Hi {name},</p>
    <p>
      Your payout of <b>${(amountCents / 100).toFixed(2)}</b> has been sent via
      Stripe Connect.
    </p>
    <p>Track your payout status in your dashboard.</p>
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

export default AffiliatePayoutEmail;
