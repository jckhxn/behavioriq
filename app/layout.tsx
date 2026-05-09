import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono, Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AffiliateTracker } from "@/components/AffiliateTracker";
import { AnalyticsInitializer } from "@/components/analytics/AnalyticsInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-admin",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://behavioriq.app";

export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "BehaviorIQ - AI-Powered Behavioral Assessments",
    template: "%s | BehaviorIQ",
  },
  description:
    "Conversational AI behavioral assessments with intelligent document-based chat. Comprehensive parent-led screening for ADHD, autism, anxiety, and more.",

  // Keywords
  keywords: [
    "behavioral assessment",
    "ADHD screening",
    "autism assessment",
    "anxiety screening",
    "child behavioral evaluation",
    "mental health assessment",
    "parent assessment tool",
    "AI assessment",
    "behavioral health screening",
  ],

  // Open Graph (for social media sharing)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "BehaviorIQ",
    title: "BehaviorIQ - AI-Powered Behavioral Assessments",
    description:
      "Conversational AI behavioral assessments with intelligent document-based chat. Comprehensive parent-led screening for ADHD, autism, anxiety, and more.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "BehaviorIQ - AI-Powered Behavioral Assessments",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "BehaviorIQ - AI-Powered Behavioral Assessments",
    description:
      "Conversational AI behavioral assessments with intelligent document-based chat. Comprehensive parent-led screening for ADHD, autism, anxiety, and more.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@behavioriq",
  },

  // Additional metadata
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Robots configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // Canonical URL (will be overridden per-page if needed)
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-US": `${BASE_URL}/en-US`,
    },
  },

  // Verification
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />

        {/* Google Analytics 4 */}
        {ga4MeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
              strategy="afterInteractive"
            />
            <Script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${ga4MeasurementId}', {
                    'anonymize_ip': true,
                    'cookie_flags': 'SameSite=None;Secure'
                  });
                `,
              }}
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${sourceSans3.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <AffiliateTracker />
            <AnalyticsInitializer />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
