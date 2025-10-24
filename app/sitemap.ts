export default GET;
import fs from "fs";
import path from "path";

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"; // Set in .env
  const generatedDir = path.join(process.cwd(), "data", "generated");

  let urls = "";

  if (fs.existsSync(generatedDir)) {
    const files = fs
      .readdirSync(generatedDir)
      .filter((file) => file.endsWith(".json"));

    files.forEach((file) => {
      const slug = file.replace(".json", "");
      const url = `${BASE_URL}/${slug}`;
      urls += `
        <url>
          <loc>${url}</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`;
    });
  }

  // Add static routes if desired
  const staticPages = ["", "pricing", "assessment", "contact"];
  staticPages.forEach((page) => {
    const url = `${BASE_URL}/${page}`;
    urls += `
      <url>
        <loc>${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
