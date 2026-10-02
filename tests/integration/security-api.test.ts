import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Security & Middleware Integration Tests', () => {
  describe('In-Memory Rate Limiter', () => {
    it('should allow requests within limit and block when exceeded', () => {
      const testIp = '192.168.1.100';
      const config = { maxRequests: 5, windowSeconds: 60 };

      // First 5 requests should pass
      for (let i = 0; i < config.maxRequests; i++) {
        const result = checkRateLimit(`test-route-${testIp}`, config);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be rate limited
      const exceededResult = checkRateLimit(`test-route-${testIp}`, config);
      expect(exceededResult.allowed).toBe(false);
      expect(exceededResult.remaining).toBe(0);
    });

    it('should isolate rate limits across different client IP keys', () => {
      const ipA = '10.0.0.1';
      const ipB = '10.0.0.2';
      const config = { maxRequests: 2, windowSeconds: 60 };

      // Exhaust IP A
      checkRateLimit(`test-iso-${ipA}`, config);
      checkRateLimit(`test-iso-${ipA}`, config);
      const resA = checkRateLimit(`test-iso-${ipA}`, config);
      expect(resA.allowed).toBe(false);

      // IP B should still be allowed
      const resB = checkRateLimit(`test-iso-${ipB}`, config);
      expect(resB.allowed).toBe(true);
    });
  });

  describe('Strict Booking Time Slot Overlap Logic', () => {
    // Helper replicating overlap detection
    const isOverlapping = (
      start1: string, end1: string,
      start2: string, end2: string
    ) => {
      return start1 < end2 && end1 > start2;
    };

    it('should correctly detect overlapping time slots', () => {
      // 10:00 - 11:30 and 11:00 - 12:00 -> Overlap
      expect(isOverlapping('10:00', '11:30', '11:00', '12:00')).toBe(true);

      // 10:00 - 11:00 and 11:00 - 12:00 -> Adjacent, NO overlap
      expect(isOverlapping('10:00', '11:00', '11:00', '12:00')).toBe(false);

      // 09:00 - 12:00 engulfs 10:00 - 11:00 -> Overlap
      expect(isOverlapping('09:00', '12:00', '10:00', '11:00')).toBe(true);
    });
  });
});
