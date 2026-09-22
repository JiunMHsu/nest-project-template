import { describe, expect, it } from 'vitest';

import { Page, PageRequest } from '@libs/paging/core';

describe('Page', () => {
    describe('totalPages', () => {
        it('should count every page while on the first one', () => {
            const page = new Page(new Array(20).fill(0), PageRequest.of(0, 20), 57);

            expect(page.totalPages).toBe(3);
        });

        it('should count every page while on a later one', () => {
            const page = new Page(new Array(17).fill(0), PageRequest.of(2, 20), 57);

            expect(page.totalPages).toBe(3);
        });

        it('should be 1 when there is a single partial page', () => {
            const page = new Page(new Array(3).fill(0), PageRequest.of(0, 20), 3);

            expect(page.totalPages).toBe(1);
        });

        it('should be 0 when there is no content', () => {
            const page = new Page([], PageRequest.of(0, 20), 0);

            expect(page.totalPages).toBe(0);
        });
    });

    describe('isLast', () => {
        it('should be false while more pages remain', () => {
            const page = new Page(new Array(20).fill(0), PageRequest.of(0, 20), 57);

            expect(page.isLast()).toBe(false);
        });

        it('should be true on the last page', () => {
            const page = new Page(new Array(17).fill(0), PageRequest.of(2, 20), 57);

            expect(page.isLast()).toBe(true);
        });
    });
});
