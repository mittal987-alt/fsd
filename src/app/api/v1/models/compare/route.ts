export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { CompareQuerySchema } from "@/lib/validations/api-schemas";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    const modelsParam = request.nextUrl.searchParams.get("models") || "";
    const validated = CompareQuerySchema.parse({ models: modelsParam });

    const result = await DataStore.compareModels(validated.models);
    return successResponse(result, undefined, { startTime });
  } catch (error) {
    return handleApiError(error, startTime);
  }
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const body = await request.json();
    const validated = CompareQuerySchema.parse(body);

    const result = await DataStore.compareModels(validated.models);
    return successResponse(result, undefined, { startTime });
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
