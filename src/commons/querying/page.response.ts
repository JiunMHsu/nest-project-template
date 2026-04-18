import { PageRequest } from '@commons/querying/page.request';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Standardised paginated response wrapper.
 *
 * Carries the current page's data alongside metadata (`total`, `totalPages`)
 * that clients need to implement pagination controls. Pages are 0-indexed,
 * consistent with `PageRequest`.
 *
 * @example
 * const response = await queryBuilder.getPage(paging);
 * // { page: 0, size: 20, total: 57, totalPages: 3, data: [...] }
 *
 * const dto = response.transform(entity => new EntityDto(entity));
 */
export class PageResponse<T> {
    @ApiProperty({
        description: 'The current page number (0-indexed)',
        example: 0,
    })
    public readonly page: number;

    @ApiProperty({
        description: 'The number of items per page',
        example: 10,
    })
    public readonly size: number;

    @ApiProperty({
        description: 'The total number of items available',
        example: 57,
    })
    public readonly total: number;

    @ApiProperty({
        description: 'The total number of pages available',
        example: 6,
    })
    public readonly totalPages: number;

    @ApiProperty({
        description: 'The list of items for the current page',
        isArray: true,
    })
    public readonly data: T[];

    public constructor(data: T[], page: number, size: number, total: number) {
        this.data = data;
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = Math.ceil(total / size);
    }

    /**
     * Synchronously maps each item in `data` through `fn`, returning a new
     * `PageResponse` with the same pagination metadata.
     *
     * @example
     * const dtoPage = entityPage.transform(e => new EntityDto(e));
     */
    public transform<U>(fn: (item: T) => U): PageResponse<U> {
        const transformedData = this.data.map(fn);
        return new PageResponse<U>(transformedData, this.page, this.size, this.total);
    }

    /**
     * Asynchronously maps each item in `data` through `fn` in parallel,
     * returning a new `PageResponse` with the same pagination metadata.
     *
     * @example
     * const enriched = await page.transformAsync(async e => ({
     *   ...new EntityDto(e),
     *   extra: await loadExtra(e.id),
     * }));
     */
    public async transformAsync<U>(fn: (item: T) => Promise<U>): Promise<PageResponse<U>> {
        const transformedData = await Promise.all(this.data.map(fn));
        return new PageResponse<U>(transformedData, this.page, this.size, this.total);
    }

    /**
     * Returns a `PageRequest` for the next page, or `null` if the current
     * page is already the last one.
     *
     * Useful for cursor-style iteration or constructing pagination links.
     */
    public getNextPageRequest(): PageRequest | null {
        if (this.page + 1 >= this.totalPages) return null;
        return new PageRequest(this.page + 1, this.size);
    }
}
