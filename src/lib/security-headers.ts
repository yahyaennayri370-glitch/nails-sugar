/**
 * Security headers configuration.
 *
 * Applied via Next.js middleware to all responses.
 * Each header is chosen to mitigate specific attack vectors
 * without breaking legitimate functionality.
 */

export const securityHeaders: Record<string, string> = {
  /**
   * Content-Security-Policy: Prevents XSS by restricting resource origins.
   * - default-src 'self': Only allow same-origin by default
   * - script-src 'self' 'unsafe-inline' 'unsafe-eval': Required for Next.js hydration
   * - style-src 'self' 'unsafe-inline' https://fonts.googleapis.com: CSS + Google Fonts
   * - font-src 'self' https://fonts.gstatic.com: Google Fonts files
   * - img-src 'self' data: blob:: Allow same-origin + data URIs for inline images
   * - connect-src 'self': API calls to same origin
   * - frame-ancestors 'none': Prevent clickjacking
   */
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",

  /** Enforce HTTPS (1 year, include subdomains) */
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  /** Prevent MIME-type sniffing */
  'X-Content-Type-Options': 'nosniff',

  /** Control referrer information leakage */
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  /** Restrict browser features/permissions */
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  /** Prevent framing (defense in depth alongside CSP frame-ancestors) */
  'X-Frame-Options': 'DENY',

  /** Tell browsers not to cache sensitive pages */
  'X-XSS-Protection': '0', // Disabled — modern CSP is more effective and X-XSS-Protection can introduce vulnerabilities
};

/**
 * Headers specifically for API routes — adds no-cache to prevent
 * browsers/proxies from caching authenticated API responses.
 */
export const apiSecurityHeaders: Record<string, string> = {
  ...securityHeaders,
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
};
