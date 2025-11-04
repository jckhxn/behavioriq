import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";

interface StartTrialInput {
  childAge: number;
  relationshipType: "parent" | "educator" | "other";
}

/**
 * start_trial tool
 * Creates an anonymous trial assessment session
 * Returns a widget for the 15-question trial assessment
 */
export async function startTrial(input: StartTrialInput) {
  try {
    const { childAge, relationshipType } = input;

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

    // Create trial session in database
    const sessionId = randomUUID();
    const trialSession = await prisma.trialSession.create({
      data: {
        id: sessionId,
        childAge,
        relationshipType,
        status: "started",
        questions: [], // Will be populated as user progresses
        answers: [],
        startedAt: new Date(),
      },
    });

    // Generate trial questions (simplified - in production, fetch from template)
    const trialQuestions = generateTrialQuestions(childAge);

    return {
      content: [
        {
          type: "text",
          text: `Trial assessment started for ${childAge}-year-old. This 15-question assessment takes about 5-10 minutes. Your responses are anonymous.`,
        },
      ],
      structuredContent: {
        sessionId: trialSession.id,
        childAge: trialSession.childAge,
        relationshipType: trialSession.relationshipType,
        totalQuestions: trialQuestions.length,
        estimatedTime: "5-10 minutes",
        questions: trialQuestions,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/trial-assessment.html",
        "openai/widgetAccessible": true,
        "openai/widgetState": {
          sessionId: trialSession.id,
          questions: trialQuestions,
          currentQuestion: 0,
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
          text: `Error starting trial assessment: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Generate 15 trial assessment questions
 * These are simplified versions of the full assessment
 */
function generateTrialQuestions(childAge: number) {
  const questions = [
    {
      id: "trial_1",
      text: "How often does the child struggle to pay attention in school or during activities?",
      category: "attention",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_2",
      text: "How frequently does the child have difficulty controlling their behavior?",
      category: "behavior",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_3",
      text: "How often does the child show anxiety or worry?",
      category: "emotion",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_4",
      text: "How frequently does the child get frustrated easily?",
      category: "emotion",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_5",
      text: "How often does the child struggle with social interactions?",
      category: "social",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_6",
      text: "How frequently does the child have difficulty following instructions?",
      category: "behavior",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_7",
      text: "How often does the child appear hyperactive or restless?",
      category: "attention",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_8",
      text: "How frequently does the child have mood swings or emotional changes?",
      category: "emotion",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_9",
      text: "How often does the child show signs of sadness or low mood?",
      category: "emotion",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_10",
      text: "How frequently does the child struggle with transitions or changes in routine?",
      category: "behavior",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_11",
      text: "How often does the child show aggressive behavior or anger?",
      category: "behavior",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_12",
      text: "How frequently does the child engage in repetitive behaviors or interests?",
      category: "social",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_13",
      text: "How often does the child struggle with impulse control?",
      category: "behavior",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_14",
      text: "How frequently does the child show signs of learning difficulties?",
      category: "attention",
      options: [
        "Never",
        "Rarely",
        "Sometimes",
        "Often",
        "Very often",
      ],
    },
    {
      id: "trial_15",
      text: "Overall, how much do you have concerns about the child's development or behavior?",
      category: "overall",
      options: [
        "No concerns",
        "Minor concerns",
        "Moderate concerns",
        "Significant concerns",
        "Severe concerns",
      ],
    },
  ];

  return questions;
}
