import { NextResponse } from "next/server";
import { config } from "@/config/env";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: "0.1.0",
  });
}
