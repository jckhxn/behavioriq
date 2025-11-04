import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

interface StartFullAssessmentInput {
  childAge: number;
  relationshipType: "parent" | "educator" | "other";
  childName: string;
}

/**
 * start_full_assessment tool
 * Creates an authenticated full assessment session
 * Checks user credits and returns either assessment widget or Stripe checkout widget
 */
export async function startFullAssessment(
  input: StartFullAssessmentInput
) {
  try {
    const { childAge, relationshipType, childName } = input;

    // Validate input
    if (!childAge || childAge < 3 || childAge > 18) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid child age. Must be between 3 and 18 years old.",
          },
        ],
        isError: true,
      };
    }

    if (
      !relationshipType ||
      !["parent", "educator", "other"].includes(relationshipType)
    ) {
      return {
        content: [
          {
            type: "text",
            text: "Invalid relationship type. Must be 'parent', 'educator', or 'other'.",
          },
        ],
        isError: true,
      };
    }

    if (!childName || typeof childName !== "string" || childName.length < 1) {
      return {
        content: [
          {
            type: "text",
            text: "Child name is required.",
          },
        ],
        isError: true,
      };
    }

    // Get current user
    const user = await getCurrentUserWithRole();
    if (!user) {
      // User not authenticated - prompt for auth via magic link
      return {
        content: [
          {
            type: "text",
            text: "Authentication required to start a full assessment. Please check your email for a magic link.",
          },
        ],
        structuredContent: {
          requiresAuth: true,
          authMethod: "magic_link",
          nextStep: "Check your email for a login link to continue",
        },
        _meta: {
          "openai/outputTemplate": "ui://widget/auth-prompt.html",
          "openai/widgetAccessible": true,
        },
      };
    }

    // Check if user has sufficient credits
    const userCredits = user.credits || 0;

    if (userCredits < 1) {
      // Insufficient credits - show Stripe checkout
      const sessionId = randomUUID();

      return {
        content: [
          {
            type: "text",
            text: `You need 1 credit to start a full assessment. Current credits: ${userCredits}. Would you like to purchase credits?`,
          },
        ],
        structuredContent: {
          requiresPayment: true,
          currentCredits: userCredits,
          creditsNeeded: 1,
          sessionId,
          pricingOptions: [
            {
              id: "single",
              credits: 1,
              priceInCents: 9700,
              label: "Single Assessment",
            },
            {
              id: "monthly_core",
              credits: 2,
              priceInCents: 5900,
              label: "Monthly Plan (2 credits)",
              billingPeriod: "month",
            },
            {
              id: "monthly_family",
              credits: 5,
              priceInCents: 9900,
              label: "Family Plan (5 credits)",
              billingPeriod: "month",
            },
          ],
        },
        _meta: {
          "openai/outputTemplate": "ui://widget/checkout.html",
          "openai/widgetAccessible": true,
          "openai/widgetState": {
            sessionId,
            userId: user.id,
            creditsNeeded: 1,
          },
        },
      };
    }

    // User has sufficient credits - create assessment session using existing Assessment model
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        subjectName: childName,
        mode: "FULL",
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Deduct credit immediately
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: userCredits - 1,
      },
    });

    // Log credit transaction
    await prisma.creditTransaction.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        amount: -1,
        type: "ASSESSMENT_STARTED",
        reference: assessment.id,
        balanceAfter: userCredits - 1,
      },
    });

    // Generate full assessment questions
    const fullQuestions = generateFullAssessmentQuestions(childAge);

    return {
      content: [
        {
          type: "text",
          text: `Full assessment started for ${childName} (age ${childAge}). This 75-question assessment takes about 20-30 minutes. 1 credit has been deducted from your account.`,
        },
      ],
      structuredContent: {
        assessmentId: assessment.id,
        childName: assessment.childName,
        childAge: assessment.childAge,
        relationshipType: assessment.relationshipType,
        totalQuestions: fullQuestions.length,
        estimatedTime: "20-30 minutes",
        creditsRemaining: userCredits - 1,
        questions: fullQuestions,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/full-assessment.html",
        "openai/widgetAccessible": true,
        "openai/widgetState": {
          assessmentId: assessment.id,
          questions: fullQuestions,
          currentQuestion: 0,
          childName,
          childAge,
        },
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error starting full assessment: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Generate 75 full assessment questions organized by category
 */
function generateFullAssessmentQuestions(childAge: number) {
  const categories = {
    attention: {
      label: "Attention & Focus",
      questions: [
        "Difficulty sustaining attention to tasks or play",
        "Seems not to listen when spoken to directly",
        "Loses things necessary for tasks or activities",
        "Easily distracted by extraneous stimuli",
        "Forgetful in daily activities",
        "Difficulty organizing tasks and activities",
        "Avoids, dislikes, or reluctant about tasks requiring sustained attention",
        "Unable to sit still during tasks",
        "Leaves seat in classroom or situations where remaining seated is required",
        "Runs about or climbs excessively",
      ],
    },
    behavior: {
      label: "Behavior & Impulse Control",
      questions: [
        "Difficulty playing quietly",
        "Often talks excessively",
        "Blurts out answers before questions have been completed",
        "Difficulty awaiting turn",
        "Interrupts or intrudes on others",
        "Loses temper",
        "Argues with adults",
        "Actively defies or refuses requests",
        "Deliberately annoys people",
        "Blames others for mistakes",
        "Touchy or easily annoyed",
        "Angry and resentful",
        "Spiteful or vindictive",
        "Bullies or is mean to others",
        "Often initiates physical fights",
      ],
    },
    social: {
      label: "Social & Peer Relations",
      questions: [
        "Difficulty making friends",
        "Avoids other children or adults",
        "Engages in little back-and-forth interaction",
        "Shows reduced emotional reciprocity",
        "Unusual body language or facial expressions",
        "Difficulty understanding social cues",
        "Difficulty with turn-taking in conversation",
        "Avoids eye contact",
        "Seems aloof or withdrawn",
        "Doesn't seek comfort when distressed",
        "Shows little interest in sharing things",
        "Difficulty cooperating with peers",
        "Withdrawn or keeps to self",
        "Socially awkward",
        "Prefers solitary activities",
      ],
    },
    emotion: {
      label: "Emotional & Mood",
      questions: [
        "Appears anxious or worried",
        "Seems sad or down",
        "Shows emotional outbursts",
        "Difficulty calming down when upset",
        "Expresses hopelessness",
        "Shows fear or anxiety in separation situations",
        "Excessive worry about health",
        "Excessive worry about performance",
        "Shows panic or extreme fear responses",
        "Appears irritable or grumpy",
        "Mood seems to fluctuate frequently",
        "Shows signs of frustration easily",
        "Difficulty accepting mistakes",
        "Overly sensitive to criticism",
        "Shows excessive guilt or shame",
      ],
    },
    academic: {
      label: "Academic & Learning",
      questions: [
        "Difficulty with reading skills",
        "Difficulty with math skills",
        "Difficulty with writing skills",
        "Difficulty with spelling",
        "Difficulty with handwriting",
        "Slow processing speed",
        "Difficulty following multi-step directions",
        "Difficulty with memory",
        "Difficulty with planning",
        "Difficulty with problem-solving",
        "Performance below grade level",
        "Requires extra time for tests",
        "Avoids academic tasks",
        "Gives up easily on difficult tasks",
        "Lacks motivation",
      ],
    },
  };

  const questions: any[] = [];
  let id = 1;

  for (const [categoryKey, categoryData] of Object.entries(categories)) {
    for (const question of categoryData.questions) {
      questions.push({
        id: `q_${id}`,
        text: question,
        category: categoryKey,
        categoryLabel: categoryData.label,
        options: [
          "Never",
          "Rarely",
          "Sometimes",
          "Often",
          "Very often",
        ],
      });
      id++;
    }
  }

  return questions;
}
