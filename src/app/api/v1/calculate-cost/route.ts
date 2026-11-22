import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { CostCalculationSchema } from "@/lib/validations/api-schemas";
import { ModelDataNormalizer } from "@/lib/ingestion/normalizer";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const body = await request.json();
    const validated = CostCalculationSchema.parse(body);

    const model = await DataStore.getModelBySlug(validated.modelSlug);
    if (!model) {
      return errorResponse(`Model '${validated.modelSlug}' not found`, 404, "NOT_FOUND", undefined, startTime);
    }

    let inputPrice = model.inputPricePerMillion;
    let outputPrice = model.outputPricePerMillion;

    if (validated.providerSlug && model.offerings) {
      const offering = model.offerings.find((o) => o.provider?.slug === validated.providerSlug);
      if (offering) {
        inputPrice = offering.inputPricePerMillion;
        outputPrice = offering.outputPricePerMillion;
      }
    }

    const costBreakdown = ModelDataNormalizer.calculateMonthlyCost(
      validated.promptTokens,
      validated.completionTokens,
      validated.requestsPerMonth,
      inputPrice,
      outputPrice
    );

    return successResponse(
      {
        model: {
          slug: model.slug,
          name: model.name,
          inputPricePerMillion: inputPrice,
          outputPricePerMillion: outputPrice,
        },
        inputs: validated,
        calculation: costBreakdown,
      },
      undefined,
      { startTime }
    );
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
