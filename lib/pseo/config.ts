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
            // educationalLevel: "{{grade}}", // removed grade level logic
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
            // grade: true, // removed grade level logic
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

// Static data for subjects and skill areas (grade levels removed)
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
};
