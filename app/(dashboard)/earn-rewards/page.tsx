import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function EarnRewardsPage() {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return (
      <div className="p-8 text-center">
        Please sign in to view your rewards.
      </div>
    );
  }
  const referrer = await prisma.affiliateReferrer.findFirst({
    where: { userId: user.id },
  });
  if (!referrer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Become an Affiliate</h2>
        <form method="post" action="/api/affiliate/register">
          <button className="btn btn-primary">Create My Referral Link</button>
        </form>
      </div>
    );
  }
  // Stats
  const stats = {
    clicks: await prisma.affiliateClick.count({
      where: { refCode: referrer.refCode },
    }),
    signups: await prisma.affiliateAttribution.count({
      where: { refCode: referrer.refCode },
    }),
    paid: await prisma.affiliateCommission.count({
      where: { refCode: referrer.refCode, status: "paid" },
    }),
    pending: await prisma.affiliateCommission.count({
      where: { refCode: referrer.refCode, status: "pending" },
    }),
    payable: await prisma.affiliateCommission.count({
      where: { refCode: referrer.refCode, status: "payable" },
    }),
    paidOut: await prisma.affiliatePayout.count({
      where: { referrerUserId: user.id },
    }),
  };
  const payableBalance = await prisma.affiliateCommission.aggregate({
    where: { refCode: referrer.refCode, status: "payable" },
    _sum: { amountCents: true },
  });
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Earn Rewards</h1>
      <div className="mb-6">
        <div className="font-semibold">Your Referral Link:</div>
        <div className="bg-gray-100 rounded px-3 py-2 mt-2 mb-2 text-sm select-all">
          {`${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${referrer.refCode}`}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() =>
            navigator.clipboard.writeText(
              `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${referrer.refCode}`
            )
          }
        >
          Copy Link
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4">
          <div className="text-lg font-bold">Clicks</div>
          <div className="text-2xl">{stats.clicks}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-lg font-bold">Signups</div>
          <div className="text-2xl">{stats.signups}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-lg font-bold">Pending</div>
          <div className="text-2xl">{stats.pending}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-lg font-bold">Payable</div>
          <div className="text-2xl">{stats.payable}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-lg font-bold">Paid</div>
          <div className="text-2xl">{stats.paid}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-lg font-bold">Paid Out</div>
          <div className="text-2xl">{stats.paidOut}</div>
        </div>
      </div>
      <div className="mb-6">
        <div className="font-semibold">Payable Balance:</div>
        <div className="text-2xl font-bold">
          ${((payableBalance._sum.amountCents || 0) / 100).toFixed(2)}
        </div>
        <form method="post" action="/api/affiliate/payout">
          <button className="btn btn-primary mt-2">Request Payout</button>
        </form>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">FAQ</h2>
        <ul className="list-disc pl-6 text-sm">
          <li>
            Share your referral link to earn rewards for every signup and
            purchase.
          </li>
          <li>
            Payouts are sent via Stripe Connect once your balance reaches $10.
          </li>
          <li>
            Pending commissions become payable after the refund window closes.
          </li>
          <li>Contact support for questions or issues.</li>
        </ul>
      </div>
      <div className="mb-6">
        <Link href="/settings/stripe-connect" className="btn btn-secondary">
          Setup Stripe Connect
        </Link>
      </div>
    </div>
  );
}
