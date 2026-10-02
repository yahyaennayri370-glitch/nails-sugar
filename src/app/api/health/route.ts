import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const APP_VERSION = process.env.npm_package_version || '0.1.0';

/**
 * GET /api/health — Application health check.
 *
 * Returns a structured response indicating:
 * - Application status
 * - Database connectivity
 * - Version
 * - Environment
 *
 * Does NOT expose sensitive infrastructure information.
 */
export async function GET() {
  const startTime = Date.now();
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    // Simple query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = 'error';
  }

  const totalLatency = Date.now() - startTime;
  const isHealthy = dbStatus === 'ok';

  const response = {
    status: isHealthy ? 'healthy' : 'degraded',
    version: APP_VERSION,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      application: {
        status: 'ok',
        uptime: process.uptime(),
      },
    },
    responseTimeMs: totalLatency,
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
