import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 0;

const minPageNumberError = 'Page index must not be less than zero';
const minPageSizeError = 'Page size must not be less than one';
const maxPageSizeError = `Page size must not be greater than ${MAX_PAGE_SIZE}`;

/**
 * Encapsulates pagination parameters with built-in validation.
 *
 * Pages are 0-indexed. `offset` is calculated automatically and is ready
 * for use with TypeORM's `.skip()`.
 *
 * @throws {Error} When `page < 0`, `size < 1`, or `size > 100`.
 *
 * @example
 * const paging = new PageRequest(2, 10);
 * // paging.page   → 2
 * // paging.size   → 10
 * // paging.offset → 20
 */
export class PageRequest {
    public readonly page: number;
    public readonly size: number;
    /** Pre-calculated offset (`page * size`) for use with TypeORM's `.skip()`. */
    public readonly offset: number;

    public constructor(page: number = DEFAULT_PAGE_NUMBER, size: number = DEFAULT_PAGE_SIZE) {
        if (page < 0) throw new Error(minPageNumberError);
        if (size < 1) throw new Error(minPageSizeError);
        if (size > MAX_PAGE_SIZE) throw new Error(maxPageSizeError);

        this.page = page;
        this.size = size;
        this.offset = page * size;
    }
}

function queryToPageRequest(__: unknown, ctx: ExecutionContext): PageRequest {
    const req: Request = ctx.switchToHttp().getRequest();
    const rawPage = parseInt(req.query.page as string);
    const rawSize = parseInt(req.query.size as string);
    const page = isNaN(rawPage) ? DEFAULT_PAGE_NUMBER : rawPage;
    const size = isNaN(rawSize) ? DEFAULT_PAGE_SIZE : rawSize;

    try {
        return new PageRequest(page, size);
    } catch (error) {
        throw new BadRequestException((error as Error).message);
    }
}

/**
 * Param decorator that parses `page` and `size` query parameters into a `PageRequest`.
 *
 * Non-numeric values fall back to defaults (`page=0`, `size=20`).
 * Invalid values (negative page, size out of range) throw a `BadRequestException` (HTTP 400).
 *
 * @example
 * ```typescript
 * // GET /items?page=1&size=10
 * @Get()
 * findAll(@Paging() paging: PageRequest) {
 *   // paging.page → 1, paging.size → 10, paging.offset → 10
 * }
 * ```
 */
export const Paging = createParamDecorator(queryToPageRequest);
