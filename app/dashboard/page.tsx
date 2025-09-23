import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to main page instead of showing separate dashboard
  redirect("/");
}
