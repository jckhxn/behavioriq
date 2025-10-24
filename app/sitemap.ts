import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const generatedDir = path.join(process.cwd(), "data", "generated");

  const entries: MetadataRoute.Sitemap = [];

  // Add generated pages from pSEO
  if (fs.existsSync(generatedDir)) {
    const files = fs
      .readdirSync(generatedDir)
      .filter((file) => file.endsWith(".json"));

    files.forEach((file) => {
      const slug = file.replace(".json", "");
      entries.push({
        url: `${BASE_URL}/${slug}`,
        changeFrequency: "daily",
        priority: 0.8,
        lastModified: new Date(),
      });
    });
  }

  // Add static routes
  const staticPages = [
    { url: "", priority: 1, changeFrequency: "weekly" as const },
    { url: "pricing", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "assessment", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "contact", priority: 0.7, changeFrequency: "weekly" as const },
  ];

  staticPages.forEach((page) => {
    entries.push({
      url: `${BASE_URL}/${page.url}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      lastModified: new Date(),
    });
  });

  return entries;
}
