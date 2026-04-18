import { describe, expect, it } from 'vitest';
import { DateConverter } from '@commons/utils/datetime.util';

describe('DateConverter.toLocalISO', () => {
    it('converts UTC date to Buenos Aires ISO string', () => {
        // Buenos Aires is UTC-3 (no DST). 2024-07-01T12:00:00Z → 2024-07-01T09:00:00.000-03:00
        const utcDate = new Date('2024-07-01T12:00:00.000Z');
        const result = DateConverter.toLocalISO(utcDate);
        expect(result).toBe('2024-07-01T09:00:00.000-03:00');
    });

    it('applies correct UTC-3 offset', () => {
        const utcDate = new Date('2024-01-15T00:00:00.000Z');
        const result = DateConverter.toLocalISO(utcDate);
        // UTC 00:00 → BA 21:00 the previous day (UTC-3)
        expect(result).toBe('2024-01-14T21:00:00.000-03:00');
    });

    it('returns an ISO 8601 formatted string', () => {
        const result = DateConverter.toLocalISO(new Date());
        // ISO 8601 with offset: YYYY-MM-DDTHH:mm:ss.sss±HH:MM
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/);
    });

    it('returns undefined for null input', () => {
        expect(DateConverter.toLocalISO(null)).toBeUndefined();
    });

    it('returns undefined for undefined input', () => {
        expect(DateConverter.toLocalISO(undefined)).toBeUndefined();
    });
});
