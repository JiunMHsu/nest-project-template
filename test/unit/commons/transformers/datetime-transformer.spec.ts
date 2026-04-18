import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { TransformToUTC } from '@commons/transformers/datetime.transformer';

class TestDto {
    @TransformToUTC()
    date?: Date;
}

function transform(value: unknown): Date | undefined {
    const instance = plainToInstance(TestDto, { date: value });
    return instance.date;
}

describe('TransformToUTC', () => {
    it('returns undefined for falsy input (undefined)', () => {
        expect(transform(undefined)).toBeUndefined();
    });

    it('returns undefined for null', () => {
        expect(transform(null)).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
        expect(transform('')).toBeUndefined();
    });

    it('parses Buenos Aires ISO string and converts to UTC Date', () => {
        // Buenos Aires is UTC-3. 09:00 BA = 12:00 UTC
        const result = transform('2024-07-01T09:00:00');
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe('2024-07-01T12:00:00.000Z');
    });

    it('passes through an existing Date object with the same value', () => {
        const date = new Date('2024-07-01T12:00:00.000Z');
        const result = transform(date);
        // plainToInstance creates a new instance, so reference equality doesn't hold —
        // the transformer returns the same Date value, not necessarily the same object.
        expect(result).toStrictEqual(date);
    });

    it('throws when string includes Z suffix (UTC timezone)', () => {
        expect(() => transform('2024-07-01T12:00:00Z')).toThrow(
            'Date must not include timezone. Provide local Buenos Aires time only.',
        );
    });

    it('throws when string includes +HH:MM offset', () => {
        expect(() => transform('2024-07-01T09:00:00-03:00')).toThrow(
            'Date must not include timezone. Provide local Buenos Aires time only.',
        );
    });

    it('throws for invalid date format', () => {
        expect(() => transform('not-a-date')).toThrow('Invalid date format');
    });
});
