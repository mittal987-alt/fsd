import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse } from "@/types";

export function successResponse<T>(
  data: T,
  meta?: ApiResponse["meta"],
  init?: { status?: number; headers?: HeadersInit; startTime?: number }
): NextResponse<ApiResponse<T>> {
  const executionTimeMs = init?.startTime ? Math.round(performance.now() - init.startTime) : undefined;
  
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
    executionTimeMs,
  };

  const responseHeaders = new Headers(init?.headers);
  responseHeaders.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  if (executionTimeMs !== undefined) {
    responseHeaders.set("Server-Timing", `total;dur=${executionTimeMs}`);
  }

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: responseHeaders,
  });
}

export function errorResponse(
  message: string,
  statusCode = 400,
  code = "BAD_REQUEST",
  details?: unknown,
  startTime?: number
): NextResponse<ApiResponse<never>> {
  const executionTimeMs = startTime ? Math.round(performance.now() - startTime) : undefined;
  
  const body: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    executionTimeMs,
  };

  return NextResponse.json(body, {
    status: statusCode,
  });
}

export function handleApiError(error: unknown, startTime?: number): NextResponse<ApiResponse<never>> {
  console.error("[API Error]", error);

  if (error instanceof ZodError) {
    return errorResponse(
      "Validation error on request parameters",
      422,
      "VALIDATION_ERROR",
      error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      })),
      startTime
    );
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500, "INTERNAL_SERVER_ERROR", undefined, startTime);
  }

  return errorResponse("An unexpected server error occurred", 500, "UNKNOWN_ERROR", undefined, startTime);
}
