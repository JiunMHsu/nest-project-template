import { Sort } from '@libs/paging/core/sort';

const minPageNumberError = 'Page index must not be less than zero';
const minPageSizeError = 'Page size must not be less than one';

/**
 * An immutable, 0-indexed page request: which page, how big, and in what order.
 *
 * Upper bounds on `pageSize` (e.g. a max of 100) are deliberately not enforced
 * here — that's a policy decision that can vary per endpoint, and belongs in
 * the HTTP layer that parses the request, not in this value object.
 */
export class PageRequest {
    private constructor(
        public readonly pageNumber: number,
        public readonly pageSize: number,
        public readonly sort: Sort = Sort.unsorted(),
    ) {
        if (pageNumber < 0) throw new Error(minPageNumberError);
        if (pageSize < 1) throw new Error(minPageSizeError);
    }

    public static of(pageNumber: number, pageSize: number, sort: Sort = Sort.unsorted()): PageRequest {
        return new PageRequest(pageNumber, pageSize, sort);
    }

    /** Offset for the underlying query, e.g. TypeORM's `.skip()`. */
    public get offset(): number {
        return this.pageNumber * this.pageSize;
    }

    public next(): PageRequest {
        return new PageRequest(this.pageNumber + 1, this.pageSize, this.sort);
    }

    public previousOrFirst(): PageRequest {
        return this.hasPrevious() ? new PageRequest(this.pageNumber - 1, this.pageSize, this.sort) : this.first();
    }

    public first(): PageRequest {
        return new PageRequest(0, this.pageSize, this.sort);
    }

    public withSort(sort: Sort): PageRequest {
        return new PageRequest(this.pageNumber, this.pageSize, sort);
    }

    public hasPrevious(): boolean {
        return this.pageNumber > 0;
    }
}
