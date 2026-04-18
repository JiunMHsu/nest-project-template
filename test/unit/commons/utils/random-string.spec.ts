import { describe, expect, it } from 'vitest';
import { RandomString } from '@commons/utils/random-string.util';

const UPPERCASE = /^[A-Z]+$/;
const LOWERCASE = /^[a-z]+$/;
const DIGITS = /^[0-9]+$/;
const ALPHANUMERIC = /^[a-zA-Z0-9]+$/;
const ALPHABETIC = /^[a-zA-Z]+$/;
const SECURE = /^[a-zA-Z0-9!@#$%^&*()_+]+$/;

describe('RandomString', () => {
    describe('generate', () => {
        it('generates string of default length (16)', () => {
            expect(RandomString.generate().length).toBe(16);
        });

        it('generates string of specified length', () => {
            expect(RandomString.generate({ length: 8 }).length).toBe(8);
        });

        it('uses uppercase and lowercase by default', () => {
            const result = RandomString.generate({ length: 100 });
            expect(ALPHABETIC.test(result)).toBe(true);
        });

        it('generates only digits when configured', () => {
            const result = RandomString.generate({ with: ['digits'], length: 20 });
            expect(DIGITS.test(result)).toBe(true);
        });

        it('generates only uppercase when configured', () => {
            const result = RandomString.generate({ with: ['uppercase'], length: 20 });
            expect(UPPERCASE.test(result)).toBe(true);
        });

        it('generates only lowercase when configured', () => {
            const result = RandomString.generate({ with: ['lowercase'], length: 20 });
            expect(LOWERCASE.test(result)).toBe(true);
        });

        it('returns empty string for length 0', () => {
            expect(RandomString.generate({ length: 0 })).toBe('');
        });

        it('returns empty string when no char sets given', () => {
            expect(RandomString.generate({ with: [] })).toBe('');
        });
    });

    describe('generateAlphabetic', () => {
        it('contains only letters', () => {
            const result = RandomString.generateAlphabetic(50);
            expect(ALPHABETIC.test(result)).toBe(true);
        });

        it('uses default length of 16', () => {
            expect(RandomString.generateAlphabetic().length).toBe(16);
        });
    });

    describe('generateAlphanumeric', () => {
        it('contains only letters and digits', () => {
            const result = RandomString.generateAlphanumeric(50);
            expect(ALPHANUMERIC.test(result)).toBe(true);
        });

        it('uses default length of 16', () => {
            expect(RandomString.generateAlphanumeric().length).toBe(16);
        });
    });

    describe('generateNumeric', () => {
        it('contains only digits', () => {
            const result = RandomString.generateNumeric(20);
            expect(DIGITS.test(result)).toBe(true);
        });

        it('uses default length of 16', () => {
            expect(RandomString.generateNumeric().length).toBe(16);
        });
    });

    describe('generateSecure', () => {
        it('contains only expected character classes', () => {
            const result = RandomString.generateSecure(100);
            expect(SECURE.test(result)).toBe(true);
        });

        it('uses default length of 16', () => {
            expect(RandomString.generateSecure().length).toBe(16);
        });
    });
});
