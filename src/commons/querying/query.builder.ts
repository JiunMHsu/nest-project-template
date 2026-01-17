import { SelectQueryBuilder } from 'typeorm';
import { PageResponse } from '@commons/querying/page.response';
import { PageRequest } from '@commons/querying/page.request';
import { SortCriterion } from '@commons/querying/sort.request';

interface FilterCondition {
    field: string;
    value: unknown;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
}

export class QueryBuilder<T> {
    private readonly alias: string;
    private readonly ormQueryBuilder: SelectQueryBuilder<T>;

    private conditions: FilterCondition[];
    private allowedFields: Set<string>;
    private parameterCounter: number;

    private sortCriteria: SortCriterion[];

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

        this.sortCriteria = sortCriteria;
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

    public equals(field: string, value: unknown): this {
        if (!this.isPresent(value, { allowNull: true })) return this;

        this.validateField(field);
        this.conditions.push({ field, value, operator: '=' });
        return this;
    }

    public notEquals(field: string, value: unknown): this {
        if (!this.isPresent(value, { allowNull: true })) return this;

        this.validateField(field);
        this.conditions.push({ field, value, operator: '!=' });
        return this;
    }

    public greaterThan(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '>' });
        return this;
    }

    public lessThan(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '<' });
        return this;
    }

    public greaterThanOrEqual(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '>=' });
        return this;
    }

    public lessThanOrEqual(field: string, value: number | Date): this {
        this.validateField(field);
        if (!this.isPresent(value)) return this;

        this.conditions.push({ field, value, operator: '<=' });
        return this;
    }

    public like(
        field: string,
        pattern: string,
        option: { escapeSpecialChars: boolean } = { escapeSpecialChars: false },
    ): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        let _pattern = pattern;
        if (option.escapeSpecialChars) {
            _pattern = pattern.replace(/[%_]/g, '\\$&');
        }
        this.conditions.push({ field, value: `%${_pattern}%`, operator: 'LIKE' });
        return this;
    }

    public startsWith(field: string, pattern: string): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        const escaped = pattern.replace(/[%_]/g, '\\$&');
        this.conditions.push({ field, value: `${escaped}%`, operator: 'LIKE' });
        return this;
    }

    public endsWith(field: string, pattern: string): this {
        this.validateField(field);
        if (!this.isPresent(pattern)) return this;

        const escaped = pattern.replace(/[%_]/g, '\\$&');
        this.conditions.push({ field, value: `%${escaped}`, operator: 'LIKE' });
        return this;
    }

    public contains(field: string, pattern: string): this {
        return this.like(field, pattern, { escapeSpecialChars: true });
    }

    public in(field: string, values: unknown[]): this {
        if (!values || values.length === 0) return this;

        this.validateField(field);
        this.conditions.push({ field, value: values, operator: 'IN' });
        return this;
    }

    public between(field: string, from?: number | Date, to?: number | Date): this {
        if (this.isPresent(from)) this.greaterThanOrEqual(field, from);
        if (this.isPresent(to)) this.lessThanOrEqual(field, to);
        return this;
    }

    public getMany(): Promise<T[]> {
        return this.apply().getMany();
    }

    public async getPage(paging?: PageRequest): Promise<PageResponse<T>> {
        paging = paging ?? new PageRequest();
        const { page: pageNumber, offset, size } = paging;

        const filtered = this.apply().skip(offset).take(size);
        const [data, count] = await Promise.all([filtered.getMany(), filtered.getCount()]);

        return new PageResponse<T>(data, pageNumber, size, count);
    }

    private apply(): SelectQueryBuilder<T> {
        const queryBuilder = this.ormQueryBuilder;

        queryBuilder.where(`${this.alias}.is_active = :isActive`, { isActive: true });

        this.conditions.forEach(cond => {
            const paramKey = this.getNextParamKey(cond.field);
            const condition = this.buildCondition(this.alias, cond, paramKey);

            return cond.value === null
                ? queryBuilder.andWhere(condition)
                : queryBuilder.andWhere(condition, { [paramKey]: cond.value });
        });

        this.sortCriteria.forEach((criterion, index) => {
            console.log(JSON.stringify(criterion));
            const { field, direction } = criterion;

            const _field = `${this.alias}.${field}`;
            console.log(_field);
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
