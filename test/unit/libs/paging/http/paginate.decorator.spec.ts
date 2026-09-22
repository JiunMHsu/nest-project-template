import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { BadRequestException } from '@nestjs/common';

import { Direction, PageRequest } from '@libs/paging/core';
import { Paginate } from '@libs/paging/http';
import { createHttpContext } from '@test/utils/context';
import { getParamFactory } from '@test/utils/decorator';

const API_PARAMETERS = 'swagger/apiParameters';

interface ApiQueryMetadata {
    name: string;
    required?: boolean;
    description?: string;
    schema?: { items?: { enum?: string[] } };
}

class WidgetsController {
    public named(@Paginate({ last_name: 'lastName', created_at: 'createdAt' }) pageRequest: PageRequest): PageRequest {
        return pageRequest;
    }

    public simple(@Paginate(['name']) pageRequest: PageRequest): PageRequest {
        return pageRequest;
    }

    public unsortable(@Paginate() pageRequest: PageRequest): PageRequest {
        return pageRequest;
    }
}

function resolve(method: 'named' | 'simple' | 'unsortable', query: Record<string, unknown> = {}): PageRequest {
    return getParamFactory(WidgetsController, method)(createHttpContext({ query } as never)) as PageRequest;
}

function apiQueriesOf(method: 'named' | 'simple' | 'unsortable'): ApiQueryMetadata[] {
    return (Reflect.getMetadata(API_PARAMETERS, WidgetsController.prototype[method]) ?? []) as ApiQueryMetadata[];
}

describe('Paginate', () => {
    describe('defaults', () => {
        it('should default to the first page', () => {
            expect(resolve('named').page).toBe(0);
        });

        it('should default to a size of 20', () => {
            expect(resolve('named').size).toBe(20);
        });

        it('should default to unsorted', () => {
            expect(resolve('named').sort.isSorted()).toBe(false);
        });
    });

    describe('page and size', () => {
        it('should read the requested page', () => {
            expect(resolve('named', { page: '3' }).page).toBe(3);
        });

        it('should read the requested size', () => {
            expect(resolve('named', { size: '50' }).size).toBe(50);
        });

        it('should fall back to the default for a non-numeric page', () => {
            expect(resolve('named', { page: 'abc' }).page).toBe(0);
        });

        it('should fall back to the default for a non-numeric size', () => {
            expect(resolve('named', { size: 'abc' }).size).toBe(20);
        });

        it('should allow the maximum size', () => {
            expect(resolve('named', { size: '100' }).size).toBe(100);
        });

        it('should reject a size above the maximum', () => {
            expect(() => resolve('named', { size: '101' })).toThrow('Page size must not be greater than 100');
        });

        it('should reject an oversized page as a 400', () => {
            expect(() => resolve('named', { size: '101' })).toThrow(BadRequestException);
        });

        it('should reject a negative page as a 400', () => {
            expect(() => resolve('named', { page: '-1' })).toThrow(BadRequestException);
        });

        it('should surface the page index message', () => {
            expect(() => resolve('named', { page: '-1' })).toThrow('Page index must not be less than zero');
        });

        it('should reject a zero size as a 400', () => {
            expect(() => resolve('named', { size: '0' })).toThrow(BadRequestException);
        });

        it('should surface the page size message', () => {
            expect(() => resolve('named', { size: '0' })).toThrow('Page size must not be less than one');
        });
    });

    describe('sorting with a field map', () => {
        it('should map the wire name to the entity property', () => {
            expect(resolve('named', { sort: 'last_name,DESC' }).sort.toArray()).toEqual([
                { property: 'lastName', direction: Direction.DESC },
            ]);
        });

        it('should accept repeated sort params', () => {
            expect(resolve('named', { sort: ['last_name', 'created_at,DESC'] }).sort.toArray()).toEqual([
                { property: 'lastName', direction: Direction.ASC },
                { property: 'createdAt', direction: Direction.DESC },
            ]);
        });

        it('should reject a field outside the map', () => {
            expect(() => resolve('named', { sort: 'password' })).toThrow(BadRequestException);
        });
    });

    describe('sorting with a field list', () => {
        it('should sort by the listed field', () => {
            expect(resolve('simple', { sort: 'name,DESC' }).sort.toArray()).toEqual([
                { property: 'name', direction: Direction.DESC },
            ]);
        });

        it('should reject an unlisted field', () => {
            expect(() => resolve('simple', { sort: 'name2' })).toThrow(BadRequestException);
        });
    });

    describe('sorting when nothing is sortable', () => {
        it('should reject any sort', () => {
            expect(() => resolve('unsortable', { sort: 'name' })).toThrow('No fields are sortable.');
        });

        it('should still resolve a page request without a sort', () => {
            expect(resolve('unsortable', { page: '1' }).page).toBe(1);
        });
    });

    describe('swagger documentation', () => {
        it('should document page, size and sort', () => {
            expect(apiQueriesOf('named').map(query => query.name)).toEqual(['page', 'size', 'sort']);
        });

        it('should mark every query param optional', () => {
            expect(apiQueriesOf('named').every(query => query.required === false)).toBe(true);
        });

        it('should offer both directions for each sortable field', () => {
            expect(apiQueriesOf('named').find(query => query.name === 'sort')?.schema?.items?.enum).toEqual([
                'last_name,ASC',
                'last_name,DESC',
                'created_at,ASC',
                'created_at,DESC',
            ]);
        });

        it('should name the allowed fields in the sort description', () => {
            expect(apiQueriesOf('named').find(query => query.name === 'sort')?.description).toContain(
                'Allowed fields: last_name, created_at',
            );
        });

        it('should not leak source indentation into the sort description', () => {
            expect(apiQueriesOf('named').find(query => query.name === 'sort')?.description).not.toMatch(/\s{2,}/);
        });

        it('should omit sort when nothing is sortable', () => {
            expect(apiQueriesOf('unsortable').map(query => query.name)).toEqual(['page', 'size']);
        });
    });
});
