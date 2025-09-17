/**
 * Test file for binary scoring calculator
 */

import { AssessmentDomain, RiskLevel } from '@prisma/client'
import { BinaryScoringCalculator, QuestionResponse } from './scoring'

// Create test instance
const calculator = new BinaryScoringCalculator()

// Mock question responses for testing
const createTestResponse = (
  questionId: string,
  response: boolean,
  domain: AssessmentDomain
): QuestionResponse => ({
  questionId,
  response,
  domain,
  timestamp: new Date()
})

// Test 1: Basic domain scoring
console.log('=== Test 1: Basic Domain Scoring ===')
const antisocialResponses: QuestionResponse[] = [
  createTestResponse('antisocial_1', true, AssessmentDomain.ANTISOCIAL),
  createTestResponse('antisocial_2', false, AssessmentDomain.ANTISOCIAL),
  createTestResponse('antisocial_3', true, AssessmentDomain.ANTISOCIAL),
]

const antisocialScore = calculator.calculateDomainScore(AssessmentDomain.ANTISOCIAL, antisocialResponses)
console.log('Antisocial Score:', {
  rawScore: antisocialScore.rawScore,
  totalPossible: antisocialScore.totalPossible,
  percentage: antisocialScore.percentage,
  riskLevel: antisocialScore.riskLevel,
  questionsAnswered: antisocialScore.questionsAnswered,
  wasTerminatedEarly: antisocialScore.wasTerminatedEarly
})

// Test 2: Early termination logic
console.log('\n=== Test 2: Early Termination Logic ===')
const terminationTest: QuestionResponse[] = [
  createTestResponse('antisocial_1', false, AssessmentDomain.ANTISOCIAL),
  createTestResponse('antisocial_2', false, AssessmentDomain.ANTISOCIAL),
]

const terminationCheck = calculator.checkEarlyTermination(AssessmentDomain.ANTISOCIAL, terminationTest)
console.log('Termination Check:', terminationCheck)

// Test 3: Next question logic
console.log('\n=== Test 3: Next Question Logic ===')
const nextQuestion = calculator.getNextQuestion(AssessmentDomain.ANTISOCIAL, antisocialResponses)
console.log('Next Question:', nextQuestion)

// Test 4: Domain progression
console.log('\n=== Test 4: Domain Progression ===')
const completedDomains = new Set([AssessmentDomain.ANTISOCIAL, AssessmentDomain.VIOLENCE])
const nextDomain = calculator.getNextDomain(completedDomains)
console.log('Next Domain:', nextDomain)

// Test 5: Overall progress
console.log('\n=== Test 5: Overall Progress ===')
const mixedResponses: QuestionResponse[] = [
  // Antisocial (terminated early)
  createTestResponse('antisocial_1', false, AssessmentDomain.ANTISOCIAL),
  createTestResponse('antisocial_2', false, AssessmentDomain.ANTISOCIAL),
  // Violence (some responses)
  createTestResponse('violence_1', true, AssessmentDomain.VIOLENCE),
  createTestResponse('violence_2', true, AssessmentDomain.VIOLENCE),
  createTestResponse('violence_3', false, AssessmentDomain.VIOLENCE),
]

const progress = calculator.getProgressSummary(mixedResponses)
console.log('Progress Summary:', progress)

const isComplete = calculator.isAssessmentComplete(mixedResponses)
console.log('Is Complete:', isComplete)

// Test 6: Overall scores
console.log('\n=== Test 6: Overall Scores ===')
const overallScores = calculator.calculateOverallScores(mixedResponses)
console.log('Overall Scores:')
overallScores.forEach(score => {
  console.log(`${score.domain}: ${score.rawScore}/${score.totalPossible} (${score.percentage}%) - ${score.riskLevel}`)
})

console.log('\n=== All Tests Completed ===')