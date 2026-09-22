import { describe, expect, it } from 'vitest';

import { Direction, Order, Sort } from '@libs/paging/core';

describe('Order', () => {
    it('should build an ascending order', () => {
        expect(Order.asc('name')).toEqual({ property: 'name', direction: Direction.ASC });
    });

    it('should build a descending order', () => {
        expect(Order.desc('name')).toEqual({ property: 'name', direction: Direction.DESC });
    });
});

describe('Sort', () => {
    describe('by', () => {
        it('should sort every property ascending', () => {
            expect(Sort.by('lastName', 'createdAt').toArray()).toEqual([
                { property: 'lastName', direction: Direction.ASC },
                { property: 'createdAt', direction: Direction.ASC },
            ]);
        });

        it('should be unsorted when given no properties', () => {
            expect(Sort.by().isSorted()).toBe(false);
        });
    });

    describe('of', () => {
        it('should keep mixed directions in the given order', () => {
            expect(Sort.of(Order.desc('createdAt'), Order.asc('name')).toArray()).toEqual([
                { property: 'createdAt', direction: Direction.DESC },
                { property: 'name', direction: Direction.ASC },
            ]);
        });

        it('should be unsorted when given no orders', () => {
            expect(Sort.of().isSorted()).toBe(false);
        });
    });

    describe('unsorted', () => {
        it('should hold no orders', () => {
            expect(Sort.unsorted().toArray()).toEqual([]);
        });

        it('should not be sorted', () => {
            expect(Sort.unsorted().isSorted()).toBe(false);
        });
    });

    describe('isSorted', () => {
        it('should be true once a property is given', () => {
            expect(Sort.by('name').isSorted()).toBe(true);
        });
    });

    describe('and', () => {
        it('should append the other sort after this one', () => {
            const combined = Sort.by('lastName').and(Sort.of(Order.desc('createdAt')));

            expect(combined.toArray()).toEqual([
                { property: 'lastName', direction: Direction.ASC },
                { property: 'createdAt', direction: Direction.DESC },
            ]);
        });

        it('should not mutate the receiver', () => {
            const sort = Sort.by('lastName');
            sort.and(Sort.by('createdAt'));

            expect(sort.toArray()).toHaveLength(1);
        });

        it('should not mutate the argument', () => {
            const other = Sort.by('createdAt');
            Sort.by('lastName').and(other);

            expect(other.toArray()).toHaveLength(1);
        });

        it('should leave an unsorted receiver with only the other orders', () => {
            expect(Sort.unsorted().and(Sort.by('name')).toArray()).toEqual([
                { property: 'name', direction: Direction.ASC },
            ]);
        });
    });

    describe('iteration', () => {
        it('should spread into its orders', () => {
            expect([...Sort.by('name', 'age')]).toEqual([
                { property: 'name', direction: Direction.ASC },
                { property: 'age', direction: Direction.ASC },
            ]);
        });

        it('should yield nothing when unsorted', () => {
            expect([...Sort.unsorted()]).toEqual([]);
        });

        it('should be walkable with for..of', () => {
            const properties: string[] = [];
            for (const order of Sort.by('name', 'age')) properties.push(order.property);

            expect(properties).toEqual(['name', 'age']);
        });
    });
});
