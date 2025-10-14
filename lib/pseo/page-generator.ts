import { DataSourceManager } from './data-source-manager'
import { SEOGenerator } from './seo-generator'
import { pseoConfig } from './config'
import { PSEORoute, PSEOPageData, TemplateVariables } from './types'

export class PSEOPageGenerator {
  private dataManager: DataSourceManager
  private seoGenerator: SEOGenerator

  constructor() {
    this.dataManager = new DataSourceManager(pseoConfig.dataSource)
    this.seoGenerator = new SEOGenerator(pseoConfig.seo)
  }

  async generateAllPages(): Promise<Map<string, TemplateVariables>> {
    const pages = new Map<string, TemplateVariables>()
    
    for (const route of pseoConfig.routes) {
      if (!route.enabled) continue
      
      try {
        const routePages = await this.generatePagesForRoute(route)
        routePages.forEach((page, path) => {
          pages.set(path, page)
        })
      } catch (error) {
        console.error(`Error generating pages for route ${route.id}:`, error)
      }
    }
    
    return pages
  }

  async generatePagesForRoute(route: PSEORoute): Promise<Map<string, TemplateVariables>> {
    const pages = new Map<string, TemplateVariables>()
    const pageData = await this.dataManager.getAllPageData(route)
    
    for (const data of pageData) {
      const metadata = this.seoGenerator.generateMetadata(data.data, route.seo)
      const templateVars: TemplateVariables = {
        ...data.data,
        slug: data.slug,
        meta: metadata
      }
      
      pages.set(data.slug, templateVars)
    }
    
    return pages
  }

  async generateSitemap(): Promise<string> {
    const pages = await this.generateAllPages()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
    
    const urls: string[] = []
    
    for (const [path, data] of pages) {
      const route = pseoConfig.routes.find(r => 
        data.slug.includes(r.template) || path.includes(r.path.replace(/\[.*?\]/g, ''))
      )
      
      if (!route) continue
      
      const lastmod = data.lastModified ? new Date(data.lastModified).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      
      urls.push(`
  <url>
    <loc>${baseUrl}/${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`)
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`
  }

  async generateRobotsTxt(): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
    
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-pseo.xml

# Block admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /checkout*/
Disallow: /payment*/
Disallow: /settings/

# Allow important pages
Allow: /assessments/
Allow: /skills/
Allow: /trial-assessment
Allow: /
`
  }

  async getPageData(slug: string): Promise<TemplateVariables | null> {
    const pages = await this.generateAllPages()
    return pages.get(slug) || null
  }

  async getAllSlugs(): Promise<string[]> {
    const pages = await this.generateAllPages()
    return Array.from(pages.keys())
  }

  async getStaticPaths() {
    const slugs = await this.getAllSlugs()
    return {
      paths: slugs.map(slug => ({ params: { slug: slug.split('/') } })),
      fallback: 'blocking'
    }
  }
}