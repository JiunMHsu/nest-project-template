import { describe, expect, it } from 'vitest';

import { DateConverter } from '@commons/utils/datetime.util';

describe('DateConverter', () => {
    describe('toISO', () => {
        it('should convert a date to a UTC ISO 8601 string', () => {
            expect(DateConverter.toISO(new Date('2024-07-01T12:00:00Z'))).toBe('2024-07-01T12:00:00.000Z');
        });

        it('should normalise an offset date to UTC', () => {
            expect(DateConverter.toISO(new Date('2024-07-01T12:00:00+02:00'))).toBe('2024-07-01T10:00:00.000Z');
        });

        it('should convert the epoch rather than treating it as absent', () => {
            expect(DateConverter.toISO(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
        });

        it('should return undefined for null', () => {
            expect(DateConverter.toISO(null)).toBeUndefined();
        });

        it('should return undefined for undefined', () => {
            expect(DateConverter.toISO(undefined)).toBeUndefined();
        });

        it('should throw for an invalid date rather than returning undefined', () => {
            expect(() => DateConverter.toISO(new Date('not a date'))).toThrow(RangeError);
        });
    });
});
