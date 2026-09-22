import { PageRequest } from '@libs/paging/core/page-request';
import { Sort } from '@libs/paging/core/sort';

/**
 * A page of results with no total count — only whether another page exists.
 *
 * Cheaper than `Page`: callers fetch `pageSize + 1` rows and pass whether the
 * extra row was present as `hasNext`, avoiding a `COUNT(*)` query entirely.
 */
export class Slice<T> {
    public readonly content: readonly T[];
    public readonly page: number;
    public readonly count: number;
    public readonly sort: Sort;
    public readonly hasNext: boolean;

    public constructor(content: T[], pageable: PageRequest, hasNext: boolean) {
        this.content = content;
        this.page = pageable.page;
        this.count = pageable.size;
        this.sort = pageable.sort;
        this.hasNext = hasNext;
    }

    public hasContent(): boolean {
        return this.content.length > 0;
    }

    public hasPrevious(): boolean {
        return this.page > 0;
    }

    public isFirst(): boolean {
        return !this.hasPrevious();
    }

    public isLast(): boolean {
        return !this.hasNext;
    }

    /** The `PageRequest` for the next page, or `undefined` if this is the last one. */
    public nextPageRequest(): PageRequest | undefined {
        if (!this.hasNext) return undefined;
        return PageRequest.of(this.page + 1, this.count, this.sort);
    }

    /** The `PageRequest` for the previous page, or `undefined` if this is the first one. */
    public previousPageRequest(): PageRequest | undefined {
        if (!this.hasPrevious()) return undefined;
        return PageRequest.of(this.page - 1, this.count, this.sort);
    }

    public map<U>(fn: (item: T) => U): Slice<U> {
        const pageable = PageRequest.of(this.page, this.count, this.sort);
        return new Slice(this.content.map(fn), pageable, this.hasNext);
    }
}

/**
 * A page of results with a total count, for page-number-based navigation
 * (e.g. "page 3 of 12", "57 results").
 */
export class Page<T> extends Slice<T> {
    public readonly totalCount: number;

    public constructor(content: T[], pageable: PageRequest, totalCount: number) {
        super(content, pageable, pageable.offset + content.length < totalCount);
        this.totalCount = totalCount;
    }

    public get totalPages(): number {
        return this.page === 0 ? 1 : Math.ceil(this.totalCount / this.count);
    }

    public override map<U>(fn: (item: T) => U): Page<U> {
        const pageable = PageRequest.of(this.page, this.count, this.sort);
        return new Page(this.content.map(fn), pageable, this.totalCount);
    }
}
