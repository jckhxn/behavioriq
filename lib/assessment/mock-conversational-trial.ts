export interface MockDomainTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  questions: Array<{
    id: string;
    text: string;
    weight?: number;
    required?: boolean;
  }>;
}

export interface MockAssessmentTemplate {
  id: string;
  name: string;
  description: string;
  instructions: string;
  isActive: boolean;
  domains: Array<{
    order: number;
    domainTemplate: MockDomainTemplate;
  }>;
}

/**
 * Provides a baked-in conversational assessment that mirrors the structure
 * of the production trial template. This lets anonymous users try the flow
 * even when the database is missing a configured trial template.
 */
export function getMockConversationalTrial(): MockAssessmentTemplate {
  return {
    id: "mock-conversational-trial",
    name: "Conversational Trial (Sample)",
    description:
      "A conversational preview so families can experience how our AI gathers insights from a child-friendly chat.",
    instructions:
      "Answer each question as if you were the child sharing their experience. There are no right or wrong answers—just be honest.",
    isActive: true,
    domains: [
      {
        order: 1,
        domainTemplate: {
          id: "mock-domain-attention",
          name: "Attention & Focus",
          slug: "attention",
          description:
            "Looks at how consistently the child can focus, follow directions, and stay organized.",
          questions: [
            {
              id: "mock_attention_q1",
              text: "Do you find it hard to stay focused when the instructions are long or detailed?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_attention_q2",
              text: "Do you daydream or zone out during class or structured activities?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_attention_q3",
              text: "Is keeping track of homework, materials, or personal items a struggle for you?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_attention_q4",
              text: "Do you need to be reminded several times before starting chores or assignments?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_attention_q5",
              text: "Do you feel restless when tasks feel repetitive or slow?",
              weight: 1,
              required: true,
            },
          ],
        },
      },
      {
        order: 2,
        domainTemplate: {
          id: "mock-domain-emotional",
          name: "Emotional Regulation",
          slug: "emotional",
          description:
            "Explores how the child manages feelings, transitions, and unexpected changes.",
          questions: [
            {
              id: "mock_emotional_q1",
              text: "When plans change suddenly, do you feel upset or overwhelmed?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_emotional_q2",
              text: "Do you have a hard time calming down after feeling angry or frustrated?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_emotional_q3",
              text: "Do big feelings—like sadness or worry—stick with you for the rest of the day?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_emotional_q4",
              text: "Do you avoid trying new things because they feel too stressful?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_emotional_q5",
              text: "Do people tell you that your reactions are stronger than expected for the situation?",
              weight: 1,
              required: true,
            },
          ],
        },
      },
      {
        order: 3,
        domainTemplate: {
          id: "mock-domain-conduct",
          name: "Conduct & Routines",
          slug: "conduct",
          description:
            "Considers cooperation, rule-following, and how smoothly the child moves through daily routines.",
          questions: [
            {
              id: "mock_conduct_q1",
              text: "Do arguments start when someone asks you to pause something you enjoy?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_conduct_q2",
              text: "Do you get in trouble for interrupting or talking over others?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_conduct_q3",
              text: "Do you push back against rules you think are unfair or unnecessary?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_conduct_q4",
              text: "Do mornings or bedtime feel chaotic or filled with reminders?",
              weight: 1,
              required: true,
            },
            {
              id: "mock_conduct_q5",
              text: "Do disagreements with siblings or classmates happen more than once a week?",
              weight: 1,
              required: true,
            },
          ],
        },
      },
    ],
  };
}
