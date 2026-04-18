import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryBuilder } from '@commons/querying/query.builder';
import { SelectQueryBuilder } from 'typeorm';

interface FakeEntity {
    id: string;
    name: string;
    age: number;
    deletedAt: Date | null;
}

/**
 * Builds a minimal mock of SelectQueryBuilder that captures the calls made on it.
 * We only mock the methods used by QueryBuilder.apply().
 */
function makeOrmQb() {
    const calls: { method: string; args: unknown[] }[] = [];

    const track =
        (method: string) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
            return qb;
        };

    const qb = {
        where: track('where'),
        andWhere: track('andWhere'),
        orderBy: track('orderBy'),
        addOrderBy: track('addOrderBy'),
        skip: track('skip'),
        take: track('take'),
        getMany: vi.fn().mockResolvedValue([]),
        getCount: vi.fn().mockResolvedValue(0),
        _calls: calls,
    } as unknown as SelectQueryBuilder<FakeEntity> & { _calls: typeof calls };

    return qb;
}

describe('QueryBuilder', () => {
    let ormQb: ReturnType<typeof makeOrmQb>;

    beforeEach(() => {
        ormQb = makeOrmQb();
    });

    describe('constructor', () => {
        it('throws when alias is empty', () => {
            expect(() => new QueryBuilder(ormQb, '')).toThrow('Alias must be provided');
        });

        it('constructs successfully with a valid alias', () => {
            expect(() => new QueryBuilder(ormQb, 'entity')).not.toThrow();
        });
    });

    describe('field validation', () => {
        it('throws for disallowed fields when allowedFields is set', () => {
            const qb = new QueryBuilder(ormQb, 'e', [], ['name']);
            expect(() => qb.equals('age', 5)).toThrow('"age" is not allowed');
        });

        it('allows any field when allowedFields is empty (default)', () => {
            const qb = new QueryBuilder(ormQb, 'e');
            expect(() => qb.equals('age', 5)).not.toThrow();
        });

        it('allows fields in the allowedFields set', () => {
            const qb = new QueryBuilder(ormQb, 'e', [], ['name', 'age']);
            expect(() => qb.equals('name', 'John').equals('age', 30)).not.toThrow();
        });
    });

    describe('equals', () => {
        it('skips condition when value is undefined', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.equals('name', undefined);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls).toHaveLength(0);
        });

        it('adds IS NULL condition when value is null', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.equals('name', null);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls.some(c => (c.args[0] as string).includes('IS NULL'))).toBe(true);
        });

        it('adds equality condition for a normal value', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.equals('name', 'John');
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls.some(c => (c.args[0] as string).includes('= :'))).toBe(true);
        });
    });

    describe('notEquals', () => {
        it('adds IS NOT NULL condition when value is null', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.notEquals('name', null);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls.some(c => (c.args[0] as string).includes('IS NOT NULL'))).toBe(true);
        });
    });

    describe('in', () => {
        it('adds 1=0 condition for empty array so no rows match', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.in('name', []);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls).toHaveLength(1);
            expect(andWhereCalls[0].args[0]).toBe('1=0');
        });

        it('adds IN condition for non-empty array', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.in('name', ['John', 'Jane']);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls.some(c => (c.args[0] as string).includes('IN ('))).toBe(true);
        });
    });

    describe('like / contains / startsWith / endsWith', () => {
        it('like passes raw pattern unchanged to SQL', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.like('name', 'Jo%n');
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            const paramValue = andWhereCalls[0].args[1] as Record<string, string>;
            expect(Object.values(paramValue)[0]).toBe('Jo%n');
        });

        it('startsWith adds trailing % and escapes special chars', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.startsWith('name', 'Jo');
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            const paramValue = andWhereCalls[0].args[1] as Record<string, string>;
            expect(Object.values(paramValue)[0]).toBe('Jo%');
        });

        it('endsWith adds leading % and escapes special chars', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.endsWith('name', 'hn');
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            const paramValue = andWhereCalls[0].args[1] as Record<string, string>;
            expect(Object.values(paramValue)[0]).toBe('%hn');
        });

        it('contains wraps with % and escapes LIKE special chars', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.contains('name', '50%off');
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            const paramValue = andWhereCalls[0].args[1] as Record<string, string>;
            expect(Object.values(paramValue)[0]).toBe('%50\\%off%');
        });
    });

    describe('between', () => {
        it('adds two conditions when both from and to are provided', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.between('age', 10, 50);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls).toHaveLength(2);
        });

        it('adds one condition when only from is provided', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.between('age', 10, undefined);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls).toHaveLength(1);
        });

        it('adds no conditions when both are undefined', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.between('age', undefined, undefined);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            expect(andWhereCalls).toHaveLength(0);
        });
    });

    describe('getPage', () => {
        it('returns a PageResponse with data and count', async () => {
            (ormQb.getMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: '1' }]);
            (ormQb.getCount as ReturnType<typeof vi.fn>).mockResolvedValue(1);

            const qb = new QueryBuilder(ormQb, 'e');
            const result = await qb.getPage();

            expect(result.data).toEqual([{ id: '1' }]);
            expect(result.total).toBe(1);
        });
    });

    describe('unique parameter keys', () => {
        it('generates distinct param keys for multiple conditions on the same field', async () => {
            const qb = new QueryBuilder(ormQb, 'e');
            qb.greaterThan('age', 10).lessThan('age', 50);
            await qb.getMany();
            const andWhereCalls = ormQb._calls.filter(c => c.method === 'andWhere');
            const conditions = andWhereCalls.map(c => c.args[0] as string);
            // Each condition should reference a different param key (age_0, age_1)
            expect(conditions[0]).toContain('age_0');
            expect(conditions[1]).toContain('age_1');
        });
    });
});
