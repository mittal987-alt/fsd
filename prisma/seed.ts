import { PrismaClient } from "@prisma/client";
import { COMPANIES, PROVIDERS, BENCHMARKS, MODELS } from "../src/lib/mock-data";
import { ModelDataNormalizer } from "../src/lib/ingestion/normalizer";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ── Companies ──────────────────────────────────────────────────────────────
  console.log("  → Seeding companies...");
  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        description: company.description,
        websiteUrl: company.websiteUrl,
        logoUrl: company.logoUrl,
        country: company.country,
        foundedYear: company.foundedYear,
      },
      create: {
        id: company.id,
        slug: company.slug,
        name: company.name,
        description: company.description,
        websiteUrl: company.websiteUrl,
        logoUrl: company.logoUrl,
        country: company.country,
        foundedYear: company.foundedYear,
      },
    });
  }
  console.log(`     ✓ ${COMPANIES.length} companies`);

  // ── Providers ──────────────────────────────────────────────────────────────
  console.log("  → Seeding providers...");
  for (const provider of PROVIDERS) {
    await prisma.provider.upsert({
      where: { slug: provider.slug },
      update: {
        name: provider.name,
        description: provider.description,
        websiteUrl: provider.websiteUrl,
        logoUrl: provider.logoUrl,
        apiDocsUrl: provider.apiDocsUrl,
        status: provider.status,
        avgLatencyMs: provider.avgLatencyMs,
        avgThroughputTps: provider.avgThroughputTps,
      },
      create: {
        id: provider.id,
        slug: provider.slug,
        name: provider.name,
        description: provider.description,
        websiteUrl: provider.websiteUrl,
        logoUrl: provider.logoUrl,
        apiDocsUrl: provider.apiDocsUrl,
        status: provider.status,
        avgLatencyMs: provider.avgLatencyMs,
        avgThroughputTps: provider.avgThroughputTps,
      },
    });
  }
  console.log(`     ✓ ${PROVIDERS.length} providers`);

  // ── Benchmarks ─────────────────────────────────────────────────────────────
  console.log("  → Seeding benchmarks...");
  for (const bench of BENCHMARKS) {
    await prisma.benchmark.upsert({
      where: { code: bench.code },
      update: {
        name: bench.name,
        category: bench.category,
        description: bench.description,
        metric: bench.metric,
        maxValue: bench.maxValue,
      },
      create: {
        id: bench.id,
        code: bench.code,
        name: bench.name,
        category: bench.category,
        description: bench.description,
        metric: bench.metric,
        maxValue: bench.maxValue,
      },
    });
  }
  console.log(`     ✓ ${BENCHMARKS.length} benchmarks`);

  // ── Models ─────────────────────────────────────────────────────────────────
  console.log("  → Seeding models...");
  for (const model of MODELS) {
    const normalizedModalities = Array.isArray(model.modalities)
      ? model.modalities.join(",")
      : model.modalities;
    const normalizedCapabilities = Array.isArray(model.capabilities)
      ? model.capabilities.join(",")
      : model.capabilities;

    await prisma.model.upsert({
      where: { slug: model.slug },
      update: {
        name: model.name,
        description: model.description,
        modelType: model.modelType,
        architecture: model.architecture,
        parameterCountBillion: model.parameterCountBillion,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        inputPricePerMillion: model.inputPricePerMillion,
        outputPricePerMillion: model.outputPricePerMillion,
        cacheReadPricePerMillion: model.cacheReadPricePerMillion ?? 0,
        modalities: normalizedModalities,
        capabilities: normalizedCapabilities,
        license: model.license,
        releaseDate: new Date(model.releaseDate),
        isFeatured: model.isFeatured,
      },
      create: {
        id: model.id,
        slug: model.slug,
        name: model.name,
        description: model.description,
        companyId: model.companyId,
        modelType: model.modelType,
        architecture: model.architecture,
        parameterCountBillion: model.parameterCountBillion,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        inputPricePerMillion: model.inputPricePerMillion,
        outputPricePerMillion: model.outputPricePerMillion,
        cacheReadPricePerMillion: model.cacheReadPricePerMillion ?? 0,
        modalities: normalizedModalities,
        capabilities: normalizedCapabilities,
        license: model.license,
        releaseDate: new Date(model.releaseDate),
        isFeatured: model.isFeatured,
      },
    });

    // ── Provider Offerings ───────────────────────────────────────────────────
    for (const offering of model.offerings ?? []) {
      await prisma.modelProviderOffering.upsert({
        where: {
          modelId_providerId: {
            modelId: model.id,
            providerId: offering.providerId,
          },
        },
        update: {
          providerModelId: offering.providerModelId,
          inputPricePerMillion: offering.inputPricePerMillion,
          outputPricePerMillion: offering.outputPricePerMillion,
          cacheReadPricePerMillion: offering.cacheReadPricePerMillion ?? 0,
          latencyP50Ms: offering.latencyP50Ms,
          latencyP99Ms: offering.latencyP99Ms,
          throughputTps: offering.throughputTps,
          uptimePercentage: offering.uptimePercentage,
          isAvailable: offering.isAvailable,
        },
        create: {
          id: offering.id,
          modelId: model.id,
          providerId: offering.providerId,
          providerModelId: offering.providerModelId,
          inputPricePerMillion: offering.inputPricePerMillion,
          outputPricePerMillion: offering.outputPricePerMillion,
          cacheReadPricePerMillion: offering.cacheReadPricePerMillion ?? 0,
          latencyP50Ms: offering.latencyP50Ms,
          latencyP99Ms: offering.latencyP99Ms,
          throughputTps: offering.throughputTps,
          uptimePercentage: offering.uptimePercentage,
          isAvailable: offering.isAvailable,
        },
      });
    }

    // ── Benchmark Scores ─────────────────────────────────────────────────────
    for (const score of model.benchmarkScores ?? []) {
      await prisma.modelBenchmarkScore.upsert({
        where: {
          modelId_benchmarkId: {
            modelId: model.id,
            benchmarkId: score.benchmarkId,
          },
        },
        update: {
          score: score.score,
          normalizedScore: score.normalizedScore,
          verified: score.verified,
          sourceUrl: score.sourceUrl,
        },
        create: {
          id: score.id,
          modelId: model.id,
          benchmarkId: score.benchmarkId,
          score: score.score,
          normalizedScore: score.normalizedScore,
          verified: score.verified,
          sourceUrl: score.sourceUrl,
        },
      });
    }
  }
  console.log(`     ✓ ${MODELS.length} models with offerings & benchmark scores`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const [modelCount, companyCount, providerCount, benchmarkCount] = await Promise.all([
    prisma.model.count(),
    prisma.company.count(),
    prisma.provider.count(),
    prisma.benchmark.count(),
  ]);

  console.log("\n✅ Seed complete:");
  console.log(`   Models:     ${modelCount}`);
  console.log(`   Companies:  ${companyCount}`);
  console.log(`   Providers:  ${providerCount}`);
  console.log(`   Benchmarks: ${benchmarkCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
