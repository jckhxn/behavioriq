import { redirect } from "next/navigation";

export default function DashboardPage() {
  // All users go to main page which handles role-based rendering
  redirect("/");
}
