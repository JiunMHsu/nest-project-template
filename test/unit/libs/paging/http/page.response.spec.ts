import 'reflect-metadata';

import { instanceToPlain } from 'class-transformer';
import { describe, expect, it } from 'vitest';

import { Page, PageRequest, Sort } from '@libs/paging/core';
import { PageResponse } from '@libs/paging/http';

function page(): Page<string> {
    return new Page(['a', 'b', 'c'], PageRequest.of(1, 20, Sort.by('name')), 57);
}

describe('PageResponse', () => {
    describe('from', () => {
        it('should carry the content over', () => {
            expect(PageResponse.from(page()).content).toEqual(['a', 'b', 'c']);
        });

        it('should copy the content rather than alias it', () => {
            const source = page();

            expect(PageResponse.from(source).content).not.toBe(source.content);
        });

        it('should carry the page index over', () => {
            expect(PageResponse.from(page()).page).toBe(1);
        });

        it('should carry the page size over', () => {
            expect(PageResponse.from(page()).count).toBe(20);
        });

        it('should carry the total count over', () => {
            expect(PageResponse.from(page()).totalCount).toBe(57);
        });

        it('should resolve the total pages', () => {
            expect(PageResponse.from(page()).totalPages).toBe(3);
        });

        it('should resolve isLast from the page', () => {
            expect(PageResponse.from(page()).isLast).toBe(false);
        });

        it('should be last once the window reaches the total', () => {
            const last = new Page(new Array(17).fill('x'), PageRequest.of(2, 20), 57);

            expect(PageResponse.from(last).isLast).toBe(true);
        });

        it('should not carry the sort onto the wire', () => {
            expect(PageResponse.from(page())).not.toHaveProperty('sort');
        });
    });

    describe('serialisation', () => {
        it('should use snake_case wire names', () => {
            expect(instanceToPlain(PageResponse.from(page()))).toEqual({
                content: ['a', 'b', 'c'],
                page: 1,
                count: 20,
                total_pages: 3,
                total_count: 57,
                is_last: false,
            });
        });
    });
});
