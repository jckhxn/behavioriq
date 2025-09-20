import { prisma } from "@/lib/db/prisma";
import { getChatCompletion } from "./openai";
import { AssessmentDomain, RiskLevel, MessageRole } from "@prisma/client";
import {
  loadAssessmentConfigs,
  QuestionSetConfig,
} from "@/lib/assessment/db-loader";
import {
  ScoringCalculator,
  type QuestionResponse,
  type DomainScore,
} from "../assessment/scoring";

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
      // Load assessment configurations dynamically
      this.assessmentConfigs = await loadAssessmentConfigs();

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
        aiRecommendations = await this.generateAIRecommendations(domainScores);
      }

      // Save response to database
      await this.saveQuestionResponse(questionResponse);

      // Update scores in database
      await this.updateStructuredScores(domainScores);

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

Please provide:
1. A brief interpretation of the results
2. Specific recommendations for each clinically significant area
3. General wellness recommendations
4. Professional referral suggestions if appropriate

Keep the response professional, empathetic, and actionable.`;

    try {
      const response = await getChatCompletion([
        {
          role: "system",
          content:
            "You are a licensed clinical psychologist providing assessment interpretations and recommendations.",
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

  private mapDomainToEnum(domainName: string): AssessmentDomain {
    // Map our custom domain names to existing Prisma enum values
    const domainMapping: Record<string, AssessmentDomain> = {
      SUICIDALITY: AssessmentDomain.EMOTIONAL,
      SELF_HARM: AssessmentDomain.VIOLENCE,
      ANTISOCIAL: AssessmentDomain.ANTISOCIAL,
    };

    return domainMapping[domainName] || AssessmentDomain.ANTISOCIAL;
  }

  private async updateStructuredScores(
    domainScores: DomainScore[]
  ): Promise<void> {
    try {
      const scoreUpdates = domainScores.map((domainScore) => ({
        assessmentId: this.assessmentId,
        domain: this.mapDomainToEnum(domainScore.domain),
        rawScore: domainScore.score,
        totalPossible: domainScore.totalPossible,
        questionsAnswered: domainScore.questionsAnswered,
        riskLevel: this.scoringCalculator!.mapScoreToRiskLevel(domainScore),
        confidence: domainScore.isClinicallySignificant ? 0.9 : 0.7,
        timestamp: new Date(),
      }));

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

  static async createNewAssessment(
    userId: string,
    subjectName: string
  ): Promise<string> {
    try {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          subjectName,
          status: "IN_PROGRESS",
          currentDomain: AssessmentDomain.ANTISOCIAL, // Use valid enum value
        },
      });

      return assessment.id;
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw new Error("Failed to create new assessment");
    }
  }
}
