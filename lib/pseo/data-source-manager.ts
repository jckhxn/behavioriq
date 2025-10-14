import { DataSource, DataSourceConfig, PSEOPageData } from './types'
import { prisma } from '@/lib/db/prisma'

export class DataSourceManager {
  private sources: Map<string, DataSource> = new Map()
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  constructor(private config: DataSourceConfig) {
    this.config.sources.forEach(source => {
      this.sources.set(source.key, source)
    })
  }

  async getData(sourceKey: string, params?: Record<string, any>): Promise<any[]> {
    const cacheKey = `${sourceKey}-${JSON.stringify(params || {})}`
    
    if (this.config.cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
    }

    const source = this.sources.get(sourceKey)
    if (!source) {
      throw new Error(`Data source '${sourceKey}' not found`)
    }

    let data: any[]

    switch (source.type) {
      case 'prisma':
        data = await this.getPrismaData(source, params)
        break
      case 'api':
        data = await this.getApiData(source, params)
        break
      case 'json':
        data = await this.getJsonData(source, params)
        break
      default:
        throw new Error(`Unsupported data source type: ${source.type}`)
    }

    if (source.transform) {
      data = data.map(source.transform)
    }

    if (this.config.cache) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.config.cache.ttl
      })
    }

    return data
  }

  private async getPrismaData(source: DataSource, params?: Record<string, any>): Promise<any[]> {
    const { model, where, select, orderBy, take } = source.config
    
    const query: any = {}
    if (where) query.where = this.interpolateParams(where, params)
    if (select) query.select = select
    if (orderBy) query.orderBy = orderBy
    if (take) query.take = take

    return await (prisma as any)[model].findMany(query)
  }

  private async getApiData(source: DataSource, params?: Record<string, any>): Promise<any[]> {
    const { url, headers, method = 'GET' } = source.config
    const interpolatedUrl = this.interpolateParams(url, params)
    
    const response = await fetch(interpolatedUrl, {
      method,
      headers: headers || {}
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    return await response.json()
  }

  private async getJsonData(source: DataSource, params?: Record<string, any>): Promise<any[]> {
    const { path } = source.config
    const fs = await import('fs/promises')
    const data = await fs.readFile(path, 'utf-8')
    return JSON.parse(data)
  }

  private interpolateParams(template: any, params?: Record<string, any>): any {
    if (!params) return template
    
    if (typeof template === 'string') {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] || match)
    }
    
    if (Array.isArray(template)) {
      return template.map(item => this.interpolateParams(item, params))
    }
    
    if (typeof template === 'object' && template !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.interpolateParams(value, params)
      }
      return result
    }
    
    return template
  }

  async getAllPageData(routeConfig: any): Promise<PSEOPageData[]> {
    const data = await this.getData(routeConfig.dataKey)
    
    return data.map(item => ({
      slug: this.generateSlug(item, routeConfig.path),
      title: this.interpolateTemplate(routeConfig.seo?.titleTemplate || '', item),
      description: this.interpolateTemplate(routeConfig.seo?.descriptionTemplate || '', item),
      keywords: routeConfig.seo?.keywordsTemplate ? 
        this.interpolateTemplate(routeConfig.seo.keywordsTemplate, item).split(',').map(k => k.trim()) : 
        undefined,
      data: item,
      lastModified: item.updatedAt || item.createdAt || new Date()
    }))
  }

  private generateSlug(data: any, pathTemplate: string): string {
    return pathTemplate.replace(/\[([^\]]+)\]/g, (match, key) => {
      const value = data[key]
      if (value === undefined) {
        throw new Error(`Missing value for path parameter: ${key}`)
      }
      return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')
    })
  }

  private interpolateTemplate(template: string, data: any): string {
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

  clearCache(): void {
    this.cache.clear()
  }
}