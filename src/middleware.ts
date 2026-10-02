import { NextRequest, NextResponse } from 'next/server';
import { securityHeaders } from '@/lib/security-headers';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Next.js middleware applies:
 * 1. Security headers to all responses
 * 2. Rate limiting on sensitive endpoints
 * 3. Request logging for auth failures
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Apply security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Add no-cache for API responses
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  // Rate limiting for sensitive endpoints
  const ip = getClientIp(req);

  // Login endpoint — strict rate limit
  if (pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
    const result = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.resetIn),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetIn),
          },
        }
      );
    }
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  }

  // Booking creation — moderate rate limit
  if (pathname === '/api/appointments' && req.method === 'POST') {
    const result = checkRateLimit(`booking:${ip}`, RATE_LIMITS.booking);
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Trop de réservations. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.resetIn),
          },
        }
      );
    }
  }

  // Admin API — generous but capped
  if (pathname.startsWith('/api/') && pathname !== '/api/health') {
    const result = checkRateLimit(`api:${ip}`, RATE_LIMITS.general);
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.resetIn),
          },
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|uploads/).*)',
  ],
};
