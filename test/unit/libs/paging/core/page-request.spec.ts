import { describe, expect, it } from 'vitest';

import { Direction, PageRequest, Sort } from '@libs/paging/core';

describe('PageRequest', () => {
    describe('of', () => {
        it('should expose the requested page', () => {
            expect(PageRequest.of(2, 20).page).toBe(2);
        });

        it('should expose the requested size', () => {
            expect(PageRequest.of(2, 20).size).toBe(20);
        });

        it('should be unsorted by default', () => {
            expect(PageRequest.of(0, 20).sort.isSorted()).toBe(false);
        });

        it('should keep the given sort', () => {
            expect(PageRequest.of(0, 20, Sort.by('name')).sort.toArray()).toEqual([
                { property: 'name', direction: Direction.ASC },
            ]);
        });

        it('should accept the first page', () => {
            expect(() => PageRequest.of(0, 20)).not.toThrow();
        });

        it('should accept a size of one', () => {
            expect(() => PageRequest.of(0, 1)).not.toThrow();
        });

        it('should reject a negative page index', () => {
            expect(() => PageRequest.of(-1, 20)).toThrow('Page index must not be less than zero');
        });

        it('should reject a zero page size', () => {
            expect(() => PageRequest.of(0, 0)).toThrow('Page size must not be less than one');
        });

        it('should reject a negative page size', () => {
            expect(() => PageRequest.of(0, -5)).toThrow('Page size must not be less than one');
        });

        it('should not cap the page size', () => {
            expect(PageRequest.of(0, 5000).size).toBe(5000);
        });
    });

    describe('offset', () => {
        it('should be zero on the first page', () => {
            expect(PageRequest.of(0, 20).offset).toBe(0);
        });

        it('should be the page index times the size', () => {
            expect(PageRequest.of(3, 20).offset).toBe(60);
        });
    });

    describe('next', () => {
        it('should advance to the following page', () => {
            expect(PageRequest.of(1, 20).next().page).toBe(2);
        });

        it('should keep the size', () => {
            expect(PageRequest.of(1, 20).next().size).toBe(20);
        });

        it('should keep the sort', () => {
            expect(PageRequest.of(1, 20, Sort.by('name')).next().sort.toArray()).toHaveLength(1);
        });

        it('should not mutate the original', () => {
            const request = PageRequest.of(1, 20);
            request.next();

            expect(request.page).toBe(1);
        });
    });

    describe('previousOrFirst', () => {
        it('should step back one page', () => {
            expect(PageRequest.of(3, 20).previousOrFirst().page).toBe(2);
        });

        it('should stay on the first page when there is no previous', () => {
            expect(PageRequest.of(0, 20).previousOrFirst().page).toBe(0);
        });

        it('should keep the size and sort', () => {
            const previous = PageRequest.of(3, 20, Sort.by('name')).previousOrFirst();

            expect(previous.size).toBe(20);
            expect(previous.sort.toArray()).toHaveLength(1);
        });
    });

    describe('first', () => {
        it('should reset to page zero', () => {
            expect(PageRequest.of(7, 20).first().page).toBe(0);
        });

        it('should keep the size', () => {
            expect(PageRequest.of(7, 20).first().size).toBe(20);
        });

        it('should keep the sort', () => {
            expect(PageRequest.of(7, 20, Sort.by('name')).first().sort.toArray()).toHaveLength(1);
        });
    });

    describe('withSort', () => {
        it('should replace the sort', () => {
            expect(PageRequest.of(1, 20, Sort.by('name')).withSort(Sort.by('age')).sort.toArray()).toEqual([
                { property: 'age', direction: Direction.ASC },
            ]);
        });

        it('should keep the page and size', () => {
            const resorted = PageRequest.of(1, 20).withSort(Sort.by('age'));

            expect(resorted.page).toBe(1);
            expect(resorted.size).toBe(20);
        });

        it('should not mutate the original', () => {
            const request = PageRequest.of(1, 20);
            request.withSort(Sort.by('age'));

            expect(request.sort.isSorted()).toBe(false);
        });
    });

    describe('hasPrevious', () => {
        it('should be false on the first page', () => {
            expect(PageRequest.of(0, 20).hasPrevious()).toBe(false);
        });

        it('should be true on a later page', () => {
            expect(PageRequest.of(1, 20).hasPrevious()).toBe(true);
        });
    });
});
