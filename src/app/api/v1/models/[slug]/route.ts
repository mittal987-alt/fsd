export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const startTime = performance.now();
  try {
    const { slug } = await context.params;
    if (!slug) {
      return errorResponse("Model slug is required", 400, "MISSING_SLUG", undefined, startTime);
    }

    const model = await DataStore.getModelBySlug(slug);
    if (!model) {
      return errorResponse(`Model with slug '${slug}' not found`, 404, "MODEL_NOT_FOUND", undefined, startTime);
    }

    return successResponse(model, undefined, { startTime });
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
