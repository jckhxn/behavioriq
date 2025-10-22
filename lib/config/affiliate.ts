export const AFFILIATE_SETTINGS = {
  cookieWindowDays: 30,
  holdDays: 14,
  payoutThresholdCents: 5000, // $50
  maxHouseholdReferrals: 10, // per 30 days
  milestoneBoosts: [
    { count: 5, bonusCents: 5000 }, // $50
    { count: 20, bonusCents: 15000 }, // $150
  ],
  payoutAmounts: {
    paidReport: 2000, // $20
    coreBonus: 1500, // $15
    familyBonus: 2500, // $25
    annualBonus: 5000, // $50
  },
  discountCents: 2000, // $20 off
  prohibitedDomains: [".edu", "school", "district"],
  banList: ["disposable", "tempmail", "mailinator"],
  velocityLimit: 10, // max 10 paid referrals per household per 30 days
  compliance: {
    kycRequiredCents: 60000, // $600/yr
    ftcDisclosure: true,
    minAge: 18,
    allowSchools: false,
    healthcareInducement: false,
  },
};
