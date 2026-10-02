import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Input Validation & Utility Tests', () => {
  describe('Phone Number Formatting & Validation', () => {
    const sanitizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

    it('should strip non-numeric characters except leading plus', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('+15551234567');
      expect(sanitizePhone('555-123-4567')).toBe('5551234567');
      expect(sanitizePhone('555.123.4567')).toBe('5551234567');
      expect(sanitizePhone('5551234567<script>')).toBe('5551234567');
    });

    it('should validate phone minimum length requirement', () => {
      const isValid = (phone: string) => sanitizePhone(phone).length >= 10;
      expect(isValid('5551234567')).toBe(true);
      expect(isValid('123456')).toBe(false);
    });
  });

  describe('Password Hashing & Verification', () => {
    it('should securely hash passwords and verify matching credentials', async () => {
      const rawPassword = 'SecureAdminPassword123!';
      const hash = await bcrypt.hash(rawPassword, 12);

      expect(hash).not.toBe(rawPassword);
      expect(await bcrypt.compare(rawPassword, hash)).toBe(true);
      expect(await bcrypt.compare('WrongPassword123!', hash)).toBe(false);
    });
  });

  describe('XSS Input Sanitization', () => {
    const sanitizeInput = (str: string) => 
      str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

    it('should escape HTML tags to prevent XSS payloads', () => {
      const dangerous = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(dangerous);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape malicious event handlers in tags', () => {
      const imgXss = '<img src=x onerror=alert(1)>';
      expect(sanitizeInput(imgXss)).not.toContain('<img');
    });
  });

  describe('Path Traversal Prevention', () => {
    const sanitizeFilename = (filename: string) => {
      return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\./g, '');
    };

    it('should remove relative directory path traversal sequences', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('___etc_passwd');
      expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('__windows_system32');
      expect(sanitizeFilename('valid-image.jpg')).toBe('valid-image.jpg');
    });
  });
});
