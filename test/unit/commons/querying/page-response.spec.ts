import { describe, expect, it } from 'vitest';
import { PageResponse } from '@commons/querying/page.response';
import { PageRequest } from '@commons/querying/page.request';

describe('PageResponse', () => {
    const makeResponse = (total = 50, page = 0, size = 10) => new PageResponse([1, 2, 3], page, size, total);

    describe('constructor', () => {
        it('sets all fields correctly', () => {
            const r = makeResponse(50, 0, 10);
            expect(r.page).toBe(0);
            expect(r.size).toBe(10);
            expect(r.total).toBe(50);
            expect(r.totalPages).toBe(5);
            expect(r.data).toEqual([1, 2, 3]);
        });

        it('computes totalPages as ceiling division', () => {
            const r = new PageResponse([], 0, 10, 51);
            expect(r.totalPages).toBe(6);
        });

        it('returns 0 totalPages when total is 0', () => {
            const r = new PageResponse([], 0, 10, 0);
            expect(r.totalPages).toBe(0);
        });
    });

    describe('transform', () => {
        it('transforms data items synchronously', () => {
            const r = new PageResponse([1, 2, 3], 0, 10, 3);
            const mapped = r.transform(n => n * 2);
            expect(mapped.data).toEqual([2, 4, 6]);
        });

        it('preserves page metadata after transform', () => {
            const r = new PageResponse([1, 2, 3], 2, 15, 45);
            const mapped = r.transform(n => String(n));
            expect(mapped.page).toBe(2);
            expect(mapped.size).toBe(15);
            expect(mapped.total).toBe(45);
            expect(mapped.totalPages).toBe(3);
        });
    });

    describe('transformAsync', () => {
        it('transforms data items asynchronously', async () => {
            const r = new PageResponse([1, 2, 3], 0, 10, 3);
            const mapped = await r.transformAsync(async n => await Promise.resolve(n * 10));
            expect(mapped.data).toEqual([10, 20, 30]);
        });

        it('preserves page metadata after async transform', async () => {
            const r = new PageResponse(['a', 'b'], 1, 5, 10);
            const mapped = await r.transformAsync(async s => await Promise.resolve(s.toUpperCase()));
            expect(mapped.page).toBe(1);
            expect(mapped.total).toBe(10);
        });
    });

    describe('getNextPageRequest', () => {
        it('returns next PageRequest when not on last page', () => {
            const r = new PageResponse([], 0, 10, 50); // 5 pages, currently on page 0
            const next = r.getNextPageRequest();
            expect(next).toBeInstanceOf(PageRequest);
            expect(next?.page).toBe(1);
            expect(next?.size).toBe(10);
        });

        it('returns null when on the last page', () => {
            const r = new PageResponse([], 4, 10, 50); // 5 pages, currently on page 4 (last)
            expect(r.getNextPageRequest()).toBeNull();
        });

        it('returns null when total is 0', () => {
            const r = new PageResponse([], 0, 10, 0);
            expect(r.getNextPageRequest()).toBeNull();
        });

        it('returns null when on the only page', () => {
            const r = new PageResponse([], 0, 10, 5); // 1 page
            expect(r.getNextPageRequest()).toBeNull();
        });
    });
});
