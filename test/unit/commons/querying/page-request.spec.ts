import { describe, expect, it } from 'vitest';
import { PageRequest } from '@commons/querying/page.request';

describe('PageRequest', () => {
    describe('constructor', () => {
        it('uses defaults when called with no args', () => {
            const p = new PageRequest();
            expect(p.page).toBe(0);
            expect(p.size).toBe(20);
            expect(p.offset).toBe(0);
        });

        it('computes offset correctly', () => {
            const p = new PageRequest(3, 10);
            expect(p.offset).toBe(30);
        });

        it('accepts page=0', () => {
            const p = new PageRequest(0, 10);
            expect(p.page).toBe(0);
        });

        it('throws when page is negative', () => {
            expect(() => new PageRequest(-1, 10)).toThrow('Page index must not be less than zero');
        });

        it('throws when size is zero', () => {
            expect(() => new PageRequest(0, 0)).toThrow('Page size must not be less than one');
        });

        it('throws when size is negative', () => {
            expect(() => new PageRequest(0, -5)).toThrow('Page size must not be less than one');
        });

        it('throws when size exceeds maximum (100)', () => {
            expect(() => new PageRequest(0, 101)).toThrow('Page size must not be greater than 100');
        });

        it('accepts size of exactly 100', () => {
            const p = new PageRequest(0, 100);
            expect(p.size).toBe(100);
        });

        it('accepts size of exactly 1', () => {
            const p = new PageRequest(0, 1);
            expect(p.size).toBe(1);
        });
    });
});
