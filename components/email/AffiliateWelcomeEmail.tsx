import React from "react";

interface AffiliateWelcomeEmailProps {
  name: string;
  refCode: string;
}

const AffiliateWelcomeEmail: React.FC<AffiliateWelcomeEmailProps> = ({
  name,
  refCode,
}) => (
  <div style={{ fontFamily: "sans-serif", color: "#222", padding: 24 }}>
    <h1 style={{ color: "#2e7d32" }}>Welcome to the Affiliate Program!</h1>
    <p>Hi {name},</p>
    <p>
      Thank you for joining our affiliate program. Your referral link is ready:
    </p>
    <div
      style={{
        background: "#f0f4c3",
        padding: 12,
        borderRadius: 6,
        margin: "16px 0",
        fontWeight: "bold",
      }}
    >
      {`${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${refCode}`}
    </div>
    <p>
      Share your link to earn rewards for every signup and purchase. You can
      track your stats and payouts in your dashboard.
    </p>
    <p style={{ fontSize: 12, color: "#888" }}>
      FTC Disclosure: You may earn commissions for referred purchases.
    </p>
    <p>Questions? Reply to this email or contact support.</p>
    <p>
      Best,
      <br />
      The AI Diagnostic Team
    </p>
  </div>
);

export default AffiliateWelcomeEmail;
