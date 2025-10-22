import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t py-8 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 mb-2 md:mb-0">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/disclaimers" className="hover:underline">
            Disclaimers
          </Link>
          <Link href="/schools" className="hover:underline">
            For Schools
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/dpa" className="hover:underline">
            DPA Request
          </Link>
        </div>
        <div className="text-center md:text-right">
          Designed to support FERPA/HIPAA • No AI data storage.
        </div>
      </div>
    </footer>
  );
}
