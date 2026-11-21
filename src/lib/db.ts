// ==============================================================================
// KAABIL (काबिल) — Singleton Prisma Database Client
// Universal Career, Education, Skill Development & Employment Ecosystem
// ==============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

export const prisma = db;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

let cachedConnectionStatus: {
  connected: boolean;
  message: string;
  checkedAt: number;
} | null = null;

const CACHE_TTL_MS = 5000; // Cache connection status for 5 seconds

/**
 * Check whether the active PostgreSQL database connection is operational.
 * Does not throw; returns a boolean status and error details if disconnected.
 * Times out within 2.5 seconds to avoid blocking page renders.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  const now = Date.now();
  if (
    cachedConnectionStatus &&
    now - cachedConnectionStatus.checkedAt < CACHE_TTL_MS
  ) {
    return {
      connected: cachedConnectionStatus.connected,
      message: cachedConnectionStatus.message,
    };
  }

  try {
    // Quick probe with timeout
    const timeoutPromise = new Promise<{ connected: false; message: string }>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error("Database connection probe timed out (2500ms)")),
          2500
        )
    );

    const queryPromise = db.$queryRaw`SELECT 1`.then(() => ({
      connected: true,
      message: "PostgreSQL connection successfully established.",
    }));

    const result = (await Promise.race([
      queryPromise,
      timeoutPromise,
    ])) as { connected: boolean; message: string };

    cachedConnectionStatus = { ...result, checkedAt: now };
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    const failureResult = {
      connected: false,
      message: `Database unreachable or unconfigured: ${err.message}`,
    };
    cachedConnectionStatus = { ...failureResult, checkedAt: now };
    return failureResult;
  }
}
