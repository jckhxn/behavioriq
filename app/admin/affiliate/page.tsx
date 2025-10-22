import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import Link from "next/link";

export default async function AffiliateAdminPage() {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center">Admin access required.</div>;
  }
  // Fetch flagged referrals (status: "flagged" or fraud/suspicious)
  const flagged = await prisma.affiliateReferrer.findMany({
    where: { status: "flagged" },
    include: {
      clicks: true,
      attributions: true,
      commissions: true,
      payouts: true,
    },
  });
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Flagged Referrals</h1>
      {flagged.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No flagged referrals.
        </div>
      ) : (
        <table className="w-full border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Ref Code</th>
              <th className="p-2 text-left">Clicks</th>
              <th className="p-2 text-left">Signups</th>
              <th className="p-2 text-left">Commissions</th>
              <th className="p-2 text-left">Payouts</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((ref: any) => (
              <tr key={ref.id} className="border-t">
                <td className="p-2">{ref.userId}</td>
                <td className="p-2">{ref.refCode}</td>
                <td className="p-2">{ref.clicks.length}</td>
                <td className="p-2">{ref.attributions.length}</td>
                <td className="p-2">{ref.commissions.length}</td>
                <td className="p-2">{ref.payouts.length}</td>
                <td className="p-2 font-semibold text-red-600">{ref.status}</td>
                <td className="p-2">
                  <form
                    method="post"
                    action={`/api/admin/affiliate/toggle-status`}
                  >
                    <input type="hidden" name="referrerId" value={ref.id} />
                    <button
                      className="btn btn-xs btn-secondary mr-2"
                      name="action"
                      value="unflag"
                    >
                      Unflag
                    </button>
                    <button
                      className="btn btn-xs btn-danger"
                      name="action"
                      value="ban"
                    >
                      Ban
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-8">
        <Link href="/admin/affiliate/analytics" className="btn btn-primary">
          View Analytics
        </Link>
      </div>
    </div>
  );
}
