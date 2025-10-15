export interface PSEOConfig {
  routes: PSEORoute[];
  dataSource: DataSourceConfig;
  seo: SEOConfig;
  generation: GenerationConfig;
}

export interface PSEORoute {
  id: string;
  template: string;
  path: string;
  dataKey: string;
  enabled: boolean;
  priority: number;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  lastmod?: string;
  seo?: Partial<SEOConfig>;
}

export interface DataSourceConfig {
  type: "database" | "api" | "static" | "hybrid";
  sources: DataSource[];
  cache?: CacheConfig;
}

export interface DataSource {
  key: string;
  type: "prisma" | "api" | "json" | "csv";
  config: any;
  transform?: (data: any) => any;
}

export interface SEOConfig {
  titleTemplate: string;
  descriptionTemplate: string;
  keywordsTemplate?: string;
  openGraph: OpenGraphConfig;
  structuredData?: StructuredDataConfig;
  robots?: RobotsConfig;
}

export interface OpenGraphConfig {
  titleTemplate: string;
  descriptionTemplate: string;
  imageTemplate?: string;
  type: string;
  siteName: string;
}

export interface StructuredDataConfig {
  type: string;
  properties: Record<string, string | object>;
}

export interface RobotsConfig {
  index: boolean;
  follow: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
}

export interface CacheConfig {
  ttl: number;
  strategy: "memory" | "redis" | "file";
}

export interface GenerationConfig {
  batchSize: number;
  concurrent: boolean;
  outputDir?: string;
  staticGeneration?: boolean;
}

export interface PSEOPageData {
  slug: string;
  title: string;
  description: string;
  keywords?: string[];
  data: Record<string, any>;
  lastModified?: Date;
}

export interface TemplateVariables {
  [key: string]: any;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
    openGraph: {
      title: string;
      description: string;
      image?: string;
      url: string;
      type: string;
      siteName: string;
    };
    structuredData?: any;
  };
}
