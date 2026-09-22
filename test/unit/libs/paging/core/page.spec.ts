import { describe, expect, it } from 'vitest';

import { Direction, Page, PageRequest, Slice, Sort } from '@libs/paging/core';

describe('Slice', () => {
    const sort = Sort.by('name');

    describe('construction', () => {
        it('should keep the content', () => {
            expect(new Slice(['a', 'b'], PageRequest.of(0, 10), false).content).toEqual(['a', 'b']);
        });

        it('should take the page index from the request', () => {
            expect(new Slice(['a'], PageRequest.of(2, 10), false).page).toBe(2);
        });

        it('should take the count from the requested size, not the content length', () => {
            expect(new Slice(['a'], PageRequest.of(2, 10), false).count).toBe(10);
        });

        it('should take the sort from the request', () => {
            expect(new Slice(['a'], PageRequest.of(0, 10, sort), false).sort.toArray()).toEqual([
                { property: 'name', direction: Direction.ASC },
            ]);
        });

        it('should keep the given hasNext', () => {
            expect(new Slice(['a'], PageRequest.of(0, 10), true).hasNext).toBe(true);
        });
    });

    describe('hasContent', () => {
        it('should be true when the slice holds items', () => {
            expect(new Slice(['a'], PageRequest.of(0, 10), false).hasContent()).toBe(true);
        });

        it('should be false when the slice is empty', () => {
            expect(new Slice([], PageRequest.of(0, 10), false).hasContent()).toBe(false);
        });
    });

    describe('position', () => {
        it('should have no previous on the first page', () => {
            expect(new Slice(['a'], PageRequest.of(0, 10), true).hasPrevious()).toBe(false);
        });

        it('should have a previous on a later page', () => {
            expect(new Slice(['a'], PageRequest.of(1, 10), true).hasPrevious()).toBe(true);
        });

        it('should be first on page zero', () => {
            expect(new Slice(['a'], PageRequest.of(0, 10), true).isFirst()).toBe(true);
        });

        it('should not be first on a later page', () => {
            expect(new Slice(['a'], PageRequest.of(1, 10), true).isFirst()).toBe(false);
        });

        it('should be last when nothing follows', () => {
            expect(new Slice(['a'], PageRequest.of(1, 10), false).isLast()).toBe(true);
        });

        it('should not be last while more remains', () => {
            expect(new Slice(['a'], PageRequest.of(1, 10), true).isLast()).toBe(false);
        });
    });

    describe('nextPageRequest', () => {
        it('should point at the following page', () => {
            expect(new Slice(['a'], PageRequest.of(1, 10), true).nextPageRequest()?.page).toBe(2);
        });

        it('should keep the size and sort', () => {
            const next = new Slice(['a'], PageRequest.of(1, 10, sort), true).nextPageRequest();

            expect(next?.size).toBe(10);
            expect(next?.sort.toArray()).toHaveLength(1);
        });

        it('should be undefined on the last page', () => {
            expect(new Slice(['a'], PageRequest.of(1, 10), false).nextPageRequest()).toBeUndefined();
        });
    });

    describe('previousPageRequest', () => {
        it('should point at the preceding page', () => {
            expect(new Slice(['a'], PageRequest.of(2, 10), true).previousPageRequest()?.page).toBe(1);
        });

        it('should be undefined on the first page', () => {
            expect(new Slice(['a'], PageRequest.of(0, 10), true).previousPageRequest()).toBeUndefined();
        });
    });

    describe('map', () => {
        it('should transform every item', () => {
            const slice = new Slice([1, 2, 3], PageRequest.of(0, 10), false);

            expect(slice.map(n => n * 2).content).toEqual([2, 4, 6]);
        });

        it('should keep the paging metadata', () => {
            const mapped = new Slice([1], PageRequest.of(2, 10, sort), true).map(String);

            expect(mapped.page).toBe(2);
            expect(mapped.count).toBe(10);
            expect(mapped.sort.toArray()).toHaveLength(1);
        });

        it('should keep hasNext', () => {
            expect(new Slice([1], PageRequest.of(0, 10), true).map(String).hasNext).toBe(true);
        });

        it('should return a Slice', () => {
            expect(new Slice([1], PageRequest.of(0, 10), true).map(String)).toBeInstanceOf(Slice);
        });

        it('should not mutate the original content', () => {
            const slice = new Slice([1, 2], PageRequest.of(0, 10), false);
            slice.map(n => n * 2);

            expect(slice.content).toEqual([1, 2]);
        });
    });
});

describe('Page', () => {
    describe('totalCount', () => {
        it('should expose the total across every page', () => {
            expect(new Page(new Array(20).fill(0), PageRequest.of(0, 20), 57).totalCount).toBe(57);
        });
    });

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

        it('should be 1 when the count exactly fills one page', () => {
            const page = new Page(new Array(20).fill(0), PageRequest.of(0, 20), 20);

            expect(page.totalPages).toBe(1);
        });
    });

    describe('hasNext', () => {
        it('should be true while the window stops short of the total', () => {
            expect(new Page(new Array(20).fill(0), PageRequest.of(0, 20), 57).hasNext).toBe(true);
        });

        it('should be false once the window reaches the total', () => {
            expect(new Page(new Array(17).fill(0), PageRequest.of(2, 20), 57).hasNext).toBe(false);
        });

        it('should be false for an empty page past the end', () => {
            expect(new Page([], PageRequest.of(5, 20), 57).hasNext).toBe(false);
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

    describe('map', () => {
        it('should transform every item', () => {
            const page = new Page([1, 2, 3], PageRequest.of(0, 20), 3);

            expect(page.map(n => n * 2).content).toEqual([2, 4, 6]);
        });

        it('should return a Page, not a plain Slice', () => {
            expect(new Page([1], PageRequest.of(0, 20), 1).map(String)).toBeInstanceOf(Page);
        });

        it('should keep the total count', () => {
            expect(new Page(new Array(20).fill(1), PageRequest.of(0, 20), 57).map(String).totalCount).toBe(57);
        });

        it('should keep the total pages', () => {
            expect(new Page(new Array(20).fill(1), PageRequest.of(0, 20), 57).map(String).totalPages).toBe(3);
        });

        it('should keep the paging metadata', () => {
            const mapped = new Page(new Array(17).fill(1), PageRequest.of(2, 20, Sort.by('name')), 57).map(String);

            expect(mapped.page).toBe(2);
            expect(mapped.count).toBe(20);
            expect(mapped.sort.toArray()).toHaveLength(1);
        });
    });
});
