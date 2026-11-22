import { NextRequest } from "next/server";
import { IngestionService } from "@/lib/ingestion/sync";
import { SyncPayloadSchema } from "@/lib/validations/api-schemas";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    let payload = { source: "openrouter" as const, limit: 25 };
    try {
      const body = await request.json();
      payload = SyncPayloadSchema.parse(body);
    } catch {
      // Use defaults if empty body
    }

    const result = await IngestionService.syncFromOpenRouter(payload.limit ?? 25);

    return successResponse(
      result,
      undefined,
      { startTime }
    );
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
