import { z } from "zod";

/**
 * Trial Assessment Request/Response Schemas
 */

export const TrialStartRequestSchema = z.object({
  childAge: z
    .number()
    .int()
    .min(3, "Child age must be at least 3")
    .max(18, "Child age must not exceed 18"),
  relationshipType: z.enum(["parent", "educator", "other"]),
});

export type TrialStartRequest = z.infer<typeof TrialStartRequestSchema>;

export const AssessmentQuestionSchema = z.object({
  questionId: z.string(),
  text: z.string(),
  domain: z.enum(["attention", "emotional", "social", "behavioral", "learning"]),
});

export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const TrialStartResponseSchema = z.object({
  sessionId: z.string(),
  questions: z.array(AssessmentQuestionSchema),
  totalQuestions: z.number(),
});

export type TrialStartResponse = z.infer<typeof TrialStartResponseSchema>;

export const TrialAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.enum(["yes", "no"]),
});

export type TrialAnswer = z.infer<typeof TrialAnswerSchema>;

export const TrialSubmitRequestSchema = z.object({
  sessionId: z.string(),
  answers: z
    .array(TrialAnswerSchema)
    .min(15, "Must have exactly 15 answers")
    .max(15, "Must have exactly 15 answers"),
});

export type TrialSubmitRequest = z.infer<typeof TrialSubmitRequestSchema>;

export const DomainScoreSchema = z.object({
  domain: z.enum(["attention", "emotional", "social", "behavioral", "learning"]),
  score: z.number().int().min(0).max(15),
  percentile: z.number().min(0).max(100),
  severity: z.enum(["normal", "mild", "moderate", "severe"]),
});

export type DomainScore = z.infer<typeof DomainScoreSchema>;

export const TrialSubmitResponseSchema = z.object({
  sessionId: z.string(),
  domainScores: z.array(DomainScoreSchema),
  summary: z.string(),
  recommendations: z.array(z.string()),
});

export type TrialSubmitResponse = z.infer<typeof TrialSubmitResponseSchema>;

/**
 * User & Billing Schemas
 */

export const CreditsResponseSchema = z.object({
  userId: z.string(),
  credits: z.number().int().nonnegative(),
  creditsUsed: z.number().int().nonnegative(),
});

export type CreditsResponse = z.infer<typeof CreditsResponseSchema>;

export const CheckoutResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
  planType: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

/**
 * Full Assessment Request/Response Schemas
 */

export const FullAssessmentAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.enum(["never", "rarely", "sometimes", "often", "very_often"]),
});

export type FullAssessmentAnswer = z.infer<typeof FullAssessmentAnswerSchema>;

export const AssessmentStartRequestSchema = z.object({
  userId: z.string(),
  childName: z.string().min(1, "Child name is required"),
  childAge: z
    .number()
    .int()
    .min(3, "Child age must be at least 3")
    .max(18, "Child age must not exceed 18"),
  relationshipType: z.enum(["parent", "educator", "other"]),
});

export type AssessmentStartRequest = z.infer<typeof AssessmentStartRequestSchema>;

export const AssessmentStartResponseSchema = z.object({
  assessmentId: z.string(),
  questions: z.array(AssessmentQuestionSchema),
  totalQuestions: z.number(),
  creditsRemaining: z.number().int().nonnegative(),
});

export type AssessmentStartResponse = z.infer<
  typeof AssessmentStartResponseSchema
>;

export const AssessmentSubmitRequestSchema = z.object({
  assessmentId: z.string(),
  answers: z
    .array(FullAssessmentAnswerSchema)
    .min(75, "Must have exactly 75 answers")
    .max(75, "Must have exactly 75 answers"),
});

export type AssessmentSubmitRequest = z.infer<typeof AssessmentSubmitRequestSchema>;

export const AssessmentSubmitResponseSchema = z.object({
  assessmentId: z.string(),
  status: z.enum(["completed", "submitted"]),
  message: z.string(),
});

export type AssessmentSubmitResponse = z.infer<
  typeof AssessmentSubmitResponseSchema
>;

/**
 * Results Schema
 */

export const RecommendationSchema = z.object({
  domain: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

export const AssessmentResultsResponseSchema = z.object({
  assessmentId: z.string(),
  childName: z.string(),
  childAge: z.number().int(),
  completedAt: z.string().datetime(),
  domainScores: z.array(DomainScoreSchema),
  overall: z.object({
    score: z.number().int().min(0).max(75),
    percentile: z.number().min(0).max(100),
    severity: z.enum(["normal", "mild", "moderate", "severe"]),
  }),
  recommendations: z.array(RecommendationSchema),
  nextSteps: z.array(z.string()),
});

export type AssessmentResultsResponse = z.infer<
  typeof AssessmentResultsResponseSchema
>;

/**
 * Error Response Schema
 */

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  requestId: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Insufficient Credits Response (HTTP 402)
 */

export const InsufficientCreditsResponseSchema = z.object({
  error: z.literal("insufficient_credits"),
  message: z.string(),
  creditsRequired: z.number().int().positive(),
  creditsAvailable: z.number().int().nonnegative(),
  checkoutUrl: z.string().url(),
});

export type InsufficientCreditsResponse = z.infer<
  typeof InsufficientCreditsResponseSchema
>;
