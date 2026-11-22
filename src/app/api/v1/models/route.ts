export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { ModelQuerySchema } from "@/lib/validations/api-schemas";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedParams = ModelQuerySchema.parse(searchParams);

    const result = await DataStore.getModels(validatedParams);

    return successResponse(
      result.models,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasMore: result.page < result.totalPages,
        facets: result.facets,
      },
      { startTime }
    );
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
