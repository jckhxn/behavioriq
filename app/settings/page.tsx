import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import SettingsPane from "@/components/settings/SettingsPane";

export const metadata: Metadata = {
  title: "Settings | AI Diagnostic",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        <SettingsPane />
      </div>
    </div>
  );
}
