// tests/unit/helpers/date.helper.spec.ts
import { describe, it, expect } from 'vitest';
import {
  getStartOfWeek,
  getEndOfWeek,
  getWeekDisplay,
  isSameDay,
  formatDate,
  calculateDuration,
} from '@/helpers/date.helper';

describe('date.helper', () => {
  describe('getStartOfWeek', () => {
    it('returns Monday 00:00:00 for mid-week date', () => {
      // Wednesday Oct 28, 2026
      const date = new Date('2026-10-28T15:20:00');
      const start = getStartOfWeek(date);

      expect(start.getDay()).toBe(1); // Monday
      expect(start.getDate()).toBe(26);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });

    it('returns previous Monday when the given date is Sunday', () => {
      // Sunday Nov 1, 2026
      const sunday = new Date('2026-11-01T12:00:00');
      const start = getStartOfWeek(sunday);

      expect(start.getDay()).toBe(1); // Monday
      expect(start.getDate()).toBe(26); // Oct 26
      expect(start.getMonth()).toBe(9); // October (0-indexed)
    });
  });

  describe('getEndOfWeek', () => {
    it('returns Sunday 23:59:59.999 for mid-week date', () => {
      const date = new Date('2026-10-26T15:20:00');
      const end = getEndOfWeek(date);

      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getDate()).toBe(1); // Nov 1
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe('getWeekDisplay', () => {
    it('formats a date range within the same month', () => {
      const start = new Date(2026, 9, 5); // Oct 5, 2026
      const end = new Date(2026, 9, 11);  // Oct 11, 2026
      const result = getWeekDisplay(start, end);

      expect(result).toBe('Oct 5 - 11, 2026');
    });

    it('formats a date range across month boundaries', () => {
      const start = new Date(2026, 9, 26); // Oct 26, 2026
      const end = new Date(2026, 10, 1);   // Nov 1, 2026
      const result = getWeekDisplay(start, end);

      expect(result).toBe('Oct 26 - Nov 1, 2026');
    });
  });

  describe('isSameDay', () => {
    it('returns true when dates have identical calendar day', () => {
      const d1 = new Date('2026-10-28T08:00:00');
      const d2 = new Date('2026-10-28T22:30:00');
      expect(isSameDay(d1, d2)).toBe(true);
    });

    it('returns false when dates have different days', () => {
      const d1 = new Date('2026-10-28T08:00:00');
      const d2 = new Date('2026-10-29T08:00:00');
      expect(isSameDay(d1, d2)).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('returns empty string when date is empty or invalid', () => {
      expect(formatDate('')).toBe('');
    });

    it('formats ISO string into weekday, month, day', () => {
      const formatted = formatDate('2026-10-28T12:00:00Z');
      expect(formatted).toContain('Wednesday');
      expect(formatted).toContain('Oct');
      expect(formatted).toContain('28');
    });
  });

  describe('calculateDuration', () => {
    it('calculates duration in minutes accurately', () => {
      const start = '2026-10-28T10:00:00.000Z';
      const end = '2026-10-28T10:45:00.000Z';
      expect(calculateDuration(start, end)).toBe(45);
    });

    it('returns 0 when timestamps are missing', () => {
      expect(calculateDuration('', '2026-10-28T10:00:00.000Z')).toBe(0);
    });
  });
});
