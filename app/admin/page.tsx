"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect all admin routes to main dashboard
    // Super Admin features are now on the "Super Admin" tab
    router.push("/");
  }, [router]);

  return null;
}
