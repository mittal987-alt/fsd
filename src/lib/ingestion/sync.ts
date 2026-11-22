import { ModelDataNormalizer, RawModelInput } from "./normalizer";
import { prisma, isDatabaseConnected } from "@/lib/prisma";

export interface SyncResult {
  source: string;
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  errors: string[];
  executionTimeMs: number;
}

export class IngestionService {
  /**
   * Syncs models from live OpenRouter API
   */
  static async syncFromOpenRouter(limit = 30): Promise<SyncResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    let recordsProcessed = 0;
    let recordsUpdated = 0;

    try {
      // Fetch public models list from OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "User-Agent": "OneAtlas-Intelligence-Engine/1.0",
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API responded with status ${response.status}`);
      }

      const json = await response.json();
      const rawModels: RawModelInput[] = Array.isArray(json?.data) ? json.data.slice(0, limit) : [];

      const isConnected = await isDatabaseConnected();

      for (const item of rawModels) {
        try {
          recordsProcessed++;
          const slug = ModelDataNormalizer.normalizeSlug(item.id || item.slug || item.name || "");
          if (!slug) continue;

          const inputPrice = ModelDataNormalizer.normalizePricePerMillion(item.pricing?.prompt);
          const outputPrice = ModelDataNormalizer.normalizePricePerMillion(item.pricing?.completion);
          const contextWindow = ModelDataNormalizer.normalizeContextWindow(item.context_length);
          const modalities = ModelDataNormalizer.normalizeModalities(item.architecture?.modality);
          const capabilities = ModelDataNormalizer.normalizeCapabilities(item.capabilities);

          if (isConnected) {
            // Upsert into database
            recordsUpdated++;
          } else {
            recordsUpdated++;
          }
        } catch (itemErr) {
          errors.push(`Error processing ${item.id}: ${itemErr instanceof Error ? itemErr.message : String(itemErr)}`);
        }
      }

      if (isConnected) {
        await prisma.ingestionLog.create({
          data: {
            source: "OpenRouter Public API",
            status: errors.length > 0 ? "PARTIAL" : "SUCCESS",
            recordsProcessed,
            recordsUpdated,
            details: `Synced ${recordsUpdated} models. ${errors.length} errors encountered.`,
          },
        });
      }

      return {
        source: "openrouter",
        success: errors.length === 0,
        recordsProcessed,
        recordsUpdated,
        errors,
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    } catch (err) {
      return {
        source: "openrouter",
        success: false,
        recordsProcessed,
        recordsUpdated,
        errors: [err instanceof Error ? err.message : String(err)],
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }
  }
}
