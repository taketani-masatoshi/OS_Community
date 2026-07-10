import { prisma } from "@/lib/prisma";

export function isPrismaConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "PrismaClientInitializationError") return true;
  const message = error.message;
  return (
    message.includes("Can't reach database server") ||
    message.includes("Connection refused") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("P1001") ||
    message.includes("P1002") ||
    message.includes("P1008") ||
    message.includes("P1017")
  );
}

/** Returns true when PostgreSQL accepts a simple query. */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    if (isPrismaConnectionError(error)) return false;
    throw error;
  }
}

export type DatabaseHealth = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
};

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : "database unreachable",
      };
    }
    throw error;
  }
}
