import { describe, expect, it } from 'vitest';
import { SortRequest } from '@commons/querying/sort.request';
import { parseCommaSeparatedArrays } from '@commons/querying/query-params.decorator';

// parseCommaSeparatedArrays is tested here since it's a standalone exported function
describe('parseCommaSeparatedArrays', () => {
    it('splits comma-separated string values into arrays', () => {
        const result = parseCommaSeparatedArrays({ tags: 'node,typescript,nestjs' });
        expect(result.tags).toEqual(['node', 'typescript', 'nestjs']);
    });

    it('trims whitespace from split values', () => {
        const result = parseCommaSeparatedArrays({ tags: 'a, b , c' });
        expect(result.tags).toEqual(['a', 'b', 'c']);
    });

    it('filters out empty strings after split', () => {
        const result = parseCommaSeparatedArrays({ tags: 'a,,b' });
        expect(result.tags).toEqual(['a', 'b']);
    });

    it('leaves non-comma strings unchanged', () => {
        const result = parseCommaSeparatedArrays({ name: 'john' });
        expect(result.name).toBe('john');
    });

    it('leaves non-string values unchanged', () => {
        const result = parseCommaSeparatedArrays({ nested: { foo: 'bar' } });
        expect(result.nested).toEqual({ foo: 'bar' });
    });

    it('leaves already-array values unchanged', () => {
        const arr = ['a', 'b'];
        const result = parseCommaSeparatedArrays({ items: arr });
        expect(result.items).toBe(arr);
    });

    it('handles empty object', () => {
        expect(parseCommaSeparatedArrays({})).toEqual({});
    });
});

describe('SortRequest', () => {
    describe('addCriterion / getCriteria', () => {
        it('returns empty array when no criteria added', () => {
            expect(new SortRequest().getCriteria()).toEqual([]);
        });

        it('returns added criterion', () => {
            const sr = new SortRequest();
            sr.addCriterion('name', 'ASC');
            expect(sr.getCriteria()).toEqual([{ field: 'name', direction: 'ASC' }]);
        });

        it('overwrites direction for the same field (Map deduplication)', () => {
            const sr = new SortRequest();
            sr.addCriterion('name', 'ASC');
            sr.addCriterion('name', 'DESC');
            const criteria = sr.getCriteria();
            expect(criteria).toHaveLength(1);
            expect(criteria[0].direction).toBe('DESC');
        });

        it('preserves multiple distinct fields', () => {
            const sr = new SortRequest();
            sr.addCriterion('name', 'ASC');
            sr.addCriterion('createdAt', 'DESC');
            const criteria = sr.getCriteria();
            expect(criteria).toHaveLength(2);
        });
    });
});
