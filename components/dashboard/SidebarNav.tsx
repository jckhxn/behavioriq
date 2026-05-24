"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/lib/hooks/use-supabase-user";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  BarChart3,
  School,
  UserCircle,
  CreditCard,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  Library,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import { CompactRecommendationsWithModal } from "@/components/recommendations/CompactRecommendationsWithModal";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarNavProps {
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
}

const roleNavItems: Record<string, NavItem[]> = {
  PARENT: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Assessments",
      href: "/dashboard?tab=assessments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Children",
      href: "/dashboard?tab=children",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Reports",
      href: "/dashboard?tab=reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ],
  TEACHER: [
    {
      label: "Dashboard",
      href: "/teacher",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "My Students",
      href: "/teacher?tab=students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Assessments",
      href: "/teacher?tab=assessments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Class Reports",
      href: "/teacher?tab=reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Library",
      href: "/teacher?tab=library",
      icon: <Library className="h-5 w-5" />,
    },
  ],
  COUNSELOR: [
    {
      label: "Dashboard",
      href: "/counselor",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Caseload",
      href: "/counselor?tab=caseload",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Risk Alerts",
      href: "/counselor?tab=alerts",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      label: "Reports",
      href: "/counselor?tab=reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Library",
      href: "/counselor?tab=library",
      icon: <Library className="h-5 w-5" />,
    },
  ],
  PRINCIPAL: [
    {
      label: "Dashboard",
      href: "/principal",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Staff",
      href: "/principal?tab=staff",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Analytics",
      href: "/principal?tab=analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Reports",
      href: "/principal?tab=reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Library",
      href: "/principal?tab=library",
      icon: <Library className="h-5 w-5" />,
    },
  ],
  DISTRICT_ADMIN: [
    {
      label: "Dashboard",
      href: "/district",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Schools",
      href: "/district?tab=schools",
      icon: <School className="h-5 w-5" />,
    },
    {
      label: "Analytics",
      href: "/district?tab=analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Users",
      href: "/district?tab=users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Students",
      href: "/district?tab=students",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      label: "Library",
      href: "/district?tab=library",
      icon: <Library className="h-5 w-5" />,
    },
  ],
  ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard/overview",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Assessments",
      href: "/dashboard/assessments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ],
};

const getBottomNavItems = (userRole: string): NavItem[] => {
  // Settings URL depends on user role
  const settingsHref =
    userRole === "TEACHER"
      ? "/teacher?tab=settings"
      : userRole === "COUNSELOR"
        ? "/counselor?tab=settings"
        : userRole === "PRINCIPAL"
          ? "/principal?tab=settings"
          : userRole === "DISTRICT_ADMIN"
            ? "/district?tab=settings"
            : "/?tab=settings";

  return [
    {
      label: "Settings",
      href: settingsHref,
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: "Help & Support",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];
};

export function SidebarNav({
  userRole = "PARENT",
  userName,
  userEmail,
  onSignOut,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { signOut: supabaseSignOut } = useSignOut();

  // Use provided onSignOut or default to supabase signOut
  const handleSignOut = onSignOut || supabaseSignOut;

  const navItems = roleNavItems[userRole] || roleNavItems.PARENT;

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
        pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]))
          ? "bg-primary/10 text-primary dark:bg-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center"
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {item.badge && !collapsed && (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
          {item.badge}
        </span>
      )}
      {item.badge && collapsed && (
        <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-medium rounded-full bg-red-500 text-white flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden"
              >
                BehaviorAI
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Recommendations Section */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 border-t border-border px-4 py-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Recommendations
              </h3>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              <CompactRecommendationsWithModal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        {getBottomNavItems(userRole).map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          {resolvedTheme === "dark"
            ? <Sun className="h-5 w-5 flex-shrink-0" />
            : <Moon className="h-5 w-5 flex-shrink-0" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted",
            collapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center flex-shrink-0">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {userName || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail || "user@example.com"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Button - Desktop Only */}
      <div className="hidden lg:block p-4 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-background shadow-lg border border-border"
      >
        <Menu className="h-6 w-6 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-2xl"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-background border-r border-border"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
