export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { isDatabaseConnected } from "@/lib/prisma";

export async function GET() {
  const dbOk = await isDatabaseConnected();
  const status = dbOk ? "healthy" : "degraded";

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbOk ? "connected" : "unavailable (using in-memory repository)",
        api: "operational",
      },
    },
    { status: dbOk ? 200 : 207 }
  );
}
