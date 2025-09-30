import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SuperAdminPlatformSettings } from "@/components/admin/SuperAdminPlatformSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

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
          <Tabs defaultValue="platform" className="w-full">
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
