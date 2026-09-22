import { Sort } from '@libs/paging/core/sort';

const minPageNumberError = 'Page index must not be less than zero';
const minPageSizeError = 'Page size must not be less than one';

/**
 * An immutable, 0-indexed page request: which page, how big, and in what order.
 *
 * Upper bounds on `size` (e.g. a max of 100) are deliberately not enforced
 * here. That's a policy decision that can vary per endpoint, and belongs in
 * the HTTP layer that parses the request, not in this value object.
 */
export class PageRequest {
    private constructor(
        public readonly page: number,
        public readonly size: number,
        public readonly sort: Sort = Sort.unsorted(),
    ) {
        if (page < 0) throw new Error(minPageNumberError);
        if (size < 1) throw new Error(minPageSizeError);
    }

    public static of(pageNumber: number, pageSize: number, sort: Sort = Sort.unsorted()): PageRequest {
        return new PageRequest(pageNumber, pageSize, sort);
    }

    /** Offset for the underlying query, e.g. TypeORM's `.skip()`. */
    public get offset(): number {
        return this.page * this.size;
    }

    public next(): PageRequest {
        return new PageRequest(this.page + 1, this.size, this.sort);
    }

    public previousOrFirst(): PageRequest {
        return this.hasPrevious() ? new PageRequest(this.page - 1, this.size, this.sort) : this.first();
    }

    public first(): PageRequest {
        return new PageRequest(0, this.size, this.sort);
    }

    public withSort(sort: Sort): PageRequest {
        return new PageRequest(this.page, this.size, sort);
    }

    public hasPrevious(): boolean {
        return this.page > 0;
    }
}
