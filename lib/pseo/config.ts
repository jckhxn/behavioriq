import { PSEOConfig } from "./types";

export const pseoConfig: PSEOConfig = {
  routes: [
    {
      id: "assessment-categories",
      template: "assessment-category",
      path: "/assessments/[category]",
      dataKey: "assessmentTemplates",
      enabled: true,
      priority: 0.8,
      changefreq: "weekly",
      seo: {
        titleTemplate: "{{name}} Assessment - AI Diagnostic Tool",
        descriptionTemplate:
          "Take our comprehensive {{name}} assessment to identify strengths and areas for improvement. Get personalized AI-powered recommendations and insights.",
        keywordsTemplate:
          "{{name}} assessment, {{name}} evaluation, AI diagnostic, educational assessment, {{name}} skills",
        openGraph: {
          titleTemplate: "{{name}} Assessment - Free AI Diagnostic",
          descriptionTemplate:
            "Discover your {{name}} strengths and get personalized improvement recommendations with our AI-powered assessment tool.",
          type: "website",
          siteName: "AI Diagnostic",
          imageTemplate: "/api/og/assessment/{{id}}",
        },
        structuredData: {
          type: "Assessment",
          properties: {
            name: "{{name}} Assessment",
            description: "{{description}}",
            educationalLevel: "{{grade}}",
            assesses: "{{name}}",
            provider: {
              "@type": "Organization",
              name: "AI Diagnostic",
              url: "https://ai-diagnostic.com",
            } as {
              "@type": string;
              name: string;
              url: string;
            },
          },
        },
      },
    },
    {
      id: "subject-assessments",
      template: "subject-assessment",
      path: "/assessments/[category]/[subject]",
      dataKey: "subjects",
      enabled: true,
      priority: 0.7,
      changefreq: "weekly",
      seo: {
        titleTemplate: "{{subject}} {{category}} Assessment - AI Diagnostic",
        descriptionTemplate:
          "Assess your {{subject}} skills in {{category}} with our AI-powered diagnostic tool. Get detailed feedback and personalized learning recommendations.",
        keywordsTemplate:
          "{{subject}} assessment, {{category}} evaluation, {{subject}} skills test, AI diagnostic, personalized learning",
        openGraph: {
          titleTemplate: "{{subject}} {{category}} Assessment",
          descriptionTemplate:
            "Test your {{subject}} knowledge and get AI-powered recommendations for improvement.",
          type: "website",
          siteName: "AI Diagnostic",
          imageTemplate: "/api/og/subject/{{categoryId}}/{{subjectId}}",
        },
      },
    },
    {
      id: "grade-level-assessments",
      template: "grade-assessment",
      path: "/assessments/grade-[grade]",
      dataKey: "gradeLevels",
      enabled: true,
      priority: 0.6,
      changefreq: "monthly",
      seo: {
        titleTemplate: "Grade {{grade}} Assessment - AI Diagnostic Tool",
        descriptionTemplate:
          "Comprehensive grade {{grade}} assessment covering multiple subjects. Get AI-powered insights into academic strengths and areas for improvement.",
        keywordsTemplate:
          "grade {{grade}} assessment, {{grade}} grade evaluation, elementary assessment, middle school assessment, high school assessment",
        openGraph: {
          titleTemplate: "Grade {{grade}} Assessment - Free AI Diagnostic",
          descriptionTemplate:
            "Assess grade {{grade}} academic skills across multiple subjects with personalized AI recommendations.",
          type: "website",
          siteName: "AI Diagnostic",
        },
      },
    },
    {
      id: "skill-areas",
      template: "skill-area",
      path: "/skills/[skillArea]",
      dataKey: "skillAreas",
      enabled: true,
      priority: 0.5,
      changefreq: "monthly",
      seo: {
        titleTemplate: "{{name}} Skills Assessment - AI Diagnostic",
        descriptionTemplate:
          "Evaluate your {{name}} skills with our comprehensive assessment. Get detailed analytics and personalized improvement recommendations.",
        keywordsTemplate:
          "{{name}} skills, {{name}} assessment, skill evaluation, professional development, AI diagnostic",
        openGraph: {
          titleTemplate: "{{name}} Skills Assessment",
          descriptionTemplate:
            "Assess your {{name}} capabilities and get AI-powered development recommendations.",
          type: "website",
          siteName: "AI Diagnostic",
        },
      },
    },
  ],
  dataSource: {
    type: "hybrid",
    sources: [
      {
        key: "assessmentTemplates",
        type: "prisma",
        config: {
          model: "assessmentTemplate",
          select: {
            id: true,
            name: true,
            description: true,
            grade: true,
            subject: true,
            category: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        transform: (data: any) => ({
          ...data,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: data.category || "general",
          categoryId: data.id,
        }),
      },
      {
        key: "subjects",
        type: "json",
        config: {
          path: "./data/subjects.json",
        },
      },
      {
        key: "gradeLevels",
        type: "json",
        config: {
          path: "./data/grade-levels.json",
        },
      },
      {
        key: "skillAreas",
        type: "json",
        config: {
          path: "./data/skill-areas.json",
        },
      },
    ],
    cache: {
      ttl: 1000 * 60 * 60, // 1 hour
      strategy: "memory",
    },
  },
  seo: {
    titleTemplate: "{{title}} - AI Diagnostic",
    descriptionTemplate: "{{description}}",
    openGraph: {
      titleTemplate: "{{title}}",
      descriptionTemplate: "{{description}}",
      type: "website",
      siteName: "AI Diagnostic",
    },
    robots: {
      index: true,
      follow: true,
    },
  },
  generation: {
    batchSize: 50,
    concurrent: true,
    staticGeneration: false,
  },
};

// Static data for subjects, grade levels, and skill areas
export const staticData = {
  subjects: [
    {
      id: "math",
      subject: "Mathematics",
      category: "STEM",
      categoryId: "stem",
      subjectId: "math",
      description:
        "Mathematical concepts, problem-solving, and analytical thinking",
    },
    {
      id: "science",
      subject: "Science",
      category: "STEM",
      categoryId: "stem",
      subjectId: "science",
      description:
        "Scientific method, experimentation, and natural phenomena understanding",
    },
    {
      id: "english",
      subject: "English Language Arts",
      category: "Language Arts",
      categoryId: "language-arts",
      subjectId: "english",
      description:
        "Reading comprehension, writing skills, and language proficiency",
    },
    {
      id: "social-studies",
      subject: "Social Studies",
      category: "Humanities",
      categoryId: "humanities",
      subjectId: "social-studies",
      description: "History, geography, civics, and social understanding",
    },
    {
      id: "technology",
      subject: "Technology",
      category: "STEM",
      categoryId: "stem",
      subjectId: "technology",
      description:
        "Digital literacy, computer skills, and technology integration",
    },
  ],
  gradeLevels: [
    {
      grade: "K",
      name: "Kindergarten",
      description: "Foundation skills for early learners",
    },
    {
      grade: "1",
      name: "First Grade",
      description: "Basic academic skills development",
    },
    {
      grade: "2",
      name: "Second Grade",
      description: "Building fundamental learning skills",
    },
    {
      grade: "3",
      name: "Third Grade",
      description: "Developing core academic competencies",
    },
    {
      grade: "4",
      name: "Fourth Grade",
      description: "Strengthening foundational knowledge",
    },
    {
      grade: "5",
      name: "Fifth Grade",
      description: "Elementary school completion skills",
    },
    {
      grade: "6",
      name: "Sixth Grade",
      description: "Middle school transition skills",
    },
    {
      grade: "7",
      name: "Seventh Grade",
      description: "Middle school core competencies",
    },
    {
      grade: "8",
      name: "Eighth Grade",
      description: "High school preparation skills",
    },
    {
      grade: "9",
      name: "Ninth Grade",
      description: "Freshman year foundational skills",
    },
    {
      grade: "10",
      name: "Tenth Grade",
      description: "Sophomore year academic development",
    },
    {
      grade: "11",
      name: "Eleventh Grade",
      description: "Junior year advanced skills",
    },
    {
      grade: "12",
      name: "Twelfth Grade",
      description: "Senior year college/career readiness",
    },
  ],
  skillAreas: [
    {
      id: "critical-thinking",
      name: "Critical Thinking",
      description:
        "Analytical reasoning, problem-solving, and logical evaluation skills",
    },
    {
      id: "communication",
      name: "Communication",
      description: "Verbal, written, and digital communication effectiveness",
    },
    {
      id: "collaboration",
      name: "Collaboration",
      description: "Teamwork, cooperation, and group project management",
    },
    {
      id: "creativity",
      name: "Creativity",
      description:
        "Innovation, artistic expression, and creative problem-solving",
    },
    {
      id: "digital-literacy",
      name: "Digital Literacy",
      description: "Technology proficiency and digital citizenship skills",
    },
  ],
};
