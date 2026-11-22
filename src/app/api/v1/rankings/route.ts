export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { RankingQuerySchema } from "@/lib/validations/api-schemas";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validated = RankingQuerySchema.parse(searchParams);

    const rankings = await DataStore.getRankings(validated.category, validated.limit);

    return successResponse(
      rankings,
      {
        total: rankings.length,
      },
      { startTime }
    );
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
