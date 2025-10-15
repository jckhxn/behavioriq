import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aidiagnostic.com").replace(
  /\/$/,
  ""
);

interface HeroContent {
  headline?: string;
  subheadline?: string;
  cta_label?: string;
  cta_href?: string;
  supporting_text?: string;
  trust_badges?: string[];
}

interface SocialProofContent {
  heading?: string;
  items?: string[];
}

interface DefinitionContent {
  heading?: string;
  paragraphs?: string[];
}

interface ProcessStep {
  step?: string;
  title?: string;
  description?: string;
}

interface ProcessContent {
  heading?: string;
  steps?: ProcessStep[];
}

interface ComparisonRow {
  label?: string;
  traditional?: string;
  behavioriq?: string;
}

interface ComparisonContent {
  heading?: string;
  rows?: ComparisonRow[];
}

interface FAQItem {
  question?: string;
  answer?: string;
}

interface LeadMagnetContent {
  heading?: string;
  subheading?: string;
  cta_label?: string;
  cta_href?: string;
  supporting_text?: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterContent {
  text?: string;
  links?: FooterLink[];
}

interface GeneratedPage {
  keyword: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_path?: string;
  hero?: HeroContent;
  social_proof?: SocialProofContent;
  definition_section?: DefinitionContent;
  process?: ProcessContent;
  comparison?: ComparisonContent;
  faq?: FAQItem[];
  lead_magnet?: LeadMagnetContent;
  footer?: FooterContent;
}

interface NormalizedHero {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  supportingText: string;
  trustBadges: string[];
}

interface NormalizedProcessStep {
  step: string;
  title: string;
  description: string;
}

interface NormalizedComparisonRow {
  label: string;
  traditional: string;
  behavioriq: string;
}

interface NormalizedFAQItem {
  question: string;
  answer: string;
}

interface NormalizedPageContent {
  hero: NormalizedHero;
  socialProof: { heading: string; items: string[] };
  definition: { heading: string; paragraphs: string[] };
  process: { heading: string; steps: NormalizedProcessStep[] };
  comparison: { heading: string; rows: NormalizedComparisonRow[] };
  faq: NormalizedFAQItem[];
  leadMagnet: {
    heading: string;
    subheading: string;
    ctaLabel: string;
    ctaHref: string;
    supportingText: string;
  };
  footer: { text: string; links: FooterLink[] };
}

const GENERATED_DIR = path.join(process.cwd(), "data", "generated");

const DEFAULT_TRUST_BADGES = [
  "HIPAA compliant",
  "Research-backed insights",
  "No credit card required",
];

const DEFAULT_SOCIAL_PROOF = {
  heading: "Trusted by Parents, Educators, and Clinics Nationwide",
  items: ["HIPAA Compliant", "APA-Inspired Framework", "Research-Backed AI"],
};

const DEFAULT_PROCESS_STEPS: NormalizedProcessStep[] = [
  {
    step: "1",
    title: "Answer",
    description:
      "Complete a short questionnaire about your child's routines, triggers, and strengths.",
  },
  {
    step: "2",
    title: "AI Analyzes",
    description:
      "BehaviorIQ™ reviews 50+ behavioral indicators against research-backed frameworks.",
  },
  {
    step: "3",
    title: "Get Report",
    description:
      "Unlock a private dashboard with next steps, resources, and a shareable summary.",
  },
];

const DEFAULT_COMPARISON_ROWS: NormalizedComparisonRow[] = [
  { label: "Wait Time", traditional: "6–12 weeks", behavioriq: "Hours" },
  { label: "Cost", traditional: "$1,500–$3,000", behavioriq: "Free snapshot, $97 full report" },
  { label: "Convenience", traditional: "In-office visits", behavioriq: "Online, anytime" },
  { label: "Insights", traditional: "Static report", behavioriq: "Dynamic AI recommendations" },
];

const DEFAULT_FAQ: NormalizedFAQItem[] = [
  {
    question: "Is an AI behavioral assessment accurate?",
    answer:
      "BehaviorIQ™ uses validated frameworks and research-backed scoring to surface reliable behavior patterns instantly.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. All responses are encrypted, HIPAA compliant, and never shared without your permission.",
  },
  {
    question: "Does this replace a psychologist?",
    answer:
      "No. BehaviorIQ™ equips families with clarity before or between specialist visits, helping you prepare better questions and documentation.",
  },
];

const DEFAULT_LEAD_MAGNET = {
  heading: "Try the Free Behavioral Snapshot",
  subheading:
    "See early indicators of focus, attention, or emotional regulation challenges in minutes.",
  ctaLabel: "Start Free Assessment",
  ctaHref: "/trial-assessment",
  supportingText:
    "Get instant access to your report and tailored parent resources—no appointments required.",
};

const DEFAULT_FOOTER = {
  text: "BehaviorIQ™ is an AI behavioral assessment platform for children, built for parents and educators seeking early insights.",
  links: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Support", href: "/support" },
  ],
};

const DEFAULT_SUPPORTING_TEXT =
  "Free screening. HIPAA-compliant. Research-backed. Upgrade only when it makes sense.";

function listGeneratedPages(): GeneratedPage[] {
  if (!fs.existsSync(GENERATED_DIR)) {
    return [];
  }

  return fs
    .readdirSync(GENERATED_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const filePath = path.join(GENERATED_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return data as GeneratedPage;
      } catch (error) {
        console.error(`Failed to parse generated page: ${filePath}`, error);
        return null;
      }
    })
    .filter((entry): entry is GeneratedPage => Boolean(entry));
}

function readGeneratedPage(slug: string): GeneratedPage | null {
  const file = path.join(GENERATED_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    return data as GeneratedPage;
  } catch (error) {
    console.error(`Failed to read generated page for ${slug}:`, error);
    return null;
  }
}

function stripHtml(html?: string, limit = 160): string {
  if (!html) return "";
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function extractParagraphs(html?: string): string[] {
  if (!html) return [];
  return html
    .split(/<\/p>/i)
    .map((segment) =>
      segment
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

function normalizePage(page: GeneratedPage): NormalizedPageContent {
  const heroSource = page.hero ?? {};
  const hero: NormalizedHero = {
    headline: heroSource.headline ?? `${page.keyword} — Get Answers Fast`,
    subheadline:
      heroSource.subheadline ??
      "BehaviorIQ™ helps parents and educators unlock behavior insights in hours, not weeks.",
    ctaLabel: heroSource.cta_label ?? "Start Free Assessment",
    ctaHref: heroSource.cta_href ?? "/trial-assessment",
    supportingText: heroSource.supporting_text ?? DEFAULT_SUPPORTING_TEXT,
    trustBadges:
      Array.isArray(heroSource.trust_badges) && heroSource.trust_badges.length > 0
        ? heroSource.trust_badges
        : DEFAULT_TRUST_BADGES,
  };

  const socialSource = page.social_proof ?? {};
  const socialProof = {
    heading: socialSource.heading ?? DEFAULT_SOCIAL_PROOF.heading,
    items:
      Array.isArray(socialSource.items) && socialSource.items.length
        ? socialSource.items
        : DEFAULT_SOCIAL_PROOF.items,
  };

  const definitionSource = page.definition_section ?? {};
  let definitionParagraphs =
    Array.isArray(definitionSource.paragraphs) && definitionSource.paragraphs.length
      ? definitionSource.paragraphs.filter(Boolean)
      : [];
  if (!definitionParagraphs.length && page.content) {
    definitionParagraphs = extractParagraphs(page.content).slice(0, 3);
  }
  if (!definitionParagraphs.length) {
    definitionParagraphs = [
      `${page.keyword} combines guided questionnaires with research-backed AI scoring to surface patterns with clarity.`,
      "BehaviorIQ™ highlights strengths, areas to monitor, and when to involve specialists so families can make confident decisions sooner.",
    ];
  }

  const definition = {
    heading: definitionSource.heading ?? `What is ${page.keyword}?`,
    paragraphs: definitionParagraphs,
  };

  const processSource = page.process ?? {};
  const providedSteps = Array.isArray(processSource.steps) ? processSource.steps : [];
  const processSteps = DEFAULT_PROCESS_STEPS.map((fallbackStep, index) => {
    const candidate = providedSteps[index];
    return {
      step: candidate?.step ?? fallbackStep.step,
      title: candidate?.title ?? fallbackStep.title,
      description: candidate?.description ?? fallbackStep.description,
    };
  });

  const comparisonSource = page.comparison ?? {};
  const comparisonRows: NormalizedComparisonRow[] = [];
  if (Array.isArray(comparisonSource.rows)) {
    for (const row of comparisonSource.rows) {
      if (row && row.label && row.traditional && row.behavioriq) {
        comparisonRows.push({
          label: row.label,
          traditional: row.traditional,
          behavioriq: row.behavioriq,
        });
      }
    }
  }
  DEFAULT_COMPARISON_ROWS.forEach((fallbackRow) => {
    if (comparisonRows.length >= 4) {
      return;
    }
    if (!comparisonRows.some((row) => row.label.toLowerCase() === fallbackRow.label.toLowerCase())) {
      comparisonRows.push(fallbackRow);
    }
  });

  const faqItems: NormalizedFAQItem[] =
    Array.isArray(page.faq) && page.faq.length
      ? page.faq
          .filter((faq): faq is FAQItem => Boolean(faq?.question && faq?.answer))
          .map((faq) => ({
            question: faq.question!,
            answer: faq.answer!,
          }))
      : DEFAULT_FAQ;

  const leadSource = page.lead_magnet ?? {};
  const leadMagnet = {
    heading: leadSource.heading ?? DEFAULT_LEAD_MAGNET.heading,
    subheading: leadSource.subheading ?? DEFAULT_LEAD_MAGNET.subheading,
    ctaLabel: leadSource.cta_label ?? DEFAULT_LEAD_MAGNET.ctaLabel,
    ctaHref: leadSource.cta_href ?? DEFAULT_LEAD_MAGNET.ctaHref,
    supportingText: leadSource.supporting_text ?? DEFAULT_LEAD_MAGNET.supportingText,
  };

  const footerSource = page.footer ?? {};
  const footer = {
    text: footerSource.text ?? DEFAULT_FOOTER.text,
    links:
      Array.isArray(footerSource.links) && footerSource.links.length
        ? footerSource.links
        : DEFAULT_FOOTER.links,
  };

  return {
    hero,
    socialProof,
    definition,
    process: {
      heading: processSource.heading ?? "How BehaviorIQ™ Works",
      steps: processSteps,
    },
    comparison: {
      heading: comparisonSource.heading ?? "Traditional Evaluations vs. AI-Powered Clarity",
      rows: comparisonRows.slice(0, 4),
    },
    faq: faqItems.slice(0, 6),
    leadMagnet,
    footer,
  };
}

function toAbsoluteUrl(pathValue: string): string {
  if (pathValue.startsWith("http")) {
    return pathValue;
  }
  if (pathValue.startsWith("/")) {
    return `${SITE_URL}${pathValue}`;
  }
  return `${SITE_URL}/${pathValue}`;
}

function buildFaqSchema(faq: NormalizedFAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function resolveMeta(page: GeneratedPage) {
  const title =
    page.meta_title ??
    page.metaTitle ??
    `${page.keyword} | AI Behavioral Assessments by BehaviorIQ™`;
  const description =
    page.meta_description ??
    page.metaDescription ??
    page.hero?.subheadline ??
    page.definition_section?.paragraphs?.[0] ??
    stripHtml(page.content, 160) ??
    "BehaviorIQ™ delivers private, AI-powered behavioral assessments trusted by parents and educators.";
  const canonicalPath = page.canonical_path ?? `/${page.slug}`;

  return {
    title,
    description,
    canonical: canonicalPath,
  };
}

export async function generateStaticParams() {
  return listGeneratedPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = readGeneratedPage(slug);
  if (!page) {
    return {};
  }

  const meta = resolveMeta(page);
  const canonicalUrl = toAbsoluteUrl(meta.canonical);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: "article",
      siteName: "BehaviorIQ™",
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [page.keyword, "BehaviorIQ", "AI behavioral assessment"],
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = readGeneratedPage(slug);

  if (!page) {
    notFound();
  }

  const normalized = normalizePage(page);
  const faqSchema =
    normalized.faq.length > 0 ? JSON.stringify(buildFaqSchema(normalized.faq)) : null;

  const allPages = listGeneratedPages();
  const relatedPages = allPages
    .filter((entry) => entry.slug !== slug)
    .slice(0, 6);

  return (
    <main className="bg-white text-gray-800">
      {faqSchema && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: faqSchema }}
        />
      )}

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {normalized.hero.headline}
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-700">
          {normalized.hero.subheadline}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={normalized.hero.ctaHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-md transition-all"
          >
            {normalized.hero.ctaLabel}
          </a>
          <a
            href="/conversational-trial"
            className="border border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold shadow-md transition-all"
          >
            Try the chat-guided demo
          </a>
        </div>
        <p className="text-sm mt-3 text-gray-500">{normalized.hero.supportingText}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          {normalized.hero.trustBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 shadow-sm"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          {normalized.socialProof.heading}
        </h2>
        <div className="flex flex-wrap justify-center gap-8 text-gray-500">
          {normalized.socialProof.items.map((item) => (
            <span key={item} className="uppercase tracking-wide text-sm">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Keyword Content */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {normalized.definition.heading}
        </h2>
        {normalized.definition.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-gray-700 mb-4">
            {paragraph}
          </p>
        ))}
      </section>

      {/* 3-Step Process */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">
            {normalized.process.heading}
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {normalized.process.steps.map((card) => (
              <div
                key={card.step}
                className="bg-white shadow-lg p-8 rounded-2xl hover:shadow-xl transition-all"
              >
                <h3 className="text-4xl font-bold text-blue-600 mb-4">{card.step}</h3>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{card.title}</h4>
                <p className="text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          {normalized.comparison.heading}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-gray-700">
            <thead>
              <tr>
                <th className="border-b p-4"></th>
                <th className="border-b p-4 font-bold text-gray-900">Traditional</th>
                <th className="border-b p-4 font-bold text-blue-700">BehaviorIQ™</th>
              </tr>
            </thead>
            <tbody>
              {normalized.comparison.rows.map((row) => (
                <tr key={row.label}>
                  <td className="p-4 font-medium text-gray-900">{row.label}</td>
                  <td className="p-4">{row.traditional}</td>
                  <td className="p-4 text-blue-700 font-semibold">{row.behavioriq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-10">
          <a
            href={normalized.hero.ctaHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-md transition-all"
          >
            {normalized.hero.ctaLabel}
          </a>
        </div>
      </section>

      {/* FAQ */}
      {normalized.faq.length > 0 && (
        <section className="bg-white px-6 py-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {normalized.faq.map((item) => (
              <div key={item.question} className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lead Magnet */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">{normalized.leadMagnet.heading}</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">{normalized.leadMagnet.subheading}</p>
        <a
          href={normalized.leadMagnet.ctaHref}
          className="bg-white text-blue-700 px-10 py-4 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-all"
        >
          {normalized.leadMagnet.ctaLabel}
        </a>
        <p className="text-sm mt-4 text-blue-100 max-w-xl mx-auto">
          {normalized.leadMagnet.supportingText}
        </p>
      </section>

      {/* Related Topics */}
      {relatedPages.length > 0 && (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Explore more BehaviorIQ™ topics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedPages.map((entry) => (
              <a
                key={entry.slug}
                href={`/${entry.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-sm uppercase tracking-wide text-blue-600 mb-2">BehaviorIQ™</div>
                <div className="text-lg font-semibold text-gray-900">{entry.keyword}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-10 text-sm">
        <p className="max-w-3xl mx-auto px-6">{normalized.footer.text}</p>
        <div className="mt-2 flex justify-center gap-4 text-blue-400">
          {normalized.footer.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}

