import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

const PLAN_SLUGS = ["core", "family"] as const;
const TERM_VALUES = ["monthly", "annual"] as const;
const SOURCE_VALUES = ["panel", "inline", "ribbon"] as const;

type PlanSlug = (typeof PLAN_SLUGS)[number];
type TermValue = (typeof TERM_VALUES)[number];
type SourceValue = (typeof SOURCE_VALUES)[number];

function normalizePlan(plan: unknown): PlanSlug | null {
  if (typeof plan !== "string") return null;
  const normalized = plan.trim().toLowerCase();
  return PLAN_SLUGS.find((value) => value === normalized) ?? null;
}

function normalizeTerm(term: unknown): TermValue | null {
  if (typeof term !== "string") return null;
  const normalized = term.trim().toLowerCase();
  return TERM_VALUES.find((value) => value === normalized) ?? null;
}

function normalizeSource(source: unknown): SourceValue {
  if (typeof source !== "string") return "panel";
  const normalized = source.trim().toLowerCase();
  return SOURCE_VALUES.find((value) => value === normalized) ?? "panel";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan = normalizePlan(body?.plan);
    const term = normalizeTerm(body?.term);
    const source = normalizeSource(body?.source);

    if (!plan || !term) {
      return NextResponse.json(
        { error: "Invalid plan or term" },
        { status: 400 }
      );
    }

    await prisma.telemetryEvent.create({
      data: {
        userId: user.id,
        event: "checkout.started",
        metadata: {
          plan,
          term,
          price: plan === "core"
            ? term === "monthly"
              ? 59
              : 597
            : term === "monthly"
              ? 99
              : 997,
          source,
        },
      },
    });

    const redirectUrl = `/checkout/${plan}?billing=${term}&source=${source}&type=subscription`;
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("[checkout] POST error", error);
    return NextResponse.json(
      { error: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
