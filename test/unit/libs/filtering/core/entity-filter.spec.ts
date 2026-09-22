import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { EntityFilter } from '@libs/filtering/core';

class WidgetFilter extends EntityFilter {}

const UUID = 'a3f1c9e2-5d6b-4f8e-9c2d-1e2f3a4b5c6d';

function build(plain: Record<string, unknown>): WidgetFilter {
    return plainToInstance(WidgetFilter, plain, { excludeExtraneousValues: true });
}

async function invalidPropertiesOf(plain: Record<string, unknown>): Promise<string[]> {
    return (await validate(build(plain))).map(error => error.property);
}

describe('EntityFilter', () => {
    describe('query param mapping', () => {
        it('should read the id from its wire name', () => {
            expect(build({ id: UUID }).id).toBe(UUID);
        });

        it.each([
            ['created_after', 'createdAfter'],
            ['created_before', 'createdBefore'],
            ['updated_after', 'updatedAfter'],
            ['updated_before', 'updatedBefore'],
        ])('should read %s into %s', (wireName, property) => {
            const filter = build({ [wireName]: '2024-01-01T00:00:00Z' });

            expect(filter[property as keyof WidgetFilter]).toEqual(new Date('2024-01-01T00:00:00Z'));
        });

        it('should parse dates as UTC rather than local time', () => {
            expect(build({ created_after: '2024-01-01T12:00:00+02:00' }).createdAfter?.toISOString()).toBe(
                '2024-01-01T10:00:00.000Z',
            );
        });

        it('should leave absent filters undefined', () => {
            expect(build({}).createdAfter).toBeUndefined();
        });
    });

    describe('deleted', () => {
        it.each([
            ['the string true', 'true', true],
            ['the string false', 'false', false],
            ['a real true', true, true],
            ['a real false', false, false],
        ])('should coerce %s', (_label, raw, expected) => {
            expect(build({ deleted: raw }).deleted).toBe(expected);
        });

        it('should be undefined when not given', () => {
            expect(build({}).deleted).toBeUndefined();
        });

        it('should drop an unrecognised value rather than rejecting it', () => {
            expect(build({ deleted: 'banana' }).deleted).toBeUndefined();
        });
    });

    describe('createdDateRange', () => {
        it('should compose both bounds', () => {
            const filter = build({ created_after: '2024-01-01T00:00:00Z', created_before: '2024-12-31T00:00:00Z' });

            expect(filter.createdDateRange).toEqual({
                from: new Date('2024-01-01T00:00:00Z'),
                to: new Date('2024-12-31T00:00:00Z'),
            });
        });

        it('should leave the missing bound undefined', () => {
            expect(build({ created_after: '2024-01-01T00:00:00Z' }).createdDateRange.to).toBeUndefined();
        });

        it('should be fully undefined when neither bound is given', () => {
            expect(build({}).createdDateRange).toEqual({ from: undefined, to: undefined });
        });

        it('should not borrow the updated bounds', () => {
            expect(build({ updated_after: '2024-01-01T00:00:00Z' }).createdDateRange.from).toBeUndefined();
        });
    });

    describe('updatedDateRange', () => {
        it('should compose both bounds', () => {
            const filter = build({ updated_after: '2024-01-01T00:00:00Z', updated_before: '2024-12-31T00:00:00Z' });

            expect(filter.updatedDateRange).toEqual({
                from: new Date('2024-01-01T00:00:00Z'),
                to: new Date('2024-12-31T00:00:00Z'),
            });
        });
    });

    describe('validation', () => {
        it('should accept an empty filter', async () => {
            expect(await invalidPropertiesOf({})).toEqual([]);
        });

        it('should accept a well-formed filter', async () => {
            const plain = { id: UUID, created_after: '2024-01-01T00:00:00Z', deleted: 'true' };

            expect(await invalidPropertiesOf(plain)).toEqual([]);
        });

        it('should reject a malformed id', async () => {
            expect(await invalidPropertiesOf({ id: 'not-a-uuid' })).toEqual(['id']);
        });

        it('should reject an unparseable date', async () => {
            expect(await invalidPropertiesOf({ created_after: 'yesterday' })).toEqual(['createdAfter']);
        });

        it('should not reject an unrecognised deleted value, having dropped it', async () => {
            expect(await invalidPropertiesOf({ deleted: 'banana' })).toEqual([]);
        });
    });
});
