import { Request } from 'express';

import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { Direction, PageRequest } from '@libs/paging/core';
import { SortParser, SortParserFactory } from '@libs/paging/http';

const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function queryToPageRequest(sortParser: SortParser, ctx: ExecutionContext): PageRequest {
    const request: Request = ctx.switchToHttp().getRequest();

    const rawPage = parseInt(request.query.page as string, 10);
    const rawSize = parseInt(request.query.size as string, 10);
    const page = Number.isNaN(rawPage) ? DEFAULT_PAGE_NUMBER : rawPage;
    const size = Number.isNaN(rawSize) ? DEFAULT_PAGE_SIZE : rawSize;

    if (size > MAX_PAGE_SIZE) {
        throw new BadRequestException(`Page size must not be greater than ${MAX_PAGE_SIZE}`);
    }

    const sort = sortParser.parse(request.query.sort);

    try {
        return PageRequest.of(page, size, sort);
    } catch (error) {
        throw new BadRequestException((error as Error).message);
    }
}

const PaginateParam = createParamDecorator(queryToPageRequest);

function applyPaginationDocs(sortParser: SortParser, target: object, propertyKey: string | symbol): void {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    if (!descriptor) return;

    const decorators = [
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Zero-based page index',
            schema: { type: 'integer', minimum: 0, default: DEFAULT_PAGE_NUMBER },
        }),
        ApiQuery({
            name: 'size',
            required: false,
            type: Number,
            description: 'Page size',
            schema: { type: 'integer', minimum: 1, maximum: MAX_PAGE_SIZE, default: DEFAULT_PAGE_SIZE },
        }),
    ];

    if (!sortParser.isEmpty()) {
        const allowedFields = sortParser.allowedFields();
        decorators.push(
            ApiQuery({
                name: 'sort',
                required: false,
                isArray: true,
                type: String,
                description:
                    `Sort as 'field,DIRECTION' (direction defaults to ASC). Repeatable. ` +
                    `Allowed fields: ${allowedFields.join(', ')}`,
                enum: allowedFields.flatMap(field => [`${field},${Direction.ASC}`, `${field},${Direction.DESC}`]),
            }),
        );
    }

    decorators.forEach(decorator => decorator(target, propertyKey, descriptor));
}

/**
 * Param decorator that parses `page`, `size`, and `sort` query params into a `PageRequest`.
 *
 * `sort` accepts one or more `field,DIRECTION` values (direction defaults to ASC).
 * Sorting by a field outside `sortableFields` throws a `BadRequestException` (HTTP 400),
 * as does an invalid `page`/`size`.
 *
 * @param sortableFields Whitelist of properties that may be sorted on.
 * An array of strings or an object mapping field names to their corresponding property names.
 *
 * @example
 * // GET /users?page=1&size=10&sort=last_name,ASC&sort=created_at,DESC
 * findAll(@Paginate({last_name: 'lastName', created_at: 'createdAt'}) pageRequest: PageRequest) { ... }
 */
export function Paginate(sortableFields: string[] | { [key: string]: string } = []): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
        const sortParser = SortParserFactory.create(sortableFields);
        PaginateParam(sortParser)(target, propertyKey, parameterIndex);

        // propertyKey is undefined for constructor params; nothing to document there
        if (propertyKey !== undefined) applyPaginationDocs(sortParser, target, propertyKey);
    };
}
