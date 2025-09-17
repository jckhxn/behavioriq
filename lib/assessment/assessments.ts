export interface AssessmentQuestion {
  id: string;
  text: string;
  isGatekeeper?: boolean;
  skipCondition?: {
    questionId: string;
    skipValue: boolean;
    skipToQuestion?: string;
  };
}

export interface AssessmentDomainConfig {
  name: string;
  displayName: string;
  totalPossibleScore: number;
  clinicallySignificantScore: number;
  questions: AssessmentQuestion[];
  prerequisite?: {
    questionId: string;
    requiredValue: boolean;
  };
  multiPartLogic?: {
    part1Questions: string[];
    part1Threshold: number;
    part2Questions: string[];
    part2Threshold: number;
  };
}

export const EARLY_DETECTION_SCREENER: AssessmentDomainConfig[] = [
  {
    name: "SUICIDALITY",
    displayName: "Suicidality",
    totalPossibleScore: 7,
    clinicallySignificantScore: 3,
    questions: [
      {
        id: "suic_a",
        text: "Have you ever wanted to be dead or wished you just weren't here anymore?",
      },
      {
        id: "suic_b",
        text: "Have you ever had any thoughts about ending your life?",
        isGatekeeper: true,
      },
      {
        id: "suic_c",
        text: "Have you been thinking about how you might end your life?",
        skipCondition: {
          questionId: "suic_b",
          skipValue: false,
          skipToQuestion: "suic_g",
        },
      },
      {
        id: "suic_d",
        text: "Have you had these thoughts and had some intention of acting on them?",
      },
      {
        id: "suic_e",
        text: "Have you considered a plan or the details for ending your life?",
      },
      {
        id: "suic_f",
        text: "Do you intend to carry out this plan?",
      },
      {
        id: "suic_g",
        text: "Have you done, started to do, or prepared to do something to end your life?",
      },
    ],
  },
  {
    name: "SELF_HARM",
    displayName: "Self Harm",
    totalPossibleScore: 7,
    clinicallySignificantScore: 3,
    questions: [
      {
        id: "harm_a",
        text: "Have you ever wanted to do anything to hurt, but not kill, yourself?",
      },
      {
        id: "harm_b",
        text: "Have you ever had any thoughts about hurting, but not killing, yourself?",
        isGatekeeper: true,
      },
      {
        id: "harm_c",
        text: "Have you been thinking about how you might hurt, but not kill, yourself?",
        skipCondition: {
          questionId: "harm_b",
          skipValue: false,
          skipToQuestion: "harm_g",
        },
      },
      {
        id: "harm_d",
        text: "Have you had these thoughts and some intention of acting on them?",
      },
      {
        id: "harm_e",
        text: "Have you considered or do you have a plan to hurt, but not kill, yourself?",
      },
      {
        id: "harm_f",
        text: "Do you intend to carry out this plan?",
      },
      {
        id: "harm_g",
        text: "Have you done, started to do, or prepared to do something to hurt but not kill yourself?",
      },
    ],
  },
  {
    name: "ANTISOCIAL",
    displayName: "Anti-Social Personality Screen",
    totalPossibleScore: 12,
    clinicallySignificantScore: 5,
    prerequisite: {
      questionId: "aspd_age",
      requiredValue: true,
    },
    multiPartLogic: {
      part1Questions: [
        "aspd_1a",
        "aspd_1b",
        "aspd_1c",
        "aspd_1d",
        "aspd_1e",
        "aspd_1f",
      ],
      part1Threshold: 2,
      part2Questions: [
        "aspd_2a",
        "aspd_2b",
        "aspd_2c",
        "aspd_2d",
        "aspd_2e",
        "aspd_2f",
      ],
      part2Threshold: 3,
    },
    questions: [
      {
        id: "aspd_age",
        text: "Are you 15 years old or older?",
        isGatekeeper: true,
      },
      {
        id: "aspd_1a",
        text: "Before you were 15 years old, did you repeatedly skip school or run away from home overnight?",
      },
      {
        id: "aspd_1b",
        text: 'Before you were 15 years old, did you repeatedly lie, cheat, "con" others, or steal?',
      },
      {
        id: "aspd_1c",
        text: "Before you were 15 years old, did you start fights or bully, threaten, or intimidate others?",
      },
      {
        id: "aspd_1d",
        text: "Before you were 15 years old, did you deliberately destroy things or start fires?",
      },
      {
        id: "aspd_1e",
        text: "Before you were 15 years old, did you deliberately hurt animals or people?",
      },
      {
        id: "aspd_1f",
        text: "Before you were 15 years old, did you force someone to have sex with you?",
      },
      {
        id: "aspd_2a",
        text: "Since you were 15 years old, have you repeatedly behaved in a way that others would consider irresponsible, like failing to pay for things you owed, deliberately being impulsive or deliberately not working to support yourself?",
      },
      {
        id: "aspd_2b",
        text: "Since you were 15 years old, have you done things that are illegal (for example, destroying property, shoplifting, stealing, selling drugs, or committing a felony)?",
      },
      {
        id: "aspd_2c",
        text: "Since you were 15 years old, have you been in physical fights repeatedly (including physical fights with friends or family)?",
      },
      {
        id: "aspd_2d",
        text: "Since you were 15 years old, have you often lied or tricked other people to get money or pleasure, or lied just for fun?",
      },
      {
        id: "aspd_2e",
        text: "Since you were 15 years old, have you exposed others to danger without caring?",
      },
      {
        id: "aspd_2f",
        text: "Since you were 15 years old, have you felt no guilt after hurting, mistreating, lying to, or stealing from others, or after damaging property?",
      },
    ],
  },
];
