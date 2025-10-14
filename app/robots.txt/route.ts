import { NextResponse } from 'next/server'
import { PSEOPageGenerator } from '@/lib/pseo/page-generator'

export async function GET() {
  try {
    const generator = new PSEOPageGenerator()
    const robotsTxt = await generator.generateRobotsTxt()
    
    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    return new NextResponse('User-agent: *\nDisallow: /', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}