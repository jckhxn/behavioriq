"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SuperAdminPlatformSettings } from "@/components/admin/SuperAdminPlatformSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingPage } from "@/components/ui/loading";

function AdminPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("platform");

  useEffect(() => {
    if (status === "loading") return;

    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)
    ) {
      router.push("/");
      return;
    }

    // Handle URL parameters for deep linking
    const view = searchParams.get("view");
    const tab = searchParams.get("tab");

    if (view === "builder" && tab === "domains") {
      // Switch to admin tab where AssessmentTemplateManager is located
      setActiveTab("admin");
    }
  }, [session, status, router, searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    return null;
  }

  const isSuperAdmin = (session.user.role as string) === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? "Manage global platform settings, assessments, and system configuration"
              : "Manage documents, users, and system settings"}
          </p>
        </div>

        {isSuperAdmin ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="platform">Platform Settings</TabsTrigger>
              <TabsTrigger value="admin">Admin Tools</TabsTrigger>
            </TabsList>
            <TabsContent value="platform" className="mt-6">
              <SuperAdminPlatformSettings />
            </TabsContent>
            <TabsContent value="admin" className="mt-6">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingPage text="Loading admin interface..." />}>
      <AdminPageContent />
    </Suspense>
  );
}
