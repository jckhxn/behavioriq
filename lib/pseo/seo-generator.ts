import { SEOConfig, OpenGraphConfig, StructuredDataConfig, TemplateVariables } from './types'

export class SEOGenerator {
  constructor(private config: SEOConfig) {}

  generateMetadata(data: any, routeSEO?: Partial<SEOConfig>): TemplateVariables['meta'] {
    const seoConfig = { ...this.config, ...routeSEO }
    
    const title = this.interpolate(seoConfig.titleTemplate, data)
    const description = this.interpolate(seoConfig.descriptionTemplate, data)
    const keywords = seoConfig.keywordsTemplate ? 
      this.interpolate(seoConfig.keywordsTemplate, data).split(',').map(k => k.trim()) : 
      undefined

    return {
      title,
      description,
      keywords,
      openGraph: this.generateOpenGraph(data, seoConfig.openGraph, title, description),
      structuredData: seoConfig.structuredData ? 
        this.generateStructuredData(data, seoConfig.structuredData) : 
        undefined
    }
  }

  private generateOpenGraph(
    data: any, 
    ogConfig: OpenGraphConfig, 
    title: string, 
    description: string
  ) {
    return {
      title: ogConfig.titleTemplate ? this.interpolate(ogConfig.titleTemplate, data) : title,
      description: ogConfig.descriptionTemplate ? this.interpolate(ogConfig.descriptionTemplate, data) : description,
      image: ogConfig.imageTemplate ? this.interpolate(ogConfig.imageTemplate, data) : undefined,
      url: this.generateCanonicalUrl(data),
      type: ogConfig.type,
      siteName: ogConfig.siteName
    }
  }

  private generateStructuredData(data: any, config: StructuredDataConfig) {
    const structuredData: any = {
      '@context': 'https://schema.org',
      '@type': config.type
    }

    for (const [property, template] of Object.entries(config.properties)) {
      structuredData[property] = this.interpolate(template, data)
    }

    return structuredData
  }

  private generateCanonicalUrl(data: any): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
    const path = data.slug || data.id || ''
    return `${baseUrl}/${path}`
  }

  private interpolate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path.trim())
      return value !== undefined ? String(value) : match
    })
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  generateMetaTags(metadata: TemplateVariables['meta']): string {
    const tags: string[] = []

    tags.push(`<title>${this.escapeHtml(metadata.title)}</title>`)
    tags.push(`<meta name="description" content="${this.escapeHtml(metadata.description)}" />`)
    
    if (metadata.keywords) {
      tags.push(`<meta name="keywords" content="${this.escapeHtml(metadata.keywords.join(', '))}" />`)
    }

    tags.push(`<meta property="og:title" content="${this.escapeHtml(metadata.openGraph.title)}" />`)
    tags.push(`<meta property="og:description" content="${this.escapeHtml(metadata.openGraph.description)}" />`)
    tags.push(`<meta property="og:type" content="${metadata.openGraph.type}" />`)
    tags.push(`<meta property="og:url" content="${metadata.openGraph.url}" />`)
    tags.push(`<meta property="og:site_name" content="${metadata.openGraph.siteName}" />`)
    
    if (metadata.openGraph.image) {
      tags.push(`<meta property="og:image" content="${metadata.openGraph.image}" />`)
    }

    tags.push(`<meta name="twitter:card" content="summary_large_image" />`)
    tags.push(`<meta name="twitter:title" content="${this.escapeHtml(metadata.openGraph.title)}" />`)
    tags.push(`<meta name="twitter:description" content="${this.escapeHtml(metadata.openGraph.description)}" />`)
    
    if (metadata.openGraph.image) {
      tags.push(`<meta name="twitter:image" content="${metadata.openGraph.image}" />`)
    }

    if (metadata.structuredData) {
      tags.push(`<script type="application/ld+json">${JSON.stringify(metadata.structuredData)}</script>`)
    }

    return tags.join('\n')
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}