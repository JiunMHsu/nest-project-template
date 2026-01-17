import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ParsedQs } from 'qs';

export type SortDirection = 'ASC' | 'DESC';

export interface SortCriterion {
    field: string;
    direction: SortDirection;
}

export class SortRequest {
    private readonly options: Map<string, SortDirection>;

    public constructor() {
        this.options = new Map<string, SortDirection>();
    }

    public addCriterion(field: string, direction: SortDirection): void {
        this.options.set(field, direction);
    }

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
 * Decorator to extract sorting criteria from query parameters.
 *
 * Usage:
 *
 * ```typescript
 * @Get()
 * public async findAll(@Sorting(['name', 'email']) sorting: SortRequest) {
 *     // Use sorting criteria
 * }
 * ```
 *
 * The valid key array only accepts plain field names, no nested paths.
 *
 * ```typescript
 * @Sorting(['name.firstName', 'address.city']) // Invalid
 * ```
 */
export const Sorting = createParamDecorator(queryToSortRequest);
