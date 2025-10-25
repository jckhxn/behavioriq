import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://behavioriq.app";
  const generatedDir = path.join(process.cwd(), "data", "generated");

  const entries: MetadataRoute.Sitemap = [];

  // Primary pages - highest priority
  const primaryPages = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "login", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "register", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  primaryPages.forEach((page) => {
    entries.push({
      url: `${BASE_URL}/${page.url}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      lastModified: new Date(),
    });
  });

  // Feature pages
  const featurePages = [
    {
      url: "assessment/new",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      url: "payment-success",
      priority: 0.6,
      changeFrequency: "yearly" as const,
    },
    {
      url: "auth/forgot-password",
      priority: 0.5,
      changeFrequency: "yearly" as const,
    },
  ];

  featurePages.forEach((page) => {
    entries.push({
      url: `${BASE_URL}/${page.url}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      lastModified: new Date(),
    });
  });

  // Add generated pages from pSEO (informational content)
  if (fs.existsSync(generatedDir)) {
    const files = fs
      .readdirSync(generatedDir)
      .filter((file) => file.endsWith(".json"));

    files.forEach((file) => {
      const slug = file.replace(".json", "");
      entries.push({
        url: `${BASE_URL}/${slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
        lastModified: new Date(),
      });
    });
  }

  return entries;
}
