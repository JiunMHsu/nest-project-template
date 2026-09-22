import { describe, expect, it } from 'vitest';

import { RandomString } from '@commons/utils/random-string.util';

const ALPHABETIC = /^[A-Za-z]+$/;
const ALPHANUMERIC = /^[A-Za-z0-9]+$/;
const NUMERIC = /^[0-9]+$/;
const EVERY_SET = /^[A-Za-z0-9!@#$%^&*()_+]+$/;

describe('RandomString', () => {
    describe('generate', () => {
        it('should default to 16 characters', () => {
            expect(RandomString.generate()).toHaveLength(16);
        });

        it('should default to letters only', () => {
            expect(RandomString.generate()).toMatch(ALPHABETIC);
        });

        it('should honour the requested length', () => {
            expect(RandomString.generate({ length: 6 })).toHaveLength(6);
        });

        it('should honour the requested character set', () => {
            expect(RandomString.generate({ with: ['digits'], length: 6 })).toMatch(NUMERIC);
        });

        it('should combine several character sets', () => {
            expect(RandomString.generate({ with: ['digits', 'lowercase'], length: 40 })).toMatch(/^[a-z0-9]{40}$/);
        });

        it('should be empty when no character set is given', () => {
            expect(RandomString.generate({ with: [] })).toBe('');
        });

        it('should be empty for zero length', () => {
            expect(RandomString.generate({ length: 0 })).toBe('');
        });

        it('should be empty for a negative length', () => {
            expect(RandomString.generate({ length: -5 })).toBe('');
        });

        it('should not repeat itself between calls', () => {
            expect(RandomString.generate({ length: 32 })).not.toBe(RandomString.generate({ length: 32 }));
        });
    });

    describe('generateAlphabetic', () => {
        it('should contain only letters', () => {
            expect(RandomString.generateAlphabetic(10)).toMatch(ALPHABETIC);
        });

        it('should honour the requested length', () => {
            expect(RandomString.generateAlphabetic(10)).toHaveLength(10);
        });

        it('should default to 16 characters', () => {
            expect(RandomString.generateAlphabetic()).toHaveLength(16);
        });
    });

    describe('generateAlphanumeric', () => {
        it('should contain only letters and digits', () => {
            expect(RandomString.generateAlphanumeric(12)).toMatch(ALPHANUMERIC);
        });

        it('should honour the requested length', () => {
            expect(RandomString.generateAlphanumeric(12)).toHaveLength(12);
        });
    });

    describe('generateNumeric', () => {
        it('should contain only digits', () => {
            expect(RandomString.generateNumeric(6)).toMatch(NUMERIC);
        });

        it('should honour the requested length', () => {
            expect(RandomString.generateNumeric(6)).toHaveLength(6);
        });
    });

    describe('generateSecure', () => {
        it('should honour the requested length', () => {
            expect(RandomString.generateSecure(32)).toHaveLength(32);
        });

        it('should default to 16 characters', () => {
            expect(RandomString.generateSecure()).toHaveLength(16);
        });

        it('should draw only from the known character sets', () => {
            expect(RandomString.generateSecure(64)).toMatch(EVERY_SET);
        });

        it('should be empty for zero length', () => {
            expect(RandomString.generateSecure(0)).toBe('');
        });

        it('should be empty for a negative length', () => {
            expect(RandomString.generateSecure(-5)).toBe('');
        });

        it('should not repeat itself between calls', () => {
            expect(RandomString.generateSecure(32)).not.toBe(RandomString.generateSecure(32));
        });
    });
});
