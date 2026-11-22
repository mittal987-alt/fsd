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
    const company = await DataStore.getCompanyBySlug(slug);

    if (!company) {
      return errorResponse(`Company with slug '${slug}' not found`, 404, "NOT_FOUND", undefined, startTime);
    }

    return successResponse(company, undefined, { startTime });
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
