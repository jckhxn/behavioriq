import React from "react";
import Link from "next/link";

export function HeaderNav({
  onStartSnapshot,
}: {
  onStartSnapshot: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-all duration-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg"
          aria-label="BehaviorIQ Home"
        >
          <span className="rounded bg-primary/10 px-2 py-1 text-primary">
            BIQ
          </span>
          <span className="hidden sm:inline">BehaviorIQ</span>
        </Link>
        {/* Right: Nav links */}
        <div className="flex items-center gap-4">
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:underline"
          >
            How it works
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline">
            Pricing
          </Link>
          <Link
            href="/schools"
            className="text-sm font-medium hover:underline"
            id="cta_contact_sales"
          >
            For Schools
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline">
            Sign in
          </Link>
          <button
            id="cta_start_snapshot_top"
            aria-label="Start Free Snapshot"
            className="btn-primary h-10 px-5 rounded-xl font-semibold ml-2 shadow-sm"
            onClick={onStartSnapshot}
          >
            Start Free Snapshot
          </button>
        </div>
      </nav>
    </header>
  );
}
