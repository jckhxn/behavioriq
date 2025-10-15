/**
 * Manual smoke tests for the DynamicScoringCalculator.
 *
 * These tests are intentionally implemented without a test runner so they can be
 * executed ad-hoc via `npx tsx lib/assessment/scoring.test.ts`. The goal is to ensure
 * the scoring logic remains type-safe and easy to reason about as the dynamic assessment
 * engine evolves.
 */

import { AssessmentDomain } from "@prisma/client";
import {
  DynamicScoringCalculator,
  QuestionResponse,
} from "./scoring-dynamic";
import { QuestionSetConfig } from "./types";

const MOCK_CONFIGS: QuestionSetConfig[] = [
  {
    domain: AssessmentDomain.ANTISOCIAL,
    name: "ANTISOCIAL",
    displayName: "Antisocial Behaviors",
    description: "Indicators of conduct-related concerns.",
    order: 1,
    totalPossibleScore: 3,
    clinicallySignificantScore: 2,
    skipConditions: [],
    prerequisites: [],
    questions: [
      {
        id: "antisocial_q1",
        text: "Has the child intentionally harmed animals?",
        order: 1,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: "antisocial_q2",
        text: "Has the child been involved in serious rule violations?",
        order: 2,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: "antisocial_q3",
        text: "Has the child shown aggressive behavior toward peers?",
        order: 3,
        isGatingQuestion: false,
        weight: 1,
      },
    ],
    terminationRules: [],
  },
  {
    domain: AssessmentDomain.VIOLENCE,
    name: "VIOLENCE",
    displayName: "Violence Risk",
    description: "Indicators of targeted or escalating violence.",
    order: 2,
    totalPossibleScore: 3,
    clinicallySignificantScore: 2,
    skipConditions: [
      {
        questionId: "violence_q1",
        skipValue: false,
        skipToQuestion: "violence_q3",
      },
    ],
    prerequisites: [],
    questions: [
      {
        id: "violence_q1",
        text: "Has the child made threats toward others?",
        order: 1,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: "violence_q2",
        text: "Has the child had access to weapons?",
        order: 2,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: "violence_q3",
        text: "Has the child created plans to harm someone?",
        order: 3,
        isGatingQuestion: true,
        weight: 1,
      },
    ],
    terminationRules: [],
  },
];

const calculator = new DynamicScoringCalculator(MOCK_CONFIGS);

const buildResponses = (
  answers: Array<{ id: string; value: boolean }>
): QuestionResponse[] =>
  answers.map(({ id, value }) => ({
    questionId: id,
    response: value,
    timestamp: new Date(),
  }));

console.log("=== TEST 1: Domain scoring ===");
const antisocialResponses = buildResponses([
  { id: "antisocial_q1", value: true },
  { id: "antisocial_q2", value: false },
  { id: "antisocial_q3", value: true },
]);
const antisocialScore = calculator.calculateDomainScore(
  "ANTISOCIAL",
  antisocialResponses
);
console.log({
  domain: antisocialScore.displayName,
  score: antisocialScore.score,
  total: antisocialScore.totalPossible,
  percentage: antisocialScore.percentage.toFixed(1),
  clinicallySignificant: antisocialScore.isClinicallySignificant,
});

console.log("\n=== TEST 2: Skip logic ===");
const violenceResponses = buildResponses([
  { id: "violence_q1", value: false },
]);
const skipResult = calculator.checkEarlyTermination(
  "VIOLENCE",
  violenceResponses
);
console.log(skipResult);

console.log("\n=== TEST 3: Next question sequencing ===");
const nextQuestion = calculator.getNextQuestion(
  0,
  0,
  antisocialResponses.slice(0, 1)
);
console.log(nextQuestion);

console.log("\n=== TEST 4: Progress summary ===");
const mixedResponses = [
  ...antisocialResponses,
  ...buildResponses([
    { id: "violence_q1", value: true },
    { id: "violence_q2", value: true },
  ]),
];
const progress = calculator.calculateProgress(mixedResponses, 1);
console.log(progress);

console.log("\n=== TESTS COMPLETE ===");
