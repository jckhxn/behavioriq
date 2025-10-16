import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  supportingText: string;
  trustBadges: string[];
  mainImage?: string;
  dashboardImage?: string;
}

export function HeroSection({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  supportingText,
  trustBadges,
  mainImage = "/parentchild.jpg",
  dashboardImage = "/assessment.jpg",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30 px-6 py-20 md:py-32">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl text-foreground">
                {headline}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed md:text-xl text-pretty">
                {subheadline}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center text-base font-semibold shadow-lg hover:shadow-xl transition-shadow px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/conversational-trial"
                className="inline-flex items-center justify-center text-base font-semibold bg-transparent border border-blue-600 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-50"
              >
                Try the chat-guided demo
              </a>
            </div>
            <p className="text-sm text-muted-foreground">{supportingText}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 shadow-sm"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
              <Image
                src={mainImage}
                alt="Parent and child using BehaviorIQ assessment"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
                unoptimized={process.env.NODE_ENV === "development"}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-3/4 rounded-xl overflow-hidden shadow-2xl border-2 border-background bg-card hidden md:block">
              <Image
                src={dashboardImage}
                alt="BehaviorIQ dashboard preview"
                width={400}
                height={250}
                className="w-full h-auto"
                unoptimized={process.env.NODE_ENV === "development"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
