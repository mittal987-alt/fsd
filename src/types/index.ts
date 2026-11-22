export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  country: string | null;
  foundedYear: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  modelsCount?: number;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  apiDocsUrl: string | null;
  status: "Operational" | "Degraded" | "Down" | string;
  avgLatencyMs: number;
  avgThroughputTps: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  modelsCount?: number;
}

export interface ModelProviderOffering {
  id: string;
  modelId: string;
  providerId: string;
  providerModelId: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cacheReadPricePerMillion: number | null;
  latencyP50Ms: number;
  latencyP99Ms: number;
  throughputTps: number;
  uptimePercentage: number;
  isAvailable: boolean;
  lastCheckedAt?: string | Date;
  provider?: Provider;
}

export interface Benchmark {
  id: string;
  code: string;
  name: string;
  category: "General" | "Reasoning" | "Coding" | "Agentic" | "Multimodal" | string;
  description: string;
  metric: string;
  maxValue: number;
}

export interface ModelBenchmarkScore {
  id: string;
  modelId: string;
  benchmarkId: string;
  score: number;
  normalizedScore: number;
  verified: boolean;
  sourceUrl: string | null;
  testedAt?: string | Date;
  benchmark?: Benchmark;
}

export interface Model {
  id: string;
  slug: string;
  name: string;
  description: string;
  companyId: string;
  company?: Company;
  modelType: "Chat/Completion" | "Reasoning" | "Multimodal" | "Code" | "Embedding" | string;
  architecture: string;
  parameterCountBillion: number | null;
  contextWindow: number;
  maxOutputTokens: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cacheReadPricePerMillion: number | null;
  modalities: string[];
  capabilities: string[];
  license: string;
  releaseDate: string | Date;
  isFeatured: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  offerings?: ModelProviderOffering[];
  benchmarkScores?: ModelBenchmarkScore[];
  overallScore?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
    facets?: {
      companies?: { name: string; slug: string; count: number }[];
      modalities?: { name: string; count: number }[];
      modelTypes?: { name: string; count: number }[];
      capabilities?: { name: string; count: number }[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  executionTimeMs?: number;
}
