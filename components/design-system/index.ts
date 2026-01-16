/**
 * Design System - Component Exports
 *
 * This file exports all redesigned components for the design system.
 * Import from here to use the modern, clean design.
 *
 * Usage:
 * import { Button, Card, Badge } from '@/components/design-system';
 */

// UI Components
export { Button } from "@/components/ui/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  StatCard,
} from "@/components/ui/card";
export { Badge, StatusBadge, RiskBadge } from "@/components/ui/badge";
export { Alert, InlineAlert, BannerAlert } from "@/components/ui/alert";
export {
  Input,
  SearchInput,
  Textarea,
  Select,
  Checkbox,
} from "@/components/ui/form-elements";

// Landing Page Components
export { LandingPage } from "@/components/landing/LandingPage";
export { HeaderNav } from "@/components/landing/HeaderNav";
export { Hero } from "@/components/landing/Hero";
export { HowItWorks } from "@/components/landing/HowItWorks";
export { PricingCards } from "@/components/landing/PricingCards";
export { FAQ } from "@/components/landing/FAQ";
export { FinalCTA } from "@/components/landing/FinalCTA";
export { Footer } from "@/components/landing/Footer";

// Dashboard Components
export { SidebarNav } from "@/components/dashboard/SidebarNav";
export {
  DashboardLayout,
  EmptyState,
  StatsGrid,
} from "@/components/dashboard/DashboardLayout";

// Auth Components
export { AuthLayout } from "@/components/auth/AuthLayout";
export { LoginForm } from "@/components/auth/LoginForm";
export { RegisterForm } from "@/components/auth/RegisterForm";

// District/Teacher Components
export { TeacherDashboardContentNew } from "@/components/district/TeacherDashboardContent";
