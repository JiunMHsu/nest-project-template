import { NamedProperty } from '@commons/decorators/named-property.decorator';
import { Page } from '@libs/paging/core';

/**
 * The wire shape of a paginated response. Separate from `Page` on purpose:
 * `Page` is a plain internal value object, this is the Swagger-annotated DTO
 * a controller actually returns.
 */
export class PageResponse<T> {
    @NamedProperty('content', { isArray: true, description: 'The items for the current page' })
    public readonly content: T[];

    @NamedProperty('page', { description: 'The current page number (0-indexed)', example: 0 })
    public readonly page: number;

    @NamedProperty('size', { description: 'The number of items per page', example: 20 })
    public readonly size: number;

    @NamedProperty('total_elements', { description: 'The total number of items available', example: 57 })
    public readonly totalElements: number;

    @NamedProperty('total_pages', { description: 'The total number of pages available', example: 3 })
    public readonly totalPages: number;

    @NamedProperty('is_last', { description: 'Whether this is the last page', example: false })
    public readonly isLast: boolean;

    private constructor(page: Page<T>) {
        this.page = page.pageNumber;
        this.size = page.pageSize;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.isLast = page.isLast();
        this.content = [...page.content];
    }

    public static from<T>(page: Page<T>): PageResponse<T> {
        return new PageResponse(page);
    }
}
