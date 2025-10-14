import { NextResponse } from 'next/server'
import { PSEOPageGenerator } from '@/lib/pseo/page-generator'

export async function GET() {
  try {
    const generator = new PSEOPageGenerator()
    const sitemap = await generator.generateSitemap()
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating pSEO sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}