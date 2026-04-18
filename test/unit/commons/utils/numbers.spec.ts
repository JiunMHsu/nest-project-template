import { describe, expect, it } from 'vitest';
import { roundTo, roundToDefault, roundToTwoDecimals, sequence } from '@commons/utils/numbers.util';

describe('roundTo', () => {
    it('rounds to the specified decimal places', () => {
        expect(roundTo(3.14159, 2)).toBe(3.14);
        expect(roundTo(3.14159, 4)).toBe(3.1416);
        expect(roundTo(3.14159, 0)).toBe(3);
    });

    it('rounds halves up', () => {
        expect(roundTo(1.5, 0)).toBe(2);
        expect(roundTo(2.5, 0)).toBe(3);
    });

    it('handles negative numbers', () => {
        expect(roundTo(-3.14159, 2)).toBe(-3.14);
    });

    it('handles zero decimal places', () => {
        expect(roundTo(10.9, 0)).toBe(11);
    });

    it('returns integer unchanged when decimalPlaces covers full precision', () => {
        expect(roundTo(5, 2)).toBe(5);
    });
});

describe('roundToDefault', () => {
    it('rounds to 4 decimal places', () => {
        expect(roundToDefault(1.23456789)).toBe(1.2346);
        expect(roundToDefault(3.14159265)).toBe(3.1416);
    });

    it('throws on null input', () => {
        expect(() => roundToDefault(null as unknown as number)).toThrow('Invalid number');
    });

    it('throws on undefined input', () => {
        expect(() => roundToDefault(undefined as unknown as number)).toThrow('Invalid number');
    });

    it('returns 0 for 0 input', () => {
        expect(roundToDefault(0)).toBe(0);
    });
});

describe('roundToTwoDecimals', () => {
    it('rounds to 2 decimal places', () => {
        expect(roundToTwoDecimals(10.9876)).toBe(10.99);
        expect(roundToTwoDecimals(1.234)).toBe(1.23);
    });

    it('throws on null input', () => {
        expect(() => roundToTwoDecimals(null as unknown as number)).toThrow('Invalid number');
    });

    it('throws on undefined input', () => {
        expect(() => roundToTwoDecimals(undefined as unknown as number)).toThrow('Invalid number');
    });

    it('returns exact value when already at 2 decimals', () => {
        expect(roundToTwoDecimals(1.23)).toBe(1.23);
    });
});

describe('sequence', () => {
    it('generates inclusive range', () => {
        expect(sequence(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('generates single-element range when start equals end', () => {
        expect(sequence(3, 3)).toEqual([3]);
    });

    it('returns empty array when start > end', () => {
        expect(sequence(5, 1)).toEqual([]);
    });

    it('handles zero', () => {
        expect(sequence(0, 3)).toEqual([0, 1, 2, 3]);
    });

    it('handles negative numbers', () => {
        expect(sequence(-2, 2)).toEqual([-2, -1, 0, 1, 2]);
    });
});
