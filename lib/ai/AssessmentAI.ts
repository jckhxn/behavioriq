import { prisma } from "@/lib/db/prisma";
import { getChatCompletion } from "./openai";
import { AssessmentDomain, RiskLevel, MessageRole } from "@prisma/client";
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

export interface AssessmentScores {
  [key: string]: number;
}

export interface ScoreUpdate {
  domain: string;
  rawScore: number;
  riskLevel: RiskLevel;
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
  response: boolean;
}

export interface ConversationMessage {
  role: string;
  content: string;
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

  async initialize(): Promise<void> {
    try {
      // Get the assessment to find its template
      const assessment = await prisma.assessment.findUnique({
        where: { id: this.assessmentId },
        select: { assessmentTemplateId: true },
      });

      if (assessment && (assessment as any).assessmentTemplateId) {
        // Cache the template ID for later use
        this.cachedAssessmentTemplateId = (
          assessment as any
        ).assessmentTemplateId;

        // Load configuration from the specific template
        this.assessmentConfigs = await loadAssessmentConfigFromTemplate(
          (assessment as any).assessmentTemplateId
        );

        // Build and cache domain name to template ID mapping
        await this.buildDomainTemplateMapping();
      } else {
        // Fallback to legacy configuration loading
        this.assessmentConfigs = await loadAssessmentConfigs();
      }

      // Create scoring calculator with loaded configs
      this.scoringCalculator = new ScoringCalculator(this.assessmentConfigs); // Load existing conversation history
      const messages = await prisma.chatMessage.findMany({
        where: { assessmentId: this.assessmentId },
        orderBy: { timestamp: "asc" },
      });

      this.conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Load question responses for structured mode
      const responses = await prisma.questionResponse.findMany({
        where: { assessmentId: this.assessmentId },
        orderBy: { timestamp: "asc" },
      });

      this.questionResponses = responses.map((r) => ({
        questionId: r.questionId,
        response: r.response,
        timestamp: r.timestamp,
      }));

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
      // Store the response
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

      // Calculate all domain scores
      const domainScores = this.scoringCalculator!.getAllDomainScores(
        this.questionResponses
      );

      // Generate AI recommendations if complete
      let aiRecommendations = "";
      if (isComplete) {
        try {
          aiRecommendations =
            await this.generateAIRecommendations(domainScores);
        } catch (error) {
          console.error("Error generating AI recommendations:", error);
          aiRecommendations =
            "AI recommendations could not be generated at this time.";
        }

        // Update assessment status to COMPLETED
        await prisma.assessment.update({
          where: { id: this.assessmentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }

      // Save response to database
      await this.saveQuestionResponse(questionResponse);

      // Update scores in database
      await this.updateStructuredScores(domainScores);

      // ✅ FIX: Update progress indices after adding new response
      // This ensures accurate progress tracking, especially after going back
      this.updateCurrentProgress();

      const message = this.generateResponseMessage(
        questionResponse.response,
        nextQuestion,
        isComplete,
        aiRecommendations
      );

      return {
        message,
        scores: domainScores.map((ds) => ({
          domain: ds.domain,
          rawScore: ds.score,
          riskLevel: this.scoringCalculator!.mapScoreToRiskLevel(ds),
          confidence: ds.isClinicallySignificant ? 0.9 : 0.7,
        })),
        nextQuestion: nextQuestion?.text,
        questionId: nextQuestion?.id,
        currentDomain: currentDomain,
        isComplete,
        progress: this.calculateProgress(),
        aiRecommendations: isComplete ? aiRecommendations : undefined,
      };
    } catch (error) {
      console.error("Error processing structured response:", error);
      throw new Error("Failed to process assessment response");
    }
  }

  private async generateAIRecommendations(
    domainScores: DomainScore[]
  ): Promise<string> {
    const clinicallySignificantDomains = domainScores.filter(
      (ds) => ds.isClinicallySignificant
    );

    // Fetch domain-specific resources for clinically significant areas
    const domainResources: { [key: string]: any } = {};
    for (const config of this.assessmentConfigs) {
      if (config.resources) {
        domainResources[config.name] = config.resources;
      }
    }

    // Build resources section for AI prompt
    const resourcesSection =
      clinicallySignificantDomains.length > 0
        ? `

Recommended Resources for Clinically Significant Areas:
${clinicallySignificantDomains
  .map((ds) => {
    const domainConfig = this.assessmentConfigs.find(
      (c) => c.name === ds.domain
    );
    if (domainConfig && domainConfig.resources) {
      const resources =
        typeof domainConfig.resources === "string"
          ? JSON.parse(domainConfig.resources)
          : domainConfig.resources;
      if (resources && resources.length > 0) {
        return `
${ds.displayName}:
${resources.map((r: any) => `  - ${r.title || r.name}: ${r.url || r.link || ""}`).join("\n")}`;
      }
    }
    return "";
  })
  .filter((s) => s)
  .join("\n")}`
        : "";

    const prompt = `Based on the following assessment results, provide professional recommendations and citations:

Assessment Results:
${domainScores
  .map(
    (ds) =>
      `${ds.displayName}: ${ds.score}/${
        ds.totalPossible
      } (${ds.percentage.toFixed(1)}%) - ${
        ds.isClinicallySignificant
          ? "Clinically Significant"
          : "Within Normal Range"
      }`
  )
  .join("\n")}

Clinically Significant Areas: ${
      clinicallySignificantDomains.map((ds) => ds.displayName).join(", ") ||
      "None"
    }
${resourcesSection}

Please provide:
1. A brief interpretation of the results
2. Specific recommendations for each clinically significant area
3. Reference the provided resources when applicable (include URLs in your recommendations)
4. General wellness recommendations
5. Professional referral suggestions if appropriate

IMPORTANT: When mentioning resources, include their URLs so parents can access them directly.

Keep the response professional, empathetic, and actionable.`;

    try {
      const response = await getChatCompletion([
        {
          role: "system",
          content:
            "You are a licensed clinical psychologist providing assessment interpretations and recommendations. Always cite the specific resources provided with their URLs when making recommendations.",
        },
        { role: "user", content: prompt },
      ]);

      return response || "Unable to generate recommendations at this time.";
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      return "Assessment complete. Please consult with a mental health professional for interpretation and next steps.";
    }
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

    console.log(`\n🔍 FINDING NEXT QUESTION`);
    console.log(
      `Currently answered: [${Array.from(answeredQuestionIds).join(", ")}]`
    );

    // Go through each domain in order
    for (const domain of this.assessmentConfigs) {
      console.log(`\n📋 Checking domain: ${domain.name}`);

      // Check if we have any responses for this domain
      const domainHasResponses = domain.questions.some((q) =>
        answeredQuestionIds.has(q.id)
      );

      console.log(`Domain has responses: ${domainHasResponses}`);
      // console.log(`Domain has prerequisite: ${!!domain.prerequisite}`);

      // Only check for skipping if we've started this domain
      if (domainHasResponses) {
        // || domain.prerequisite) {
        console.log(`⚖️ Evaluating domain for skipping...`);
        const domainScore = this.scoringCalculator!.calculateDomainScore(
          domain.name,
          this.questionResponses
        );
        if (domainScore.skipped || false) {
          console.log(
            `⏭️ DOMAIN SKIPPED: ${domain.name} - ${
              domainScore.skipReason || "Unknown reason"
            }`
          );
          continue; // Skip this entire domain
        }
      } else {
        console.log(
          `⏸️ Skipping evaluation (domain not started and no prerequisite)`
        );
      }

      // Find the first unanswered question in this domain
      console.log(`🔎 Looking for unanswered questions in ${domain.name}...`);
      for (const question of domain.questions) {
        const isAnswered = answeredQuestionIds.has(question.id);
        console.log(
          `  ${question.id}: ${isAnswered ? "✅ answered" : "❓ unanswered"}`
        );
        if (!isAnswered) {
          console.log(
            `➡️ NEXT QUESTION: ${question.id} in domain ${domain.name}`
          );
          return question; // Return the next unanswered question
        }
      }
      console.log(`✅ All questions in ${domain.name} are completed`);
    }

    // If we get here, all questions are answered
    console.log(`🎉 ALL QUESTIONS COMPLETED!`);
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
    userResponse: boolean,
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
      await prisma.questionResponse.create({
        data: {
          assessmentId: this.assessmentId,
          questionId: questionResponse.questionId,
          response: questionResponse.response,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error saving question response:", error);
    }
  }

  /**
   * ✅ PERFORMANCE: Build and cache domain template mapping during initialization
   * This eliminates repeated database queries on every answer submission
   */
  private async buildDomainTemplateMapping(): Promise<void> {
    if (!this.cachedAssessmentTemplateId) {
      this.cachedDomainTemplateMapping = {};
      return;
    }

    try {
      // Fetch domain templates from assessment template ONCE during init
      const templateWithDomains = await (
        prisma as any
      ).assessmentTemplate.findUnique({
        where: { id: this.cachedAssessmentTemplateId },
        include: {
          domains: {
            include: {
              domainTemplate: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      const mapping: Record<string, string> = {};

      if (templateWithDomains?.domains) {
        templateWithDomains.domains.forEach((domainLink: any) => {
          const templateName = domainLink.domainTemplate.name;
          const templateId = domainLink.domainTemplate.id;
          // Create mapping by name variations for flexibility
          mapping[templateName] = templateId;
          mapping[templateName.toUpperCase()] = templateId;
          mapping[templateName.toLowerCase()] = templateId;
        });
      }

      this.cachedDomainTemplateMapping = mapping;
    } catch (error) {
      console.error("Error building domain template mapping:", error);
      this.cachedDomainTemplateMapping = {};
    }
  }

  private mapDomainToEnum(domainName: string): AssessmentDomain {
    // Map domain names (from templates or hardcoded) to Prisma enum values
    // This is a temporary solution - ideally Score table should store template ID instead of enum
    const normalizedName = domainName.toUpperCase().replace(/[^A-Z]/g, "");

    const domainMapping: Record<string, AssessmentDomain> = {
      // Hardcoded domain names
      SUICIDALITY: AssessmentDomain.EMOTIONAL,
      SELFHARM: AssessmentDomain.VIOLENCE,
      ANTISOCIAL: AssessmentDomain.ANTISOCIAL,

      // Template-based domain names (try to map intelligently)
      ATTENTION: AssessmentDomain.ATTENTION,
      VIOLENCE: AssessmentDomain.VIOLENCE,
      EMOTIONAL: AssessmentDomain.EMOTIONAL,
      CONDUCT: AssessmentDomain.CONDUCT,

      // Common variations
      ANXIETY: AssessmentDomain.EMOTIONAL,
      DEPRESSION: AssessmentDomain.EMOTIONAL,
      MOOD: AssessmentDomain.EMOTIONAL,
      ADHD: AssessmentDomain.ATTENTION,
      FOCUS: AssessmentDomain.ATTENTION,
      HYPERACTIVITY: AssessmentDomain.ATTENTION,
      AGGRESSION: AssessmentDomain.VIOLENCE,
      BEHAVIORAL: AssessmentDomain.CONDUCT,
      OPPOSITIONAL: AssessmentDomain.CONDUCT,
      ODD: AssessmentDomain.CONDUCT,
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
    return AssessmentDomain.ANTISOCIAL;
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

        return {
          assessmentId: this.assessmentId,
          domainTemplateId: domainTemplateId || null,
          domainName: domainScore.domain, // Store the domain name directly
          domain: domainTemplateId
            ? null
            : this.mapDomainToEnum(domainScore.domain), // Only use enum as fallback for legacy
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
    } catch (error) {
      console.error("Error removing last response:", error);
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

  static async createNewAssessment(
    userId: string,
    subjectName: string,
    assessmentTemplateId?: string
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
          currentDomain: AssessmentDomain.ANTISOCIAL, // Use valid enum value
          ...(assessmentTemplateId && { assessmentTemplateId }), // Associate with the template if provided
        } as any, // Type assertion to handle the assessmentTemplateId field
      });

      return { id: assessment.id, shortId };
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw new Error("Failed to create new assessment");
    }
  }
}
