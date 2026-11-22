import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  const startTime = performance.now();
  try {
    const benchmarks = await DataStore.getBenchmarks();
    return successResponse(benchmarks, { total: benchmarks.length }, { startTime });
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
