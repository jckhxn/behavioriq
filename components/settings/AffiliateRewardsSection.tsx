import React from "react";
import Link from "next/link";
import { useUserData } from "@/lib/hooks/use-supabase-user";

const AffiliateRewardsSection: React.FC = () => {
  const { userData } = useUserData();
  // This would be fetched via API in a real app
  const [referrer, setReferrer] = React.useState<any>(null);
  const [stats, setStats] = React.useState<any>(null);
  const [payableBalance, setPayableBalance] = React.useState<number>(0);

  React.useEffect(() => {
    if (!userData) return;
    fetch("/api/affiliate/me")
      .then((res) => res.json())
      .then((data) => {
        setReferrer(data.profile);
        setStats(data.stats);
        setPayableBalance(data.payableBalance);
      });
  }, [userData]);

  if (!userData) {
    return <div className="p-4 text-center">Sign in to view rewards.</div>;
  }
  if (!referrer) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-bold mb-2">Become an Affiliate</h2>
        <form method="post" action="/api/affiliate/register">
          <button className="btn btn-primary">Create My Referral Link</button>
        </form>
      </div>
    );
  }
  return (
    <div className="bg-white rounded shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Earn Rewards</h2>
      <div className="mb-4">
        <div className="font-semibold">Your Referral Link:</div>
        <div className="bg-gray-100 rounded px-3 py-2 mt-2 mb-2 text-sm select-all">
          {`${window.location.origin}/?ref=${referrer.refCode}`}
        </div>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(
              `${window.location.origin}/?ref=${referrer.refCode}`
            )
          }
        >
          Copy Link
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded p-3">
          <div className="font-bold">Clicks</div>
          <div>{stats?.clicks ?? 0}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="font-bold">Signups</div>
          <div>{stats?.signups ?? 0}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="font-bold">Pending</div>
          <div>{stats?.pending ?? 0}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="font-bold">Payable</div>
          <div>{stats?.payable ?? 0}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="font-bold">Paid</div>
          <div>{stats?.paid ?? 0}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="font-bold">Paid Out</div>
          <div>{stats?.paidOut ?? 0}</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="font-semibold">Payable Balance:</div>
        <div className="text-2xl font-bold">
          ${(payableBalance / 100).toFixed(2)}
        </div>
        <form method="post" action="/api/affiliate/payout">
          <button className="btn btn-primary mt-2">Request Payout</button>
        </form>
      </div>
      <div className="mb-4">
        <h3 className="font-bold mb-2">FAQ</h3>
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
      <div>
        <Link href="/settings/stripe-connect" className="btn btn-secondary">
          Setup Stripe Connect
        </Link>
      </div>
    </div>
  );
};

export default AffiliateRewardsSection;
