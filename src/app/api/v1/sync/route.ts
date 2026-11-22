export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { IngestionService } from "@/lib/ingestion/sync";
import { SyncPayloadSchema } from "@/lib/validations/api-schemas";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    let limit = 25;
    try {
      const body = await request.json();
      const parsed = SyncPayloadSchema.parse(body);
      limit = parsed.limit ?? 25;
    } catch {
      // Use defaults if empty body
    }

    const result = await IngestionService.syncFromOpenRouter(limit);

    return successResponse(
      result,
      undefined,
      { startTime }
    );
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
