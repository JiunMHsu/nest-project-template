import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ParsedQs } from 'qs';

export type SortDirection = 'ASC' | 'DESC';

export interface SortCriterion {
    field: string;
    direction: SortDirection;
}

/**
 * Holds validated sort criteria parsed from query parameters.
 *
 * Fields are stored in a `Map`, so adding the same field twice simply
 * overwrites its direction — no duplicates.
 *
 * Typically consumed by passing `sortRequest.getCriteria()` to `QueryBuilder`.
 */
export class SortRequest {
    private readonly options: Map<string, SortDirection>;

    public constructor() {
        this.options = new Map<string, SortDirection>();
    }

    /** Adds or updates a sort criterion for the given field. */
    public addCriterion(field: string, direction: SortDirection): void {
        this.options.set(field, direction);
    }

    /** Returns all sort criteria in insertion order. */
    public getCriteria(): SortCriterion[] {
        const result: SortCriterion[] = [];
        this.options.forEach((direction, field) => {
            result.push({ field, direction });
        });
        return result;
    }
}

function parseSortByQuery(query: ParsedQs): Array<SortCriterion> {
    const result: Array<SortCriterion> = [];
    const sortBy = query.sortBy;
    if (!sortBy) return result;

    const sortByArray: string[] = [];

    if (typeof sortBy === 'string') {
        sortByArray.push(sortBy);
    } else if (Array.isArray(sortBy)) {
        // Filter to only strings in case array has mixed types
        sortByArray.push(...sortBy.filter((item): item is string => typeof item === 'string'));
    }

    sortByArray.forEach((sortByValue: string) => {
        const [field, dir] = sortByValue.split(',');
        if (!field) return;
        const direction: SortDirection = dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        result.push({ field: field.trim(), direction });
    });

    return result;
}

function validateField(field: string, validFields: string[]): void {
    if (validFields.length === 0) return;
    if (!validFields.includes(field)) {
        throw new BadRequestException(`Can not sort by '${field}'. Allowed fields are: ${validFields.join(', ')}`);
    }
}

function queryToSortRequest(validKeys: string[], ctx: ExecutionContext): SortRequest {
    const request: Request = ctx.switchToHttp().getRequest();
    const _validKeys = ['id', 'createdAt', 'updatedAt', ...validKeys];
    const sortRequest = new SortRequest();

    const criteria = parseSortByQuery(request.query);
    criteria.forEach(criterion => {
        const { field, direction } = criterion;
        validateField(field, _validKeys);
        sortRequest.addCriterion(field, direction);
    });

    return sortRequest;
}

/**
 * Param decorator that parses and validates sort criteria from the `sortBy` query parameter.
 *
 * Accepts one or more `sortBy` values in the format `field,direction` where direction
 * defaults to `ASC` if omitted. The fields `id`, `createdAt`, and `updatedAt` are always
 * allowed in addition to those explicitly provided.
 *
 * Throws `BadRequestException` (HTTP 400) if an unrecognised field is requested.
 *
 * @param validFields - Additional field names allowed for sorting (plain names only, no dot paths).
 *
 * @example
 * ```typescript
 * // GET /items?sortBy=name,ASC&sortBy=createdAt,DESC
 * @Get()
 * findAll(@Sorting(['name', 'status']) sorting: SortRequest) {
 *   const criteria = sorting.getCriteria();
 *   // [{ field: 'name', direction: 'ASC' }, { field: 'createdAt', direction: 'DESC' }]
 * }
 * ```
 */
export const Sorting = createParamDecorator(queryToSortRequest);
