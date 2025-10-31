import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface StartTrialPayload {
  anonymous?: boolean;
  region?: string;
  utm?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartTrialPayload;

    // Debug logging
    const refCode = body.utm?.ref as string | undefined;
    if (refCode) {
      console.log('[trial/start] 📥 Received ref from request body:', refCode);
    } else {
      console.log('[trial/start] ⚠️ No ref in request body');
    }

    const session = await prisma.snapshotSession.create({
      data: {
        anonymous: Boolean(body.anonymous),
        consented: true,
        region: body.region ?? null,
        utm: body.utm ? JSON.stringify(body.utm) : undefined,
      },
    });

    // Extract refCode from utm if present
    let refCodeToReturn: string | null = null;
    if (body.utm && typeof body.utm === 'object' && 'ref' in body.utm) {
      const refCode = (body.utm as Record<string, unknown>).ref;
      if (typeof refCode === 'string' && refCode.trim()) {
        refCodeToReturn = refCode;
      }
    }

    // ✅ CRITICAL: Set affiliate cookie from utm.ref if present
    // This ensures the cookie persists for assessment/start and checkout APIs
    // Also return refCode to client as fallback (in case cookie fails)
    const responseData: any = { sessionId: session.id };
    if (refCodeToReturn) {
      responseData.refCode = refCodeToReturn;
    }

    const response = NextResponse.json(responseData);

    if (refCodeToReturn) {
      const cookieOptions: any = {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      };

      // Only set domain if explicitly configured (don't set for localhost)
      const domain = process.env.AFFILIATE_COOKIE_DOMAIN;
      if (domain && domain.trim()) {
        cookieOptions.domain = domain;
      }

      response.cookies.set('biq_ref', refCodeToReturn, cookieOptions);
      console.log(`[trial/start] ✅ Set affiliate cookie: ref=${refCodeToReturn}`);
    }

    return response;
  } catch (error) {
    console.error("[trial/start] failed", error);
    return NextResponse.json(
      { error: "Unable to start trial session" },
      { status: 500 }
    );
  }
}
