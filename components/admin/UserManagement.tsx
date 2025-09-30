"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserManager } from "./UserManager";
import { SubAccountManager } from "./SubAccountManager";
import { Users, Building, UserPlus, Building2 } from "lucide-react";

export function UserManagement() {
  const [activeSubTab, setActiveSubTab] = useState("users");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage users, accounts, and organizational structure
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("users")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Individual Users
            </CardTitle>
            <Users className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage User Accounts</div>
            <p className="text-xs text-muted-foreground">
              Create, edit, and manage individual user accounts and permissions
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("sub-accounts")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sub-Account Management</div>
            <p className="text-xs text-muted-foreground">
              Manage organizational accounts, districts, and group licenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Individual Users
          </TabsTrigger>
          <TabsTrigger value="sub-accounts" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Organizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManager />
        </TabsContent>

        <TabsContent value="sub-accounts" className="mt-6">
          <SubAccountManager
            organizationId="org_1" // TODO: Get from user session
            userId="user_1" // TODO: Get from user session
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
