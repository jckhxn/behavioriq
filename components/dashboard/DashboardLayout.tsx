"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SidebarNav } from "./SidebarNav";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?:
    | "PARENT"
    | "TEACHER"
    | "COUNSELOR"
    | "PRINCIPAL"
    | "DISTRICT_ADMIN"
    | "ADMIN";
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardLayout({
  children,
  userRole = "PARENT",
  userName,
  userEmail,
  onSignOut,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        onSignOut={onSignOut}
      />

      {/* Main Content Area */}
      <main className="lg:pl-[280px] min-h-screen transition-all duration-200">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4">
              <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page Header */}
          {(title || actions) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 lg:mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="mt-1 text-muted-foreground">{description}</p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-3">{actions}</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Empty state component for dashboards
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Stats grid for dashboard overview
interface StatsGridProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: number;
    icon?: ReactNode;
  }>;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {stat.value}
              </p>
              {stat.change !== undefined && (
                <p
                  className={cn(
                    "mt-2 text-sm font-medium flex items-center gap-1",
                    stat.change >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  <span>{stat.change >= 0 ? "↑" : "↓"}</span>
                  <span>{Math.abs(stat.change)}%</span>
                  <span className="text-muted-foreground font-normal">
                    vs last month
                  </span>
                </p>
              )}
            </div>
            {stat.icon && (
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {stat.icon}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
