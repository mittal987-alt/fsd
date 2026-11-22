export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  const startTime = performance.now();
  try {
    const providers = await DataStore.getProviders();
    return successResponse(providers, { total: providers.length }, { startTime });
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
