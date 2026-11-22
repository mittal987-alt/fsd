export const dynamic = 'force-dynamic'
import { NextRequest } from "next/server";
import { DataStore } from "@/lib/data-store";
import { isDatabaseConnected } from "@/lib/prisma";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  const startTime = performance.now();
  try {
    const [stats, dbConnected] = await Promise.all([
      DataStore.getPlatformStats(),
      isDatabaseConnected(),
    ]);

    return successResponse(
      {
        ...stats,
        database: {
          connected: dbConnected,
          type: "postgresql",
          mode: dbConnected ? "live" : "in-memory-repository",
        },
        api: {
          version: "v1",
          environment: process.env.NODE_ENV ?? "development",
        },
      },
      undefined,
      { startTime }
    );
  } catch (error) {
    return handleApiError(error, startTime);
  }
}
