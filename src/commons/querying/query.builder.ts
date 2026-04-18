import { SelectQueryBuilder } from 'typeorm';
import { PageResponse } from '@commons/querying/page.response';
import { PageRequest } from '@commons/querying/page.request';
import { SortCriterion } from '@commons/querying/sort.request';
import { DateRange } from '@commons/querying/date-range';

interface FilterCondition {
    field: string;
    value: unknown;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NONE';
}

/**
 * Fluent query builder wrapping TypeORM's `SelectQueryBuilder`.
 *
 * Adds field whitelisting, null-aware filter methods, automatic soft-delete
 * filtering (`deletedAt IS NULL`), sorting, and pagination — all via a
 * chainable API that keeps repository code readable.
 *
 * @example
 * const results = await new QueryBuilder(repo.createQueryBuilder('u'), 'u', sorting.getCriteria())
 *   .withDeleted(filter.deleted)
 *   .equals('u.status', status)
 *   .contains('u.name', search)
 *   .between('u.createdAt', filter.creationDateRange)
 *   .between('u.updatedAt', filter.updateDateRange)
 *   .getPage(paging);
 */
export class QueryBuilder<T> {
    private readonly alias: string;
    private readonly ormQueryBuilder: SelectQueryBuilder<T>;

    private conditions: FilterCondition[];
    private allowedFields: Set<string>;
    private parameterCounter: number;
    private includeDeleted: boolean;

    private sortCriteria: SortCriterion[];

    /**
     * @param ormQueryBuilder - TypeORM query builder to wrap.
     * @param alias - Entity alias used in the query (must match the one passed to `createQueryBuilder`).
     * @param sortCriteria - Sort criteria, typically from `SortRequest.getCriteria()`.
     * @param allowedFields - Whitelist of field names that may be filtered. Empty means all fields allowed.
     */
    public constructor(
        ormQueryBuilder: SelectQueryBuilder<T>,
        alias: string,
        sortCriteria: SortCriterion[] = [],
        allowedFields: string[] = [],
    ) {
        this.ormQueryBuilder = ormQueryBuilder;
        if (!alias) throw new Error('Alias must be provided for QueryBuilder');
        this.alias = alias;

        this.allowedFields = new Set(allowedFields);
        this.conditions = [];
        this.parameterCounter = 0;
        this.includeDeleted = false;

        this.sortCriteria = sortCriteria;
    }

    /**
     * Bypasses the default `deletedAt IS NULL` filter, allowing soft-deleted
     * records to appear in results. Typically driven by {@link EntitySpecification.deleted}.
     *
     * @example
     * queryBuilder.withDeleted(filter.deleted)
     */
    public withDeleted(include?: boolean): this {
        this.includeDeleted = include ?? true;
        return this;
    }

    private isPresent(value: unknown, option: { allowNull: boolean } = { allowNull: false }): boolean {
        return value !== undefined && (option.allowNull || value !== null);
    }

    private fieldIsAllowed(field: string): boolean {
        return this.allowedFields.size === 0 || this.allowedFields.has(field);
    }

    private validateField(field: string): void {
        if (this.fieldIsAllowed(field)) return;
        throw new Error(`Field "${field}" is not allowed for filtering`);
    }

    /**
     * Filters where `field = value`. Skipped when value is `undefined`.
     * Null values produce `field IS NULL`.
     */
    public equals(field: string, value: unknown): this {
        if (!this.isPresent(value, { allowNull: true })) return this;

        this.validateField(field);
        this.conditions.push({ field, value, operator: '=' });
        return this;
    }

    /**
     * Filters where `field != value`. Skipped when value is `undefined`.
     * Null values produce `field IS NOT NULL`.
     */
    public notEquals(field: string, value: unknown): this {
        if (!this.isPresent(value, { allowNull: true })) return this;

        this.validateField(field);
        this.conditions.push({ field, value, operator: '!=' });
        return this;
    }

    /**
     * Filters where `field > value`. Skipped when value is `undefined` or `null`.
     */
    public greaterThan(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '>' });
        return this;
    }

    /**
     * Filters where `field < value`. Skipped when value is `undefined` or `null`.
     */
    public lessThan(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '<' });
        return this;
    }

    /**
     * Filters where `field >= value`. Skipped when value is `undefined` or `null`.
     */
    public greaterThanOrEqual(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '>=' });
        return this;
    }

    /**
     * Filters where `field <= value`. Skipped when value is `undefined` or `null`.
     */
    public lessThanOrEqual(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '<=' });
        return this;
    }

    /**
     * Raw LIKE filter. The caller controls the pattern, including wildcard placement.
     * Use `contains()`, `startsWith()`, or `endsWith()` for common patterns with automatic escaping.
     *
     * @example
     * .like('name', 'Jo%n')   // matches "John", "Joan", etc
     * .like('code', 'A__')    // matches any 3-char code starting with A
     */
    public like(field: string, pattern: string): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        this.conditions.push({ field, value: pattern, operator: 'LIKE' });
        return this;
    }

    /**
     * Filters where `field` starts with `pattern`.
     * LIKE special characters (`%`, `_`) in the pattern are automatically escaped.
     *
     * @example
     * .startsWith('name', 'Jo') // matches "John", "José", etc.
     */
    public startsWith(field: string, pattern: string): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        const escaped = pattern.replace(/[%_]/g, '\\$&');
        this.conditions.push({ field, value: `${escaped}%`, operator: 'LIKE' });
        return this;
    }

    /**
     * Filters where `field` ends with `pattern`.
     * LIKE special characters (`%`, `_`) in the pattern are automatically escaped.
     *
     * @example
     * .endsWith('email', '@example.com')
     */
    public endsWith(field: string, pattern: string): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        const escaped = pattern.replace(/[%_]/g, '\\$&');
        this.conditions.push({ field, value: `%${escaped}`, operator: 'LIKE' });
        return this;
    }

    /**
     * Filters where `field` contains `pattern` (case-sensitive, database-collation dependent).
     * LIKE special characters (`%`, `_`) in the pattern are automatically escaped.
     *
     * @example
     * .contains('description', '50% off') // safely escaped — won't treat % as a wildcard
     */
    public contains(field: string, pattern: string): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        const escaped = pattern.replace(/[%_]/g, '\\$&');
        this.conditions.push({ field, value: `%${escaped}%`, operator: 'LIKE' });
        return this;
    }

    /**
     * Filters where `field` matches any value in `values`.
     *
     * - `undefined` or `null` → condition is skipped.
     * - Empty array → adds `1=0` so the query returns no rows, instead of silently
     *   dropping the filter and returning all records.
     */
    public in(field: string, values: unknown[]): this {
        if (!values) return this;

        this.validateField(field);

        if (values.length === 0) {
            this.conditions.push({ field, value: null, operator: 'NONE' });
            return this;
        }

        this.conditions.push({ field, value: values, operator: 'IN' });
        return this;
    }

    /**
     * Shorthand for combining `greaterThanOrEqual` and `lessThanOrEqual`.
     * Either bound may be omitted — only the provided ones are applied.
     *
     * Accepts either a `DateRange` object or explicit `from`/`to` values.
     *
     * @example
     * .between('price', 10, 50)
     * .between('createdAt', startDate, endDate)
     * .between('createdAt', filter.creationDateRange)   // DateRange from EntitySpecification getter
     */
    public between(field: string, rangeOrFrom?: DateRange | number | Date, to?: number | Date): this {
        if (rangeOrFrom !== null && typeof rangeOrFrom === 'object' && !(rangeOrFrom instanceof Date)) {
            const { from, to: rangeTo } = rangeOrFrom;
            if (this.isPresent(from)) this.greaterThanOrEqual(field, from);
            if (this.isPresent(rangeTo)) this.lessThanOrEqual(field, rangeTo);
            return this;
        }

        const from = rangeOrFrom as number | Date | undefined;
        if (this.isPresent(from)) this.greaterThanOrEqual(field, from);
        if (this.isPresent(to)) this.lessThanOrEqual(field, to);
        return this;
    }

    /**
     * Executes the query and returns all matching entities (no pagination).
     */
    public getMany(): Promise<T[]> {
        return this.apply().getMany();
    }

    /**
     * Executes the query and returns a paginated result.
     * Defaults to page 0, size 20 when no `PageRequest` is provided.
     */
    public async getPage(paging?: PageRequest): Promise<PageResponse<T>> {
        paging = paging ?? new PageRequest();
        const { page: pageNumber, offset, size } = paging;

        const filtered = this.apply().skip(offset).take(size);
        const [data, count] = await Promise.all([filtered.getMany(), filtered.getCount()]);

        return new PageResponse<T>(data, pageNumber, size, count);
    }

    private apply(): SelectQueryBuilder<T> {
        const queryBuilder = this.ormQueryBuilder;

        if (!this.includeDeleted) queryBuilder.where(`${this.alias}.deletedAt IS NULL`);

        this.conditions.forEach(cond => {
            const paramKey = this.getNextParamKey(cond.field);
            const condition = this.buildCondition(this.alias, cond, paramKey);

            return cond.value === null
                ? queryBuilder.andWhere(condition)
                : queryBuilder.andWhere(condition, { [paramKey]: cond.value });
        });

        this.sortCriteria.forEach((criterion, index) => {
            const { field, direction } = criterion;

            const _field = `${this.alias}.${field}`;
            if (index === 0) {
                queryBuilder.orderBy(_field, direction);
                return;
            }

            queryBuilder.addOrderBy(_field, direction);
        });

        return queryBuilder;
    }

    private getNextParamKey(base: string): string {
        return `${base}_${this.parameterCounter++}`;
    }

    private buildCondition(alias: string, cond: FilterCondition, paramKey: string): string {
        const fieldPath = this.buildFieldPath(alias, cond.field);
        const { operator, value } = cond;

        if (operator === 'NONE') return '1=0';

        if (value === null && (operator === '=' || operator === '!=')) {
            return operator === '=' ? `${fieldPath} IS NULL` : `${fieldPath} IS NOT NULL`;
        }

        if (operator === 'IN') return `${fieldPath} IN (:...${paramKey})`;
        return `${fieldPath} ${operator} :${paramKey}`;
    }

    private buildFieldPath(alias: string, field: string): string {
        const parts = field.split('.');

        // Simple field: use the main entity alias
        if (parts.length === 1) {
            return `${alias}.${field}`;
        }

        // Nested field: first part is the relation alias, rest is the path
        // e.g., "client.id" → "client.id" (NOT "subscription.client.id")
        return field;
    }
}
