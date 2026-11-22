import { prisma, isDatabaseConnected } from "@/lib/prisma";
import { COMPANIES, PROVIDERS, BENCHMARKS, MODELS } from "@/lib/mock-data";
import { ModelQueryParams } from "@/lib/validations/api-schemas";
import { Model, Company, Provider, Benchmark } from "@/types";

export class DataStore {
  /**
   * Helper to enrich model with nested relations
   */
  private static enrichModel(model: Model): Model {
    const company = COMPANIES.find((c) => c.id === model.companyId);
    const offerings = (model.offerings || []).map((off) => ({
      ...off,
      provider: PROVIDERS.find((p) => p.id === off.providerId),
    }));
    const benchmarkScores = (model.benchmarkScores || []).map((bs) => ({
      ...bs,
      benchmark: BENCHMARKS.find((b) => b.id === bs.benchmarkId),
    }));

    return {
      ...model,
      company,
      offerings,
      benchmarkScores,
    };
  }

  /**
   * Query models with search, filters, sorting, facets, and pagination
   */
  static async getModels(params: ModelQueryParams) {
    const isConnected = await isDatabaseConnected();

    if (isConnected) {
      try {
        const where: Record<string, unknown> = {};

        if (params.q) {
          where.OR = [
            { name: { contains: params.q, mode: "insensitive" } },
            { slug: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
            { architecture: { contains: params.q, mode: "insensitive" } },
          ];
        }

        if (params.company) {
          where.company = { slug: params.company };
        }

        if (params.type) {
          where.modelType = params.type;
        }

        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
          where.inputPricePerMillion = {
            ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
            ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
          };
        }

        if (params.minContext !== undefined) {
          where.contextWindow = { gte: params.minContext };
        }

        if (params.featured !== undefined) {
          where.isFeatured = params.featured;
        }

        let orderBy: Record<string, "asc" | "desc"> = { releaseDate: "desc" };
        if (params.sort === "price_asc") orderBy = { inputPricePerMillion: "asc" };
        else if (params.sort === "price_desc") orderBy = { inputPricePerMillion: "desc" };
        else if (params.sort === "context_desc") orderBy = { contextWindow: "desc" };
        else if (params.sort === "name_asc") orderBy = { name: "asc" };

        const skip = (params.page - 1) * params.limit;
        const [total, dbModels] = await Promise.all([
          prisma.model.count({ where }),
          prisma.model.findMany({
            where,
            orderBy,
            skip,
            take: params.limit,
            include: {
              company: true,
              offerings: {
                include: { provider: true },
              },
              benchmarkScores: {
                include: { benchmark: true },
              },
            },
          }),
        ]);

        const models: Model[] = dbModels.map((m) => ({
          ...m,
          modalities: m.modalities.split(","),
          capabilities: m.capabilities.split(","),
          releaseDate: m.releaseDate.toISOString(),
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        }));

        return {
          models,
          total,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(total / params.limit),
          facets: this.calculateFacets(MODELS),
        };
      } catch (err) {
        console.warn("[DataStore] PostgreSQL query error, falling back to memory repository:", err);
      }
    }

    // High performance in-memory repository
    let filtered = MODELS.map((m) => this.enrichModel(m));

    // Full text search
    if (params.q) {
      const q = params.q.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.architecture.toLowerCase().includes(q) ||
          m.company?.name.toLowerCase().includes(q)
      );
    }

    // Company filter
    if (params.company) {
      const compSlug = params.company.toLowerCase();
      filtered = filtered.filter((m) => m.company?.slug === compSlug);
    }

    // Provider filter
    if (params.provider) {
      const provSlug = params.provider.toLowerCase();
      filtered = filtered.filter((m) =>
        m.offerings?.some((off) => off.provider?.slug === provSlug)
      );
    }

    // Model type filter
    if (params.type) {
      filtered = filtered.filter((m) => m.modelType.toLowerCase() === params.type?.toLowerCase());
    }

    // Modality filter
    if (params.modality) {
      const mod = params.modality.toLowerCase();
      filtered = filtered.filter((m) => m.modalities.some((x) => x.toLowerCase() === mod));
    }

    // Capability filter
    if (params.capability) {
      const cap = params.capability.toLowerCase();
      filtered = filtered.filter((m) => m.capabilities.some((c) => c.toLowerCase() === cap));
    }

    // Price filters
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((m) => m.inputPricePerMillion >= (params.minPrice ?? 0));
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((m) => m.inputPricePerMillion <= (params.maxPrice ?? Infinity));
    }

    // Context filter
    if (params.minContext !== undefined) {
      filtered = filtered.filter((m) => m.contextWindow >= (params.minContext ?? 0));
    }

    // Featured filter
    if (params.featured !== undefined) {
      filtered = filtered.filter((m) => m.isFeatured === params.featured);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (params.sort) {
        case "price_asc":
          return a.inputPricePerMillion - b.inputPricePerMillion;
        case "price_desc":
          return b.inputPricePerMillion - a.inputPricePerMillion;
        case "context_desc":
          return b.contextWindow - a.contextWindow;
        case "release_desc":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "score_desc":
        default:
          return (b.overallScore ?? 0) - (a.overallScore ?? 0);
      }
    });

    const total = filtered.length;
    const startIndex = (params.page - 1) * params.limit;
    const paginated = filtered.slice(startIndex, startIndex + params.limit);

    return {
      models: paginated,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
      facets: this.calculateFacets(MODELS),
    };
  }

  /**
   * Facets for frontend filter chips and counts
   */
  private static calculateFacets(models: Model[]) {
    const compMap = new Map<string, { name: string; slug: string; count: number }>();
    const modMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const capMap = new Map<string, number>();

    for (const m of models) {
      const company = COMPANIES.find((c) => c.id === m.companyId);
      if (company) {
        const existing = compMap.get(company.slug) || { name: company.name, slug: company.slug, count: 0 };
        existing.count++;
        compMap.set(company.slug, existing);
      }

      for (const mod of m.modalities) {
        modMap.set(mod, (modMap.get(mod) || 0) + 1);
      }

      typeMap.set(m.modelType, (typeMap.get(m.modelType) || 0) + 1);

      for (const cap of m.capabilities) {
        capMap.set(cap, (capMap.get(cap) || 0) + 1);
      }
    }

    return {
      companies: Array.from(compMap.values()).sort((a, b) => b.count - a.count),
      modalities: Array.from(modMap.entries()).map(([name, count]) => ({ name, count })),
      modelTypes: Array.from(typeMap.entries()).map(([name, count]) => ({ name, count })),
      capabilities: Array.from(capMap.entries()).map(([name, count]) => ({ name, count })),
    };
  }

  /**
   * Get single model by slug
   */
  static async getModelBySlug(slug: string): Promise<Model | null> {
    const isConnected = await isDatabaseConnected();

    if (isConnected) {
      try {
        const dbModel = await prisma.model.findUnique({
          where: { slug },
          include: {
            company: true,
            offerings: {
              include: { provider: true },
            },
            benchmarkScores: {
              include: { benchmark: true },
            },
          },
        });

        if (dbModel) {
          return {
            ...dbModel,
            modalities: dbModel.modalities.split(","),
            capabilities: dbModel.capabilities.split(","),
            releaseDate: dbModel.releaseDate.toISOString(),
            createdAt: dbModel.createdAt.toISOString(),
            updatedAt: dbModel.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn("[DataStore] PostgreSQL getModelBySlug error:", err);
      }
    }

    const found = MODELS.find((m) => m.slug === slug || m.id === slug);
    return found ? this.enrichModel(found) : null;
  }

  /**
   * Compare multiple models side by side
   */
  static async compareModels(slugs: string[]) {
    const models: Model[] = [];
    for (const slug of slugs) {
      const model = await this.getModelBySlug(slug);
      if (model) models.push(model);
    }

    if (models.length < 2) {
      throw new Error("At least two valid models are required for comparison");
    }

    // Benchmark comparison matrix
    const benchmarkComparison = BENCHMARKS.map((bench) => {
      const scores: Record<string, { rawScore: number | null; normalizedScore: number | null }> = {};
      for (const m of models) {
        const foundScore = m.benchmarkScores?.find((bs) => bs.benchmarkId === bench.id || bs.benchmark?.code === bench.code);
        scores[m.slug] = {
          rawScore: foundScore?.score ?? null,
          normalizedScore: foundScore?.normalizedScore ?? null,
        };
      }
      return {
        benchmark: bench,
        scores,
      };
    });

    // Price comparisons
    const minInputPrice = Math.min(...models.map((m) => m.inputPricePerMillion));
    const maxInputPrice = Math.max(...models.map((m) => m.inputPricePerMillion));
    const priceDifferential = maxInputPrice > 0 ? Math.round((maxInputPrice / (minInputPrice || 0.01)) * 10) / 10 : 1;

    // Context comparisons
    const maxContext = Math.max(...models.map((m) => m.contextWindow));

    return {
      models,
      comparison: {
        priceDifferentialRatio: `${priceDifferential}x`,
        cheapestModel: models.find((m) => m.inputPricePerMillion === minInputPrice)?.slug,
        largestContextModel: models.find((m) => m.contextWindow === maxContext)?.slug,
        benchmarks: benchmarkComparison,
      },
    };
  }

  /**
   * Get Leaderboard Rankings
   */
  static async getRankings(category = "overall", limit = 20) {
    const models = MODELS.map((m) => this.enrichModel(m));

    let ranked = [...models];

    if (category === "reasoning") {
      ranked = ranked.filter((m) => m.modelType === "Reasoning" || m.capabilities.includes("reasoning"));
      ranked.sort((a, b) => {
        const aMath = a.benchmarkScores?.find((bs) => bs.benchmark?.code === "MATH_500")?.score ?? 0;
        const bMath = b.benchmarkScores?.find((bs) => bs.benchmark?.code === "MATH_500")?.score ?? 0;
        return bMath - aMath;
      });
    } else if (category === "coding") {
      ranked.sort((a, b) => {
        const aCode = a.benchmarkScores?.find((bs) => bs.benchmark?.code === "HUMANEVAL" || bs.benchmark?.code === "SWE_BENCH")?.score ?? 0;
        const bCode = b.benchmarkScores?.find((bs) => bs.benchmark?.code === "HUMANEVAL" || bs.benchmark?.code === "SWE_BENCH")?.score ?? 0;
        return bCode - aCode;
      });
    } else if (category === "value") {
      // Best performance per dollar ratio
      ranked.sort((a, b) => {
        const aVal = (a.overallScore ?? 70) / Math.max(a.inputPricePerMillion, 0.1);
        const bVal = (b.overallScore ?? 70) / Math.max(b.inputPricePerMillion, 0.1);
        return bVal - aVal;
      });
    } else {
      // Overall Elo and composite
      ranked.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));
    }

    return ranked.slice(0, limit).map((m, index) => ({
      rank: index + 1,
      model: m,
      compositeScore: m.overallScore ?? 85,
    }));
  }

  /**
   * Get all benchmarks
   */
  static async getBenchmarks() {
    return BENCHMARKS.map((bench) => {
      // Find top 3 models for this benchmark
      const topScorers = MODELS.flatMap((m) => {
        const scoreObj = m.benchmarkScores?.find((bs) => bs.benchmarkId === bench.id);
        return scoreObj ? [{ modelSlug: m.slug, modelName: m.name, score: scoreObj.score }] : [];
      })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      return {
        ...bench,
        topScorers,
      };
    });
  }

  /**
   * Get all companies / labs
   */
  static async getCompanies() {
    return COMPANIES.map((c) => {
      const companyModels = MODELS.filter((m) => m.companyId === c.id);
      return {
        ...c,
        modelsCount: companyModels.length,
        models: companyModels.map((m) => ({
          slug: m.slug,
          name: m.name,
          modelType: m.modelType,
          contextWindow: m.contextWindow,
        })),
      };
    });
  }

  /**
   * Get single company by slug
   */
  static async getCompanyBySlug(slug: string) {
    const company = COMPANIES.find((c) => c.slug === slug);
    if (!company) return null;

    const models = MODELS.filter((m) => m.companyId === company.id).map((m) => this.enrichModel(m));

    return {
      ...company,
      models,
    };
  }

  /**
   * Get all providers
   */
  static async getProviders() {
    return PROVIDERS.map((prov) => {
      const hostedModels = MODELS.filter((m) =>
        m.offerings?.some((off) => off.providerId === prov.id)
      );

      return {
        ...prov,
        modelsCount: hostedModels.length,
        hostedModels: hostedModels.map((m) => ({
          slug: m.slug,
          name: m.name,
          inputPricePerMillion: m.inputPricePerMillion,
          contextWindow: m.contextWindow,
        })),
      };
    });
  }

  /**
   * Get single provider by slug
   */
  static async getProviderBySlug(slug: string) {
    const provider = PROVIDERS.find((p) => p.slug === slug);
    if (!provider) return null;

    const offerings = MODELS.flatMap((m) => {
      const off = m.offerings?.find((o) => o.providerId === provider.id);
      return off ? [{ model: m, offering: off }] : [];
    });

    return {
      ...provider,
      offerings,
    };
  }

  /**
   * Platform summary stats
   */
  static async getPlatformStats() {
    const totalModels = MODELS.length;
    const totalProviders = PROVIDERS.length;
    const totalCompanies = COMPANIES.length;
    
    const avgLatency = Math.round(
      PROVIDERS.reduce((acc, p) => acc + p.avgLatencyMs, 0) / PROVIDERS.length
    );

    const cheapestModel = [...MODELS].sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)[0];
    const topRankedModel = [...MODELS].sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))[0];

    return {
      totalModels,
      totalProviders,
      totalCompanies,
      avgLatencyMs: avgLatency,
      cheapestModel: {
        slug: cheapestModel.slug,
        name: cheapestModel.name,
        pricePerMillion: cheapestModel.inputPricePerMillion,
      },
      topRankedModel: {
        slug: topRankedModel.slug,
        name: topRankedModel.name,
        score: topRankedModel.overallScore,
      },
      lastSync: new Date().toISOString(),
    };
  }
}
