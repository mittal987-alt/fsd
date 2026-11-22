export interface RawModelInput {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  companySlug?: string;
  pricing?: {
    prompt?: string | number; // cost per token or cost per 1M
    completion?: string | number;
    request?: string | number;
    image?: string | number;
  };
  context_length?: number;
  max_tokens?: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  capabilities?: string[];
}

export class ModelDataNormalizer {
  /**
   * Normalizes token pricing to USD per 1,000,000 tokens
   * Handles per-token scientific notation or direct dollar inputs
   */
  static normalizePricePerMillion(rawPrice: string | number | undefined | null): number {
    if (rawPrice === undefined || rawPrice === null) return 0;
    const num = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;
    if (isNaN(num) || num <= 0) return 0;

    // If already normalized (> 0.01 and < 1000, likely already per 1M)
    // If very small (< 0.001), it is per-token (e.g. 0.000003 per token = $3.00 / 1M tokens)
    if (num < 0.001) {
      return Math.round(num * 1_000_000 * 100) / 100;
    }
    return Math.round(num * 100) / 100;
  }

  /**
   * Cleans and sanitizes model slug
   */
  static normalizeSlug(rawNameOrSlug: string): string {
    return rawNameOrSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Normalizes context window
   */
  static normalizeContextWindow(rawContext: number | undefined | null): number {
    if (!rawContext || rawContext < 1024) return 128000;
    return Math.round(rawContext);
  }

  /**
   * Normalizes modalities array from arbitrary string or array
   */
  static normalizeModalities(input: string | string[] | undefined): string[] {
    if (!input) return ["text"];
    const array = Array.isArray(input) ? input : input.split(/[,\s+]+/);
    const set = new Set<string>();
    
    for (const item of array) {
      const lower = item.toLowerCase().trim();
      if (lower.includes("text")) set.add("text");
      if (lower.includes("image") || lower.includes("vision")) set.add("image");
      if (lower.includes("audio") || lower.includes("voice")) set.add("audio");
      if (lower.includes("video")) set.add("video");
      if (lower.includes("code")) set.add("code");
    }

    if (set.size === 0) set.add("text");
    return Array.from(set);
  }

  /**
   * Normalizes capability tags
   */
  static normalizeCapabilities(tags: string[] | string | undefined): string[] {
    if (!tags) return ["chat"];
    const array = Array.isArray(tags) ? tags : tags.split(/[,\s+]+/);
    const normalized = new Set<string>();

    for (const t of array) {
      const lower = t.toLowerCase().trim();
      if (lower.includes("func") || lower.includes("tool")) normalized.add("function-calling");
      else if (lower.includes("vision")) normalized.add("vision");
      else if (lower.includes("json") || lower.includes("struct")) normalized.add("json");
      else if (lower.includes("reason") || lower.includes("cot")) normalized.add("reasoning");
      else if (lower.includes("code") || lower.includes("dev")) normalized.add("coding");
      else if (lower.includes("audio")) normalized.add("audio");
      else if (lower.includes("rag") || lower.includes("cite")) normalized.add("rag");
      else if (lower.length > 2) normalized.add(lower);
    }

    if (normalized.size === 0) normalized.add("chat");
    return Array.from(normalized);
  }

  /**
   * Normalizes benchmark score to a 0-100 scale for comparison
   */
  static normalizeBenchmarkScore(score: number, maxValue: number, metric: string): number {
    if (metric === "Elo") {
      // Chatbot arena Elo baseline ~1000 to 1450
      const baseline = 1000;
      const normalized = ((score - baseline) / (maxValue - baseline)) * 100;
      return Math.min(100, Math.max(0, Math.round(normalized * 10) / 10));
    }
    // Percentage or standard ratio
    const normalized = (score / maxValue) * 100;
    return Math.min(100, Math.max(0, Math.round(normalized * 10) / 10));
  }

  /**
   * Calculates monthly cost based on prompt & completion token volume
   */
  static calculateMonthlyCost(
    promptTokens: number,
    completionTokens: number,
    requestsPerMonth: number,
    inputPricePerMillion: number,
    outputPricePerMillion: number
  ): {
    monthlyInputCost: number;
    monthlyOutputCost: number;
    totalMonthlyCost: number;
    totalTokens: number;
  } {
    const totalPromptTokens = promptTokens * requestsPerMonth;
    const totalCompletionTokens = completionTokens * requestsPerMonth;
    
    const monthlyInputCost = (totalPromptTokens / 1_000_000) * inputPricePerMillion;
    const monthlyOutputCost = (totalCompletionTokens / 1_000_000) * outputPricePerMillion;
    const totalMonthlyCost = Math.round((monthlyInputCost + monthlyOutputCost) * 100) / 100;

    return {
      monthlyInputCost: Math.round(monthlyInputCost * 100) / 100,
      monthlyOutputCost: Math.round(monthlyOutputCost * 100) / 100,
      totalMonthlyCost,
      totalTokens: totalPromptTokens + totalCompletionTokens,
    };
  }
}
