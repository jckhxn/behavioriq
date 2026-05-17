import { prisma } from "@/lib/db/prisma";
import { getChatCompletion } from "./openai";
import { SYSTEM_PROMPTS } from "@/lib/config/ai-config";
import {
  loadAssessmentConfigs,
  loadAssessmentConfigFromTemplate,
  QuestionSetConfig,
} from "@/lib/assessment/db-loader";
import {
  ScoringCalculator,
  type QuestionResponse,
  type DomainScore,
} from "../assessment/scoring";
import { generateUniqueShortAssessmentId } from "@/lib/utils/shortId";

const isAssessmentDebugEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.ASSESSMENT_DEBUG === "true";

const debugLog = (...args: unknown[]) => {
  if (isAssessmentDebugEnabled) {
    console.log(...args);
  }
};

export interface AssessmentScores {
  [key: string]: number;
}

export interface ScoreUpdate {
  domain: string;
  rawScore: number;
  riskLevel: string; // was RiskLevel
  confidence: number;
}

export interface AssessmentResponse {
  message: string;
  scores: ScoreUpdate[];
  nextQuestion?: string;
  questionId?: string;
  currentDomain?: string;
  isComplete: boolean;
  progress?: {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  };
  aiRecommendations?: string;
}

export interface StructuredQuestionResponse {
  questionId: string;
  response: string | boolean; // Can be string from DB or boolean from code
  timestamp?: Date;
}

export interface ConversationMessage {
  role: string;
  content: string;
}

export interface StructuredSessionSnapshot {
  questionResponses: QuestionResponse[];
  questionSets: QuestionSetConfig[];
  nextQuestion: {
    questionId: string;
    text: string;
    domain: string;
  } | null;
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  };
}

const DEFAULT_SETUP_CACHE_TTL_MS =
  Number(process.env.ASSESSMENT_TEMPLATE_CACHE_TTL_MS) || 5 * 60 * 1000;
const SETUP_CACHE_DISABLED =
  process.env.ASSESSMENT_TEMPLATE_CACHE === "off" ||
  DEFAULT_SETUP_CACHE_TTL_MS <= 0;

type AssessmentSetupCacheEntry = {
  configs: QuestionSetConfig[];
  domainTemplateMap: Record<string, string>;
  calculator: ScoringCalculator;
  expiresAt: number;
};

type AssessmentResponseCacheEntry = {
  responses: QuestionResponse[];
  updatedAt: number;
};

const globalAssessmentCaches = globalThis as typeof globalThis & {
  __assessmentSetupCache?: Map<string, AssessmentSetupCacheEntry>;
  __assessmentResponseCache?: Map<string, AssessmentResponseCacheEntry>;
};

const assessmentSetupCache: Map<string, AssessmentSetupCacheEntry> =
  process.env.NODE_ENV === "production"
    ? (globalAssessmentCaches.__assessmentSetupCache ??
        (globalAssessmentCaches.__assessmentSetupCache = new Map()))
    : new Map();

const assessmentResponseCache =
  globalAssessmentCaches.__assessmentResponseCache ??
  new Map<string, AssessmentResponseCacheEntry>();

if (!globalAssessmentCaches.__assessmentResponseCache) {
  globalAssessmentCaches.__assessmentResponseCache = assessmentResponseCache;
}

export class AssessmentAI {
  private assessmentId: string;
  private currentScores: AssessmentScores;
  private conversationHistory: ConversationMessage[];
  private questionResponses: QuestionResponse[];
  private currentQuestionIndex: number;
  private currentDomainIndex: number;
  private isStructuredMode: boolean;
  private assessmentConfigs: QuestionSetConfig[] = [];
  private scoringCalculator: ScoringCalculator | null = null;
  private cachedDomainTemplateMapping: Record<string, string> | null = null; // Cache domain name → template ID mapping
  private cachedAssessmentTemplateId: string | null = null; // Cache assessment template ID

  constructor(assessmentId: string) {
    this.assessmentId = assessmentId;
    this.currentScores = {};
    this.conversationHistory = [];
    this.questionResponses = [];
    this.currentQuestionIndex = 0;
    this.currentDomainIndex = 0;
    this.isStructuredMode = true; // Always use structured mode per user story
  }

  private static async getAssessmentSetup(templateId: string | null): Promise<{
    configs: QuestionSetConfig[];
    domainTemplateMap: Record<string, string>;
    calculator: ScoringCalculator;
  }> {
    const cacheKey = templateId ?? "__default";
    const shouldUseCache = !SETUP_CACHE_DISABLED;

    if (shouldUseCache) {
      const cachedEntry = assessmentSetupCache.get(cacheKey);
      if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
        return cachedEntry;
      }
    }

    let configs: QuestionSetConfig[] = [];
    let domainTemplateMap: Record<string, string> = {};

    if (templateId) {
      const templateConfig = await loadAssessmentConfigFromTemplate(templateId);
      configs = templateConfig.configs;
      domainTemplateMap = templateConfig.domainTemplateMap || {};
    }

    if (!configs.length) {
      configs = await loadAssessmentConfigs();
      domainTemplateMap = {};
    }

    const calculator = new ScoringCalculator(configs);
    const entry: AssessmentSetupCacheEntry = {
      configs,
      domainTemplateMap,
      calculator,
      expiresAt: Date.now() + DEFAULT_SETUP_CACHE_TTL_MS,
    };

    if (shouldUseCache) {
      assessmentSetupCache.set(cacheKey, entry);
    }

    return entry;
  }

  private getCachedQuestionResponses(): QuestionResponse[] | null {
    const cached = assessmentResponseCache.get(this.assessmentId);
    if (!cached) {
      return null;
    }

    return cached.responses.map((response) => ({
      questionId: response.questionId,
      response: response.response,
      timestamp: response.timestamp ? new Date(response.timestamp) : undefined,
    }));
  }

  private writeQuestionResponseCache(responses: QuestionResponse[]): void {
    assessmentResponseCache.set(this.assessmentId, {
      responses: responses.map((response) => ({
        questionId: response.questionId,
        response: response.response,
        timestamp: response.timestamp
          ? new Date(response.timestamp)
          : undefined,
      })),
      updatedAt: Date.now(),
    });
  }

  private clearQuestionResponseCache(): void {
    assessmentResponseCache.delete(this.assessmentId);
  }

  private async hydrateQuestionResponses(): Promise<void> {
    const cachedResponses = this.getCachedQuestionResponses();
    if (cachedResponses) {
      this.questionResponses = cachedResponses;
      return;
    }

    const responses = await prisma.questionResponse.findMany({
      where: { assessmentId: this.assessmentId },
      orderBy: { timestamp: "asc" },
      select: {
        questionId: true,
        response: true,
        timestamp: true,
      },
    });

    const deduped = new Map<string, StructuredQuestionResponse>();
    const sortedResponses = responses.sort(
      (a: any, b: any) =>
        new Date(a.timestamp ?? new Date()).getTime() -
        new Date(b.timestamp ?? new Date()).getTime()
    );

    for (const r of sortedResponses) {
      deduped.delete(r.questionId);
      deduped.set(r.questionId, {
        questionId: r.questionId,
        response: r.response,
        timestamp: r.timestamp ?? undefined,
      });
    }

    this.questionResponses = Array.from(deduped.values());
    this.writeQuestionResponseCache(this.questionResponses);
  }

  async initialize(): Promise<void> {
    try {
      // Get the assessment to find its template
      const assessment = await prisma.assessment.findUnique({
        where: { id: this.assessmentId },
        select: { assessmentTemplateId: true },
      });

      this.cachedAssessmentTemplateId = assessment
        ? ((assessment as any).assessmentTemplateId as string | null)
        : null;

      const setup = await AssessmentAI.getAssessmentSetup(
        this.cachedAssessmentTemplateId
      );

      this.assessmentConfigs = setup.configs;
      this.cachedDomainTemplateMapping = setup.domainTemplateMap;
      this.scoringCalculator = setup.calculator;

      if (!this.isStructuredMode) {
        const messages = await prisma.chatMessage.findMany({
          where: { assessmentId: this.assessmentId },
          orderBy: { timestamp: "asc" },
        });

        this.conversationHistory = messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
      } else {
        this.conversationHistory = [];
      }

      await this.hydrateQuestionResponses();

      // Calculate current progress
      this.updateCurrentProgress();
    } catch (error) {
      console.error("Error initializing AssessmentAI:", error);
      throw new Error("Failed to initialize assessment");
    }
  }

  async processStructuredResponse(
    questionResponse: StructuredQuestionResponse
  ): Promise<AssessmentResponse> {
    try {
      // Ensure we only keep the latest response for each question
      this.questionResponses = this.questionResponses.filter(
        (existing) => existing.questionId !== questionResponse.questionId
      );

      this.questionResponses.push({
        questionId: questionResponse.questionId,
        response: questionResponse.response,
        timestamp: new Date(),
      });

      // Get current domain and check for skip conditions
      const currentDomain = this.getCurrentDomainFromQuestionId(
        questionResponse.questionId
      );

      const terminationCheck = this.scoringCalculator!.checkEarlyTermination(
        currentDomain,
        this.questionResponses
      );

      let nextQuestion = null;
      let isComplete = false;

      if (terminationCheck.nextQuestionId) {
        // Skip to specific question
        nextQuestion = this.getQuestionById(terminationCheck.nextQuestionId);
      } else {
        // Get next question using our improved logic
        nextQuestion = this.getNextQuestionImproved();
      }

      isComplete = nextQuestion === null;

      // Generate AI recommendations if complete
      let domainScores: DomainScore[] = [];
      let completionMeta: {
        userId: string | null;
        subjectName: string | null;
      } | null = null;
      if (isComplete) {
        domainScores = this.scoringCalculator!.getAllDomainScores(
          this.questionResponses
        );

        // Update assessment status to COMPLETED
        const assessment = await prisma.assessment.update({
          where: { id: this.assessmentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
          select: { userId: true, isConversational: true, subjectName: true },
        });

        completionMeta = {
          userId: assessment.userId,
          subjectName: assessment.subjectName,
        };

        // ✅ CHARGE CREDIT ON COMPLETION (not on start)
        // Only charge for regular assessments (conversational handled separately)
        if (assessment.userId && !assessment.isConversational) {
          const { assessmentCreditsService } = await import(
            "@/lib/services/assessment-credits-service"
          );
          try {
            await assessmentCreditsService.useCredit(assessment.userId);
            console.log(
              `[Assessment] ✅ Charged 1 credit for completed assessment ${this.assessmentId}`
            );
          } catch (error) {
            console.error(
              `[Assessment] ⚠️ Failed to charge credit for assessment ${this.assessmentId}:`,
              error
            );
            // Don't fail the completion if credit charge fails
          }
        }
      }

      // Save response to database
      await this.saveQuestionResponse(questionResponse);

      // Update scores only when assessment is complete to minimize DB churn
      if (isComplete) {
        await this.updateStructuredScores(domainScores);

        if (completionMeta?.userId) {
          void this.generateAndPersistRecommendations(
            domainScores,
            completionMeta.userId,
            completionMeta.subjectName || undefined
          );
        }
      }

      // ✅ FIX: Update progress indices after adding new response
      // This ensures accurate progress tracking, especially after going back
      this.updateCurrentProgress();

      const message = this.generateResponseMessage(
        questionResponse.response,
        nextQuestion,
        isComplete,
        undefined
      );

      return {
        message,
        scores: isComplete
          ? domainScores.map((ds) => ({
              domain: ds.domain,
              rawScore: ds.score,
              riskLevel: this.scoringCalculator!.mapScoreToRiskLevel(ds),
              confidence: ds.isClinicallySignificant ? 0.9 : 0.7,
            }))
          : [],
        nextQuestion: nextQuestion?.text,
        questionId: nextQuestion?.id,
        currentDomain: currentDomain,
        isComplete,
        progress: this.calculateProgress(),
        aiRecommendations: undefined,
      };
    } catch (error) {
      console.error("Error processing structured response:", error);
      throw new Error("Failed to process assessment response");
    }
  }

  private async generateAIRecommendations(
    domainScores: DomainScore[]
  ): Promise<string> {
    try {
      if (!domainScores.length || !this.scoringCalculator) {
        return "Unable to generate recommendations at this time.";
      }

      const assessmentRecord = await prisma.assessment.findUnique({
        where: { id: this.assessmentId },
        select: {
          subjectName: true,
          completedAt: true,
          startedAt: true,
        },
      });

      const domainDetails = domainScores.map((score) => {
        const riskLevelEnum =
          this.scoringCalculator!.mapScoreToRiskLevel(score);
        const domainConfig = this.assessmentConfigs.find(
          (config) => config.name === score.domain
        );
        return {
          domainName: score.displayName,
          percentage: Math.round((score.percentage || 0) * 10) / 10,
          riskLevelEnum,
          riskLevelLabel: this.formatRiskLevel(riskLevelEnum),
          resources: this.normalizeDomainResources(domainConfig?.resources),
        };
      });

      const riskPriority: Record<string, number> = {
        LOW: 1,
        MODERATE: 2,
        HIGH: 3,
        VERY_HIGH: 4,
      };

      const sortedDomains = [...domainDetails].sort((a: any, b: any) => {
        const riskDiff =
          (riskPriority[b.riskLevelEnum] || 0) -
          (riskPriority[a.riskLevelEnum] || 0);
        if (riskDiff !== 0) {
          return riskDiff;
        }
        return (b.percentage || 0) - (a.percentage || 0);
      });

      const topDomains = sortedDomains.slice(0, 3).map((domain) => {
        const domainInput: {
          domainName: string;
          percentage: number;
          riskLevel: string;
          resources?: { title: string; url?: string }[];
        } = {
          domainName: domain.domainName,
          percentage: domain.percentage ?? 0,
          riskLevel: domain.riskLevelLabel,
        };

        if (domain.resources.length > 0) {
          domainInput.resources = domain.resources;
        }

        return domainInput;
      });

      if (!topDomains.length) {
        return "Unable to generate recommendations at this time.";
      }

      const overallRisk = this.calculateOverallRiskLabel(domainDetails);
      const completedDate = assessmentRecord?.completedAt
        ? new Date(assessmentRecord.completedAt)
        : new Date(assessmentRecord?.startedAt || Date.now());

      const contextBlock = `CONTEXT:
Subject: ${assessmentRecord?.subjectName || "Participant"}
Completed: ${completedDate.toLocaleDateString()}
Overall Risk: ${overallRisk}
Total Questions Answered: ${this.questionResponses.length}`;

      const userContent = `${contextBlock}

INPUT DATA:
${JSON.stringify(topDomains, null, 2)}`;

      const response = await getChatCompletion([
        {
          role: "system",
          content: SYSTEM_PROMPTS.ASSESSMENT_ANALYSIS,
        },
        { role: "user", content: userContent },
      ]);

      return response || "Unable to generate recommendations at this time.";
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      return "Assessment complete. Please consult with a mental health professional for interpretation and next steps.";
    }
  }

  private calculateOverallRiskLabel(
    domains: Array<{
      riskLevelEnum: string; // was RiskLevel
      riskLevelLabel: string;
    }>
  ): string {
    if (!domains.length) {
      return this.formatRiskLevel("LOW");
    }

    const riskValues: Record<string, number> = {
      LOW: 1,
      MODERATE: 2,
      HIGH: 3,
      VERY_HIGH: 4,
    };

    const averageRisk =
      domains.reduce(
        (sum, domain) => sum + (riskValues[domain.riskLevelEnum] || 0),
        0
      ) / domains.length;

    if (averageRisk >= 3.5) return this.formatRiskLevel("VERY_HIGH");
    if (averageRisk >= 2.5) return this.formatRiskLevel("HIGH");
    if (averageRisk >= 1.5) return this.formatRiskLevel("MODERATE");
    return this.formatRiskLevel("LOW");
  }

  private formatRiskLevel(risk: string): string {
    // was RiskLevel
    return risk
      .toLowerCase()
      .split("_")
      .map((part: any) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  private normalizeDomainResources(
    resources: QuestionSetConfig["resources"]
  ): { title: string; url?: string }[] {
    if (!resources) {
      return [];
    }

    let parsedResources: unknown = resources;

    if (typeof resources === "string") {
      try {
        parsedResources = JSON.parse(resources);
      } catch (error) {
        console.warn("Failed to parse domain resources JSON:", error);
        return [];
      }
    }

    if (!Array.isArray(parsedResources)) {
      return [];
    }

    return parsedResources
      .map((resource) => {
        if (typeof resource === "string") {
          return { title: resource };
        }

        if (typeof resource === "object" && resource !== null) {
          const title =
            (resource as any).title ||
            (resource as any).name ||
            (resource as any).label;
          const url =
            (resource as any).url ||
            (resource as any).link ||
            (resource as any).href;

          if (!title && !url) {
            return null;
          }

          return url ? { title: title || url, url } : { title };
        }

        return null;
      })
      .filter(Boolean) as { title: string; url?: string }[];
  }

  private shouldSkipCurrentDomain(): boolean {
    if (this.currentDomainIndex >= this.assessmentConfigs.length) return false;

    const currentDomain = this.assessmentConfigs[this.currentDomainIndex];
    const domainScore = this.scoringCalculator!.calculateDomainScore(
      currentDomain.name,
      this.questionResponses
    );

    return domainScore.skipped || false;
  }

  private getCurrentDomainFromQuestionId(questionId: string): string {
    for (const domain of this.assessmentConfigs) {
      if (domain.questions.some((q) => q.id === questionId)) {
        return domain.name;
      }
    }
    throw new Error(`Domain not found for question ${questionId}`);
  }

  private getNextQuestionImproved() {
    // Get all answered question IDs
    const answeredQuestionIds = new Set(
      this.questionResponses.map((r) => r.questionId)
    );

    debugLog(`\n🔍 FINDING NEXT QUESTION`);
    debugLog(
      `Currently answered: [${Array.from(answeredQuestionIds).join(", ")}]`
    );

    // Go through each domain in order
    for (const domain of this.assessmentConfigs) {
      debugLog(`\n📋 Checking domain: ${domain.name}`);

      // Check if we have any responses for this domain
      const domainHasResponses = domain.questions.some((q) =>
        answeredQuestionIds.has(q.id)
      );

      debugLog(`Domain has responses: ${domainHasResponses}`);
      // console.log(`Domain has prerequisite: ${!!domain.prerequisite}`);

      // Only check for skipping if we've started this domain
      if (domainHasResponses) {
        // || domain.prerequisite) {
        debugLog(`⚖️ Evaluating domain for skipping...`);
        const domainScore = this.scoringCalculator!.calculateDomainScore(
          domain.name,
          this.questionResponses
        );
        if (domainScore.skipped || false) {
          debugLog(
            `⏭️ DOMAIN SKIPPED: ${domain.name} - ${
              domainScore.skipReason || "Unknown reason"
            }`
          );
          continue; // Skip this entire domain
        }
      } else {
        debugLog(
          `⏸️ Skipping evaluation (domain not started and no prerequisite)`
        );
      }

      // Find the first unanswered question in this domain
      debugLog(`🔎 Looking for unanswered questions in ${domain.name}...`);
      for (const question of domain.questions) {
        const isAnswered = answeredQuestionIds.has(question.id);
        debugLog(
          `  ${question.id}: ${isAnswered ? "✅ answered" : "❓ unanswered"}`
        );
        if (!isAnswered) {
          debugLog(`➡️ NEXT QUESTION: ${question.id} in domain ${domain.name}`);
          return question; // Return the next unanswered question
        }
      }
      debugLog(`✅ All questions in ${domain.name} are completed`);
    }

    // If we get here, all questions are answered
    debugLog(`🎉 ALL QUESTIONS COMPLETED!`);
    return null;
  }

  private getQuestionById(questionId: string) {
    for (const domain of this.assessmentConfigs) {
      const question = domain.questions.find((q) => q.id === questionId);
      if (question) {
        return question;
      }
    }
    return null;
  }

  private generateResponseMessage(
    userResponse: string | boolean,
    nextQuestion: any,
    isComplete: boolean,
    aiRecommendations?: string
  ): string {
    if (isComplete) {
      return `Assessment complete! Your responses have been recorded and analyzed. ${
        aiRecommendations ? "Please review the recommendations below." : ""
      }`;
    }

    return `Thank you for your response. ${
      nextQuestion ? "Next question ready." : "Moving to next section."
    }`;
  }

  private calculateProgress() {
    const totalQuestions = this.assessmentConfigs.reduce(
      (sum, domain) => sum + domain.questions.length,
      0
    );
    const answeredQuestions = this.questionResponses.length;
    const completedDomains = this.currentDomainIndex;

    return {
      totalQuestions,
      answeredQuestions,
      completedDomains,
      overallProgress: (answeredQuestions / totalQuestions) * 100,
    };
  }

  private updateCurrentProgress() {
    // Update current indices based on responses using improved logic
    const answeredQuestionIds = new Set(
      this.questionResponses.map((r) => r.questionId)
    );

    this.currentDomainIndex = 0;
    this.currentQuestionIndex = 0;

    // Find which domain we're currently working on
    for (
      let domainIndex = 0;
      domainIndex < this.assessmentConfigs.length;
      domainIndex++
    ) {
      const domain = this.assessmentConfigs[domainIndex];

      // Check if we have any responses for this domain
      const domainHasResponses = domain.questions.some((q) =>
        answeredQuestionIds.has(q.id)
      );

      // Only check for skipping if we've started this domain
      if (domainHasResponses) {
        // || domain.prerequisite) {
        const domainScore = this.scoringCalculator!.calculateDomainScore(
          domain.name,
          this.questionResponses
        );
        if (domainScore.skipped || false) {
          continue;
        }
      }

      // Check questions in this domain
      let allQuestionsAnswered = true;
      let lastAnsweredIndex = -1;

      for (
        let questionIndex = 0;
        questionIndex < domain.questions.length;
        questionIndex++
      ) {
        const question = domain.questions[questionIndex];
        if (answeredQuestionIds.has(question.id)) {
          lastAnsweredIndex = questionIndex;
        } else {
          allQuestionsAnswered = false;
          break;
        }
      }

      if (!allQuestionsAnswered) {
        // This is the current domain we're working on
        this.currentDomainIndex = domainIndex;
        this.currentQuestionIndex = lastAnsweredIndex + 1;
        return;
      }
    }

    // If we reach here, all domains are complete
    this.currentDomainIndex = this.assessmentConfigs.length;
    this.currentQuestionIndex = 0;
  }

  private async saveQuestionResponse(
    questionResponse: StructuredQuestionResponse
  ) {
    try {
      // Convert response to string if it's a boolean
      const responseStr = typeof questionResponse.response === 'string'
        ? questionResponse.response
        : String(questionResponse.response);

      await prisma.questionResponse.upsert({
        where: {
          assessmentId_questionId: {
            assessmentId: this.assessmentId,
            questionId: questionResponse.questionId,
          },
        },
        update: {
          response: responseStr,
          timestamp: new Date(),
        },
        create: {
          assessmentId: this.assessmentId,
          questionId: questionResponse.questionId,
          response: responseStr,
          timestamp: new Date(),
        },
      });
      this.writeQuestionResponseCache(this.questionResponses);
    } catch (error) {
      console.error("Error saving question response:", error);
      // Invalidate cache if persistence failed to avoid serving stale data
      this.clearQuestionResponseCache();
    }
  }

  private mapDomainToEnum(domainName: string): string {
    // was AssessmentDomain
    // Map domain names (from templates or hardcoded) to Prisma enum values
    // This is a temporary solution - ideally Score table should store template ID instead of enum
    const normalizedName = domainName.toUpperCase().replace(/[^A-Z]/g, "");

    const domainMapping: Record<string, string> = {
      // Hardcoded domain names
      SUICIDALITY: "EMOTIONAL",
      SELFHARM: "VIOLENCE",
      ANTISOCIAL: "ANTISOCIAL",

      // Template-based domain names (try to map intelligently)
      ATTENTION: "ATTENTION",
      VIOLENCE: "VIOLENCE",
      EMOTIONAL: "EMOTIONAL",

      // Common variations
      ANXIETY: "EMOTIONAL",
      DEPRESSION: "EMOTIONAL",
      MOOD: "EMOTIONAL",
      ADHD: "ATTENTION",
      FOCUS: "ATTENTION",
      HYPERACTIVITY: "ATTENTION",
      AGGRESSION: "VIOLENCE",
      BEHAVIORAL: "CONDUCT",
      OPPOSITIONAL: "CONDUCT",
      ODD: "CONDUCT",
    };

    // Try exact match first
    if (domainMapping[normalizedName]) {
      return domainMapping[normalizedName];
    }

    // Try partial match
    for (const [key, value] of Object.entries(domainMapping)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }

    // Default fallback - use ANTISOCIAL
    console.warn(
      `No mapping found for domain "${domainName}", defaulting to ANTISOCIAL`
    );
    return "ANTISOCIAL";
  }

  /**
   * ✅ PERFORMANCE: Use cached mapping instead of repeated DB queries
   * Previously made 2 database calls on every answer. Now uses cached data.
   */
  private async updateStructuredScores(
    domainScores: DomainScore[]
  ): Promise<void> {
    try {
      // ✅ PERFORMANCE: Use cached mapping - NO database queries needed here!
      const domainNameToTemplateId = this.cachedDomainTemplateMapping || {};

      const baseTimestamp = new Date();
      const scoreUpdates = domainScores.map((domainScore, index) => {
        // Find matching domain template ID from cache
        const domainTemplateId =
          domainNameToTemplateId[domainScore.domain] ||
          domainNameToTemplateId[domainScore.domain.toUpperCase()] ||
          domainNameToTemplateId[domainScore.domain.toLowerCase()];

        // Map domain string to AssessmentDomain enum if possible
        let domainEnum: any = null;
        const domainStr = domainScore.domain?.toUpperCase();
        if (
          [
            "ANTISOCIAL",
            "VIOLENCE",
            "ATTENTION",
            "EMOTIONAL",
            "CONDUCT",
          ].includes(domainStr)
        ) {
          domainEnum = domainStr;
        }

        return {
          assessmentId: this.assessmentId,
          domainTemplateId: domainTemplateId || null,
          domainName: domainScore.domain, // Store the domain name directly
          domain: domainTemplateId ? null : domainEnum,
          rawScore: domainScore.score,
          totalPossible: domainScore.totalPossible,
          questionsAnswered: domainScore.questionsAnswered,
          riskLevel: this.scoringCalculator!.mapScoreToRiskLevel(domainScore),
          confidence: domainScore.isClinicallySignificant ? 0.9 : 0.7,
          timestamp: new Date(baseTimestamp.getTime() + index), // Add milliseconds to make unique
        };
      });

      // Delete existing scores for this assessment
      await prisma.score.deleteMany({
        where: {
          assessmentId: this.assessmentId,
        },
      });

      // Create new scores
      await prisma.score.createMany({
        data: scoreUpdates,
      });
    } catch (error) {
      console.error("Error updating scores:", error);
      throw error; // surface so callers can detect the failure
    }
  }

  private async generateAndPersistRecommendations(
    domainScores: DomainScore[],
    userId: string,
    subjectName?: string
  ) {
    if (!domainScores.length) {
      return;
    }

    try {
      const recommendations =
        await this.generateAIRecommendations(domainScores);

      if (!recommendations || !recommendations.trim()) {
        return;
      }

      const existingRecommendation = await prisma.recommendation.findFirst({
        where: {
          assessmentId: this.assessmentId,
          userId,
          category: "AI Generated",
        },
        orderBy: { createdAt: "desc" },
      });

      const title =
        subjectName && subjectName.trim().length > 0
          ? `Assessment Recommendations for ${subjectName}`
          : "Assessment Recommendations";

      if (existingRecommendation) {
        await prisma.recommendation.update({
          where: { id: existingRecommendation.id },
          data: {
            content: recommendations,
            title,
          },
        });
      } else {
        await prisma.recommendation.create({
          data: {
            assessmentId: this.assessmentId,
            userId,
            title,
            content: recommendations,
            category: "AI Generated",
            priority: 3,
          },
        });
      }
    } catch (error) {
      console.error("Error generating and saving AI recommendations:", error);
    }
  }

  async getInitialStructuredQuestion(): Promise<{
    questionId: string;
    text: string;
    domain: string;
  } | null> {
    if (this.assessmentConfigs.length === 0) return null;

    const firstDomain = this.assessmentConfigs[0];
    const firstQuestion = firstDomain.questions[0];

    return {
      questionId: firstQuestion.id,
      text: firstQuestion.text,
      domain: firstDomain.name,
    };
  }

  async getCurrentScores(): Promise<AssessmentScores> {
    return this.currentScores;
  }

  async getCurrentProgress() {
    return this.calculateProgress();
  }

  async getNextQuestion(): Promise<{
    questionId: string;
    text: string;
    domain: string;
  } | null> {
    const nextQuestion = this.getNextQuestionImproved();

    if (!nextQuestion) {
      return null;
    }

    // Find which domain this question belongs to
    const domain = this.assessmentConfigs.find((d) =>
      d.questions.some((q) => q.id === nextQuestion.id)
    );

    return {
      questionId: nextQuestion.id,
      text: nextQuestion.text,
      domain: domain?.name || "Unknown",
    };
  }

  /**
   * ✅ NEW: Get the previous question for back navigation
   * Removes the last response and returns the question before the current one
   */
  async getPreviousQuestion(): Promise<{
    questionId: string;
    text: string;
    domain: string;
  } | null> {
    // Need at least one response to go back
    if (this.questionResponses.length === 0) {
      return null;
    }

    // Remove the last response
    const lastResponse = this.questionResponses.pop();

    if (!lastResponse) {
      return null;
    }

    // Delete the response from database
    try {
      await prisma.questionResponse.deleteMany({
        where: {
          assessmentId: this.assessmentId,
          questionId: lastResponse.questionId,
        },
      });

      // Also delete the latest scores since they include this response
      await prisma.score.deleteMany({
        where: {
          assessmentId: this.assessmentId,
        },
      });

      // Recalculate and save scores without the deleted response
      if (this.questionResponses.length > 0) {
        const domainScores = this.scoringCalculator!.getAllDomainScores(
          this.questionResponses
        );
        await this.updateStructuredScores(domainScores);
      }

      // ✅ FIX: Update current progress indices after removing response
      // This ensures the progress counter stays accurate
      this.updateCurrentProgress();
      this.writeQuestionResponseCache(this.questionResponses);
    } catch (error) {
      console.error("Error removing last response:", error);
      // Restore local state if persistence failed
      this.questionResponses.push(lastResponse);
      this.writeQuestionResponseCache(this.questionResponses);
      this.updateCurrentProgress();
      return null;
    }

    // Return the question that was just removed (the one to show again)
    const questionToShow = this.getQuestionById(lastResponse.questionId);

    if (!questionToShow) {
      return null;
    }

    // Find which domain this question belongs to
    const domain = this.assessmentConfigs.find((d) =>
      d.questions.some((q) => q.id === questionToShow.id)
    );

    return {
      questionId: questionToShow.id,
      text: questionToShow.text,
      domain: domain?.name || "Unknown",
    };
  }

  getStructuredSessionSnapshot(): StructuredSessionSnapshot {
    // Ensure progress indices are up to date before generating snapshot
    this.updateCurrentProgress();

    const nextQuestion = this.getNextQuestionImproved();
    const progress = this.calculateProgress();

    return {
      questionResponses: this.questionResponses.map((response) => ({
        questionId: response.questionId,
        response: response.response,
        timestamp: response.timestamp,
      })),
      questionSets: this.assessmentConfigs,
      nextQuestion: nextQuestion
        ? {
            questionId: nextQuestion.id,
            text: nextQuestion.text,
            domain: this.getCurrentDomainFromQuestionId(nextQuestion.id),
          }
        : null,
      progress,
    };
  }

  /**
   * Compute domain scores from all persisted responses, save them, and mark
   * the assessment COMPLETED. Called by the /finalize endpoint when the client
   * determines all questions have been answered (accounting for skip logic that
   * the per-answer processStructuredResponse path may not have applied).
   */
  async finalizeAssessment(chargeCredit = true): Promise<void> {
    if (!this.scoringCalculator) {
      throw new Error("AssessmentAI not initialized");
    }

    const domainScores = this.scoringCalculator.getAllDomainScores(
      this.questionResponses
    );

    const assessment = await prisma.assessment.update({
      where: { id: this.assessmentId },
      data: { status: "COMPLETED", completedAt: new Date() },
      select: { userId: true, isConversational: true, subjectName: true },
    });

    if (chargeCredit && assessment.userId && !assessment.isConversational) {
      const { assessmentCreditsService } = await import(
        "@/lib/services/assessment-credits-service"
      );
      try {
        await assessmentCreditsService.useCredit(assessment.userId);
      } catch (error) {
        console.error(
          `[finalize] credit charge failed for ${this.assessmentId}:`,
          error
        );
      }
    }

    await this.updateStructuredScores(domainScores);

    if (assessment.userId && domainScores.length > 0) {
      void this.generateAndPersistRecommendations(
        domainScores,
        assessment.userId,
        assessment.subjectName || undefined
      );
    }

    console.log(
      `[finalize] ✅ Assessment ${this.assessmentId} finalized with ${domainScores.length} domain scores`
    );
  }

  static async createNewAssessment(
    userId: string,
    subjectName: string,
    assessmentTemplateId?: string,
    childProfileId?: string
  ): Promise<{ id: string; shortId: string }> {
    try {
      // Helper function to check if shortId exists
      const shortIdExists = async (shortId: string): Promise<boolean> => {
        const existing = await prisma.assessment.findUnique({
          where: { shortId },
          select: { id: true },
        });
        return !!existing;
      };

      // Generate unique shortId
      const shortId = await generateUniqueShortAssessmentId(shortIdExists);

      const assessment = await prisma.assessment.create({
        data: {
          userId,
          subjectName,
          shortId,
          status: "IN_PROGRESS",
          currentDomain: "ANTISOCIAL", // Use string literal for enum value
          ...(assessmentTemplateId && { assessmentTemplateId }), // Associate with the template if provided
          ...(childProfileId && { childprofileid: childProfileId }), // Associate with child profile if provided
        } as any,
      });

      return { id: assessment.id, shortId };
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw new Error("Failed to create new assessment");
    }
  }
}
