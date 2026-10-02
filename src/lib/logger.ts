/**
 * Production-safe structured logger.
 *
 * - Logs JSON in production for machine parsing
 * - Logs human-readable format in development
 * - NEVER logs passwords, tokens, or sensitive data
 * - Automatically redacts known sensitive field names
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'session',
  'creditcard',
  'credit_card',
  'cvv',
  'ssn',
  'apikey',
  'api_key',
  'nextauth_secret',
  'database_url',
]);

function redactValue(key: string, value: unknown): unknown {
  if (typeof key === 'string' && SENSITIVE_KEYS.has(key.toLowerCase())) {
    return '[REDACTED]';
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return redactObject(value as Record<string, unknown>);
  }
  return value;
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    redacted[key] = redactValue(key, value);
  }
  return redacted;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    Object.assign(entry, redactObject(meta));
  }

  return entry;
}

function output(entry: LogEntry): void {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    // JSON for production log aggregators
    const fn = entry.level === 'error' ? console.error
      : entry.level === 'warn' ? console.warn
      : console.log;
    fn(JSON.stringify(entry));
  } else {
    // Human-readable for development
    const prefix = `[${entry.level.toUpperCase()}]`;
    const { level: _l, message, timestamp: _t, ...rest } = entry;
    const metaStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    const fn = entry.level === 'error' ? console.error
      : entry.level === 'warn' ? console.warn
      : console.log;
    fn(`${prefix} ${message}${metaStr}`);
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    output(formatEntry('info', message, meta));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    output(formatEntry('warn', message, meta));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    output(formatEntry('error', message, meta));
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      output(formatEntry('debug', message, meta));
    }
  },

  /** Log an authentication event (success or failure) */
  authEvent(event: 'login_success' | 'login_failure' | 'logout' | 'session_expired', meta?: Record<string, unknown>): void {
    const level: LogLevel = event === 'login_failure' ? 'warn' : 'info';
    output(formatEntry(level, `auth:${event}`, meta));
  },

  /** Log a booking event */
  bookingEvent(event: 'created' | 'updated' | 'cancelled' | 'conflict' | 'error', meta?: Record<string, unknown>): void {
    const level: LogLevel = event === 'error' ? 'error' : event === 'conflict' ? 'warn' : 'info';
    output(formatEntry(level, `booking:${event}`, meta));
  },

  /** Log an API error */
  apiError(endpoint: string, error: unknown, meta?: Record<string, unknown>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    output(formatEntry('error', `api_error:${endpoint}`, {
      ...meta,
      error: errorMessage,
      stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined,
    }));
  },
};
