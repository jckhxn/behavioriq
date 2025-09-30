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
import LicenseManager from "./LicenseManager";
import EmailSettings from "./EmailSettings";
import { BrandingManager } from "./BrandingManager";
import { Key, Mail, Palette, Settings, Shield, Cog } from "lucide-react";

export function SystemSettings() {
  const [activeSubTab, setActiveSubTab] = useState("licenses");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure system-wide settings, licensing, branding, and email
          notifications
        </p>
      </div>

      {/* Quick Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("licenses")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              License Management
            </CardTitle>
            <Key className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Licenses</div>
            <p className="text-xs text-muted-foreground">
              Track usage, assign licenses, and manage subscription limits
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("branding")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Branding & Appearance
            </CardTitle>
            <Palette className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Customize Branding</div>
            <p className="text-xs text-muted-foreground">
              Configure logos, colors, and organizational branding
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveSubTab("email")}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Configuration
            </CardTitle>
            <Mail className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Email Settings</div>
            <p className="text-xs text-muted-foreground">
              Configure SMTP, templates, and notification preferences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="licenses" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Licenses
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="mt-6">
          <LicenseManager />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingManager organizationId="default" />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
