import { NextResponse } from 'next/server'
import { PSEOPageGenerator } from '@/lib/pseo/page-generator'

export async function GET() {
  try {
    const generator = new PSEOPageGenerator()
    const generatedRobotsTxt = await generator.generateRobotsTxt()

    // Enhance robots.txt with sitemap and additional directives
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://behavioriq.app'
    const robotsTxt = `${generatedRobotsTxt}

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-pseo.xml

# Crawl delay to be respectful to server
Crawl-delay: 1

# Google-specific directives
User-agent: Googlebot
Allow: /

# Bing-specific directives
User-agent: Bingbot
Allow: /

# Other crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Disallow: /_next/
Disallow: /.next/
Disallow: /private/
`

    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)

    // Fallback robots.txt with sensible defaults
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://behavioriq.app'
    const fallbackRobotsTxt = `# Robots.txt for BehaviorIQ
# Default fallback when generation fails

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Disallow: /_next/
Disallow: /.next/
Disallow: /private/

Crawl-delay: 1

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-pseo.xml
`

    return new NextResponse(fallbackRobotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}