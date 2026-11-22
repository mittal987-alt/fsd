import { z } from "zod";

export const ModelQuerySchema = z.object({
  q: z.string().optional().describe("Search query matching name, slug, description, or architecture"),
  company: z.string().optional().describe("Company or lab slug (e.g. openai, anthropic, google)"),
  provider: z.string().optional().describe("Provider slug offering this model (e.g. openrouter, groq, together)"),
  type: z.string().optional().describe("Model type (e.g. 'Chat/Completion', 'Reasoning', 'Multimodal', 'Code')"),
  modality: z.string().optional().describe("Supported modality (e.g. text, image, audio)"),
  capability: z.string().optional().describe("Required capability (e.g. function-calling, json, reasoning, vision)"),
  minPrice: z.coerce.number().min(0).optional().describe("Minimum input price per million tokens"),
  maxPrice: z.coerce.number().min(0).optional().describe("Maximum input price per million tokens"),
  minContext: z.coerce.number().min(0).optional().describe("Minimum context window size in tokens"),
  featured: z.preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean().optional()),
  sort: z.enum([
    "price_asc",
    "price_desc",
    "context_desc",
    "release_desc",
    "score_desc",
    "name_asc",
  ]).default("score_desc").describe("Sorting criteria"),
  page: z.coerce.number().int().min(1).default(1).describe("Page number (1-indexed)"),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe("Items per page (max 100)"),
});

export type ModelQueryParams = z.infer<typeof ModelQuerySchema>;

export const CompareQuerySchema = z.object({
  models: z.union([
    z.string().transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),
    z.array(z.string()),
  ]).refine((arr) => arr.length >= 2 && arr.length <= 5, {
    message: "You must provide between 2 and 5 model slugs to compare",
  }),
});

export const CostCalculationSchema = z.object({
  modelSlug: z.string().min(1, "modelSlug is required"),
  promptTokens: z.number().nonnegative("promptTokens must be 0 or positive"),
  completionTokens: z.number().nonnegative("completionTokens must be 0 or positive"),
  requestsPerMonth: z.number().int().positive().default(1),
  providerSlug: z.string().optional(),
});

export const SyncPayloadSchema = z.object({
  source: z.enum(["openrouter", "synthetic", "all"]).default("all"),
  secret: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export const RankingQuerySchema = z.object({
  category: z.enum(["overall", "reasoning", "coding", "general", "agentic", "value"]).default("overall"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
