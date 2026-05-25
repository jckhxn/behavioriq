/**
 * GET /api/trial/results?trialId={sessionId}
 *
 * Get trial assessment results and scores in TrialResults format
 * Calculates domain scores from answers
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trialId = searchParams.get('trialId');

    if (!trialId) {
      return NextResponse.json(
        { error: 'Trial ID is required' },
        { status: 400 }
      );
    }

    // Get the trial session
    const session = await prisma.trialSession.findUnique({
      where: { id: trialId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Trial session not found' },
        { status: 404 }
      );
    }

    // Get trial assessment with domain questions
    const platformSettings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
          include: {
            domains: {
              include: {
                domainTemplate: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!platformSettings?.globalTrialAssessment) {
      return NextResponse.json(
        { error: 'No trial assessment configured' },
        { status: 404 }
      );
    }

    const trialAssessment = platformSettings.globalTrialAssessment;

    // Build a map of questionId -> domain for scoring
    const questionToDomain = new Map<string, string>();
    const allQuestions: Array<{ qid: string; domain: string }> = [];

    trialAssessment.domains.forEach((domain: any) => {
      const questions = Array.isArray(domain.domainTemplate.questions)
        ? domain.domainTemplate.questions
        : [];

      questions
        .filter((q: any) => q.isTrial === true)
        .forEach((q: any, idx: number) => {
          const qid = q.id || `q-${domain.id}-${idx}`;
          const domainName = domain.domainTemplate.name;
          questionToDomain.set(qid, domainName);
          allQuestions.push({ qid, domain: domainName });
        });
    });

    // Parse answers to calculate domain scores
    const answers = Array.isArray(session.answers) ? (session.answers as any[]) : [];
    const answeredQuestions = Array.isArray(session.questions)
      ? (session.questions as string[])
      : [];

    // Group answers by domain
    const domainScores = new Map<string, { yesCount: number; totalCount: number }>();

    answeredQuestions.forEach((qid: string) => {
      const domainName = questionToDomain.get(qid);
      if (!domainName) return;

      const answer = answers.find((a: any) => a.questionId === qid);
      const answerValue = answer?.answer || 0;

      if (!domainScores.has(domainName)) {
        domainScores.set(domainName, { yesCount: 0, totalCount: 0 });
      }

      const score = domainScores.get(domainName)!;
      score.totalCount++;
      if (answerValue === 3) {
        score.yesCount++;
      }
    });

    // Convert domain scores to DomainScore format (0-100 scale)
    const domains = Array.from(domainScores.entries()).map(([name, scores]) => ({
      name,
      score: scores.totalCount > 0 ? Math.round((scores.yesCount / scores.totalCount) * 100) : 0,
      screener: 60, // Default screener cutoff
      diagnostic: 80, // Default diagnostic cutoff
    }));

    // Determine flags based on domain scores
    const flags = domains
      .filter(d => d.score >= 70)
      .map(d => `${d.name} — Elevated`);

    // Return in TrialResults format expected by results page
    return NextResponse.json({
      childLabel: 'Child', // Trial doesn't track specific child name
      age: session.childAge || 0,
      completedAt: session.completedAt?.toISOString() || new Date().toISOString(),
      anonymous: true,
      domains: domains, // Domain scores calculated from answers
      subdomains: [], // Trial doesn't break down subdomains
      flags: flags.length > 0 ? flags : [], // Only include elevated domains as flags
      sessionId: trialId,
    });
  } catch (error) {
    console.error('[Trial Results API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get trial results' },
      { status: 500 }
    );
  }
}
