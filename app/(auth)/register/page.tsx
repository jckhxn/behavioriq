/**
 * Register Page - Redirects to Trial Assessment
 *
 * We no longer allow standalone registration.
 * Users must either:
 * 1. Take a trial assessment (free)
 * 2. Purchase a full assessment ($97) → creates BASIC account
 * 3. Subscribe (Monthly/Annual) → creates PROFESSIONAL account
 */

import { redirect } from "next/navigation";

export default function RegisterPage() {
  // Server-side redirect to trial assessment
  redirect("/trial-assessment");
}
