import {
  formatDateTime,
  formatRelativeDeadline,
  roundUpToQuarterHour,
  isOverdue,
} from '../src/utils/date';

const FIXED_NOW = new Date('2026-09-02T16:00:00.000Z'); // Wednesday

describe('date utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDateTime', () => {
    it('labels a same-day time as Today', () => {
      const later = new Date(FIXED_NOW.getTime() + 2 * 3_600_000).toISOString();
      expect(formatDateTime(later)).toMatch(/^Today, /);
    });

    it('labels the next calendar day as Tomorrow, even just after midnight', () => {
      const justAfterMidnight = new Date(
        FIXED_NOW.getFullYear(), FIXED_NOW.getMonth(), FIXED_NOW.getDate() + 1, 0, 5,
      ).toISOString();
      expect(formatDateTime(justAfterMidnight)).toMatch(/^Tomorrow, /);
    });

    it('labels a day 3 days out with a weekday name', () => {
      const threeDaysOut = new Date(FIXED_NOW.getTime() + 3 * 86_400_000).toISOString();
      expect(formatDateTime(threeDaysOut)).toMatch(/^[A-Za-z]{3}, /);
    });

    it('labels a day far in the future with "D Mon" format', () => {
      const farOut = new Date(FIXED_NOW.getTime() + 40 * 86_400_000).toISOString();
      expect(formatDateTime(farOut)).toMatch(/^\d{1,2} [A-Za-z]{3}, /);
    });
  });

  describe('formatRelativeDeadline', () => {
    it('reports hours left for a same-day deadline', () => {
      const in2h = new Date(FIXED_NOW.getTime() + 2 * 3_600_000).toISOString();
      expect(formatRelativeDeadline(in2h, FIXED_NOW)).toBe('2h left');
    });

    it('reports days for a multi-day deadline', () => {
      const in3d = new Date(FIXED_NOW.getTime() + 3 * 86_400_000).toISOString();
      expect(formatRelativeDeadline(in3d, FIXED_NOW)).toBe('in 3 days');
    });

    it('reports overdue in days once more than 24h late', () => {
      const threeDaysLate = new Date(FIXED_NOW.getTime() - 3 * 86_400_000).toISOString();
      expect(formatRelativeDeadline(threeDaysLate, FIXED_NOW)).toBe('3d overdue');
    });

    it('reports "due now" within a minute of the deadline', () => {
      const almostNow = new Date(FIXED_NOW.getTime() + 10_000).toISOString();
      expect(formatRelativeDeadline(almostNow, FIXED_NOW)).toBe('due now');
    });
  });

  describe('roundUpToQuarterHour', () => {
    it('rounds up to the next 15-minute boundary', () => {
      const d = new Date('2026-09-02T16:07:00.000Z');
      const rounded = roundUpToQuarterHour(d);
      expect(rounded.toISOString()).toBe('2026-09-02T16:15:00.000Z');
    });

    it('leaves an exact boundary unchanged', () => {
      const d = new Date('2026-09-02T16:30:00.000Z');
      const rounded = roundUpToQuarterHour(d);
      expect(rounded.toISOString()).toBe('2026-09-02T16:30:00.000Z');
    });
  });

  describe('isOverdue', () => {
    it('is true for a past deadline', () => {
      expect(isOverdue('2026-09-01T00:00:00.000Z', FIXED_NOW)).toBe(true);
    });

    it('is false for a future deadline', () => {
      expect(isOverdue('2026-09-05T00:00:00.000Z', FIXED_NOW)).toBe(false);
    });
  });
});
