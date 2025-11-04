import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * ChatGPT API Endpoint Tests
 *
 * Tests cover:
 * - Trial assessment flow (public endpoints)
 * - Full assessment flow (authenticated endpoints)
 * - Credit checking and checkout
 * - Results retrieval
 * - Error handling (validation, auth, insufficient credits)
 */

describe("ChatGPT API Endpoints", () => {
  let testUserId: string;
  let testApiKey: string;

  beforeAll(async () => {
    // Create test user
    testUserId = uuidv4();
    testApiKey = `sk_test_${uuidv4()}`;

    // Create API key in database
    await prisma.magicLinkToken.create({
      data: {
        email: "test@chatgpt.local",
        token: testApiKey,
        userId: testUserId,
        expiresAt: new Date("2099-12-31"),
      },
    });

    // Create test user with credits
    await prisma.user.create({
      data: {
        id: testUserId,
        email: "test@chatgpt.local",
        name: "Test User",
        role: "USER",
        credits: 5,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.creditTransaction.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.magicLinkToken.deleteMany({
      where: { email: "test@chatgpt.local" },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
  });

  describe("Trial Assessment Endpoints", () => {
    describe("POST /api/trial/start", () => {
      it("should start a trial assessment with valid parameters", async () => {
        const response = await fetch("http://localhost:3000/api/trial/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childAge: 8,
            relationshipType: "parent",
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.sessionId).toMatch(/^trial_/);
        expect(data.totalQuestions).toBe(15);
        expect(data.questions).toHaveLength(15);
        expect(data.questions[0]).toHaveProperty("questionId");
        expect(data.questions[0]).toHaveProperty("text");
        expect(data.questions[0]).toHaveProperty("domain");
      });

      it("should reject invalid child age", async () => {
        const response = await fetch("http://localhost:3000/api/trial/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childAge: 25, // Too old
            relationshipType: "parent",
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.code).toBe("VALIDATION_ERROR");
      });

      it("should reject invalid relationship type", async () => {
        const response = await fetch("http://localhost:3000/api/trial/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childAge: 8,
            relationshipType: "invalid",
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.code).toBe("VALIDATION_ERROR");
      });

      it("should reject missing required fields", async () => {
        const response = await fetch("http://localhost:3000/api/trial/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childAge: 8 }), // Missing relationshipType
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.code).toBe("VALIDATION_ERROR");
      });
    });

    describe("POST /api/trial/submit", () => {
      it("should submit trial answers and return domain scores", async () => {
        // Start trial
        const startResponse = await fetch(
          "http://localhost:3000/api/trial/start",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );
        const startData = await startResponse.json();
        const sessionId = startData.sessionId;

        // Submit answers
        const submitResponse = await fetch(
          "http://localhost:3000/api/trial/submit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              answers: [
                { questionId: "trial_attention_1", answer: "yes" },
                { questionId: "trial_attention_2", answer: "no" },
                { questionId: "trial_attention_3", answer: "yes" },
                { questionId: "trial_emotional_1", answer: "no" },
                { questionId: "trial_emotional_2", answer: "yes" },
                { questionId: "trial_emotional_3", answer: "no" },
                { questionId: "trial_social_1", answer: "yes" },
                { questionId: "trial_social_2", answer: "no" },
                { questionId: "trial_social_3", answer: "yes" },
                { questionId: "trial_behavioral_1", answer: "no" },
                { questionId: "trial_behavioral_2", answer: "yes" },
                { questionId: "trial_behavioral_3", answer: "no" },
                { questionId: "trial_learning_1", answer: "yes" },
                { questionId: "trial_learning_2", answer: "no" },
                { questionId: "trial_learning_3", answer: "yes" },
              ],
            }),
          }
        );

        expect(submitResponse.status).toBe(200);
        const data = await submitResponse.json();
        expect(data.sessionId).toBe(sessionId);
        expect(data.domainScores).toHaveLength(5);
        expect(data.domainScores[0]).toHaveProperty("domain");
        expect(data.domainScores[0]).toHaveProperty("score");
        expect(data.domainScores[0]).toHaveProperty("percentile");
        expect(data.domainScores[0]).toHaveProperty("severity");
        expect(data.summary).toBeTruthy();
        expect(Array.isArray(data.recommendations)).toBe(true);
      });

      it("should reject invalid number of answers", async () => {
        const startResponse = await fetch(
          "http://localhost:3000/api/trial/start",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );
        const startData = await startResponse.json();

        const submitResponse = await fetch(
          "http://localhost:3000/api/trial/submit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: startData.sessionId,
              answers: [
                { questionId: "trial_attention_1", answer: "yes" },
                { questionId: "trial_attention_2", answer: "no" },
                // Only 2 answers instead of 15
              ],
            }),
          }
        );

        expect(submitResponse.status).toBe(400);
        const data = await submitResponse.json();
        expect(data.code).toBe("VALIDATION_ERROR");
      });
    });
  });

  describe("User Endpoints", () => {
    describe("GET /api/user/credits", () => {
      it("should return user credits with valid API key", async () => {
        const response = await fetch(
          `http://localhost:3000/api/user/credits?user_id=${testUserId}`,
          {
            headers: { "X-API-Key": testApiKey },
          }
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.userId).toBe(testUserId);
        expect(typeof data.credits).toBe("number");
        expect(data.credits).toBeGreaterThanOrEqual(0);
        expect(typeof data.creditsUsed).toBe("number");
      });

      it("should reject request without API key", async () => {
        const response = await fetch(
          `http://localhost:3000/api/user/credits?user_id=${testUserId}`,
          {}
        );

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.code).toBe("INVALID_API_KEY");
      });

      it("should reject request with invalid API key", async () => {
        const response = await fetch(
          `http://localhost:3000/api/user/credits?user_id=${testUserId}`,
          {
            headers: { "X-API-Key": "sk_test_invalid" },
          }
        );

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.code).toBe("INVALID_API_KEY");
      });
    });
  });

  describe("Assessment Endpoints", () => {
    describe("POST /api/assessment/start", () => {
      it("should start full assessment with valid API key and sufficient credits", async () => {
        const response = await fetch(
          "http://localhost:3000/api/assessment/start",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": testApiKey,
            },
            body: JSON.stringify({
              userId: testUserId,
              childName: "Emma",
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.assessmentId).toMatch(/^assess_/);
        expect(data.totalQuestions).toBe(75);
        expect(data.questions).toHaveLength(75);
        expect(data.creditsRemaining).toBe(4); // 5 - 1
      });

      it("should return 402 when user has insufficient credits", async () => {
        // Create user with no credits
        const noCreditUserId = uuidv4();
        const noCreditApiKey = `sk_test_${uuidv4()}`;

        await prisma.magicLinkToken.create({
          data: {
            email: "nocredit@chatgpt.local",
            token: noCreditApiKey,
            userId: noCreditUserId,
            expiresAt: new Date("2099-12-31"),
          },
        });

        await prisma.user.create({
          data: {
            id: noCreditUserId,
            email: "nocredit@chatgpt.local",
            name: "No Credit User",
            role: "USER",
            credits: 0,
          },
        });

        const response = await fetch(
          "http://localhost:3000/api/assessment/start",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": noCreditApiKey,
            },
            body: JSON.stringify({
              userId: noCreditUserId,
              childName: "Test",
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );

        expect(response.status).toBe(402);
        const data = await response.json();
        expect(data.error).toBe("insufficient_credits");
        expect(data.creditsRequired).toBe(1);
        expect(data.creditsAvailable).toBe(0);
        expect(data.checkoutUrl).toBeTruthy();

        // Cleanup
        await prisma.magicLinkToken.deleteMany({
          where: { email: "nocredit@chatgpt.local" },
        });
        await prisma.user.deleteMany({
          where: { id: noCreditUserId },
        });
      });

      it("should reject request without API key", async () => {
        const response = await fetch(
          "http://localhost:3000/api/assessment/start",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: testUserId,
              childName: "Emma",
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );

        expect(response.status).toBe(401);
      });
    });

    describe("POST /api/assessment/submit", () => {
      it("should submit assessment answers and return completion status", async () => {
        // Start assessment
        const startResponse = await fetch(
          "http://localhost:3000/api/assessment/start",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": testApiKey,
            },
            body: JSON.stringify({
              userId: testUserId,
              childName: "Emma",
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );
        const startData = await startResponse.json();
        const assessmentId = startData.assessmentId;

        // Submit answers (create 75 valid answers)
        const answers = startData.questions.map(
          (q: { questionId: string }) => ({
            questionId: q.questionId,
            answer: "sometimes",
          })
        );

        const submitResponse = await fetch(
          "http://localhost:3000/api/assessment/submit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": testApiKey,
            },
            body: JSON.stringify({
              assessmentId,
              answers,
            }),
          }
        );

        expect(submitResponse.status).toBe(200);
        const data = await submitResponse.json();
        expect(data.assessmentId).toBe(assessmentId);
        expect(data.status).toBe("completed");
      });
    });

    describe("GET /api/assessment/[assessmentId]/results", () => {
      it("should return assessment results for completed assessment", async () => {
        // Start and submit assessment
        const startResponse = await fetch(
          "http://localhost:3000/api/assessment/start",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": testApiKey,
            },
            body: JSON.stringify({
              userId: testUserId,
              childName: "Emma",
              childAge: 8,
              relationshipType: "parent",
            }),
          }
        );
        const startData = await startResponse.json();
        const assessmentId = startData.assessmentId;

        const answers = startData.questions.map(
          (q: { questionId: string }) => ({
            questionId: q.questionId,
            answer: "sometimes",
          })
        );

        await fetch("http://localhost:3000/api/assessment/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": testApiKey,
          },
          body: JSON.stringify({ assessmentId, answers }),
        });

        // Get results
        const resultsResponse = await fetch(
          `http://localhost:3000/api/assessment/${assessmentId}/results`,
          { method: "GET" }
        );

        expect(resultsResponse.status).toBe(200);
        const data = await resultsResponse.json();
        expect(data.assessmentId).toBe(assessmentId);
        expect(data.childName).toBe("Emma");
        expect(data.childAge).toBe(8);
        expect(data.domainScores).toHaveLength(5);
        expect(data.overall).toHaveProperty("score");
        expect(data.overall).toHaveProperty("percentile");
        expect(data.overall).toHaveProperty("severity");
        expect(Array.isArray(data.recommendations)).toBe(true);
        expect(Array.isArray(data.nextSteps)).toBe(true);
      });

      it("should return 404 for non-existent assessment", async () => {
        const response = await fetch(
          "http://localhost:3000/api/assessment/nonexistent/results"
        );

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.code).toBe("ASSESSMENT_NOT_FOUND");
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for invalid JSON", async () => {
      const response = await fetch("http://localhost:3000/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe("INVALID_REQUEST");
      expect(data.requestId).toBeTruthy();
    });

    it("should include requestId in all responses", async () => {
      const response = await fetch("http://localhost:3000/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childAge: 8,
          relationshipType: "parent",
        }),
      });

      const data = await response.json();
      expect(data).toHaveProperty("sessionId");
      const requestId = response.headers.get("X-Request-Id");
      expect(requestId).toBeTruthy();
    });
  });
});
