import { SelectQueryBuilder } from 'typeorm';

import { Direction, Page, PageRequest, Sort } from '@libs/paging/core';

/**
 * Applies a `Sort` to a query builder as `ORDER BY` clauses, prefixed by `alias`.
 */
export function applySort<T>(qb: SelectQueryBuilder<T>, alias: string, sort: Sort): SelectQueryBuilder<T> {
    sort.toArray().forEach((order, index) => {
        const direction = order.direction === Direction.DESC ? 'DESC' : 'ASC';
        const field = `${alias}.${order.property}`;

        if (index === 0) qb.orderBy(field, direction);
        else qb.addOrderBy(field, direction);
    });

    return qb;
}

/**
 * Applies sorting and pagination to a query builder and executes it, returning a `Page`.
 *
 * @note TypeORM's `skip`/`take` can miscount when the query joins a to-many
 * relation, so split the query or use a subquery in that case instead.
 *
 * @example
 * const page = await paginate(qb, 'u', new PageRequest(0, 10, new Sort('name', Direction.ASC)));
 */
export async function paginate<T>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    pageRequest: PageRequest,
): Promise<Page<T>> {
    applySort(qb, alias, pageRequest.sort);
    qb.skip(pageRequest.offset).take(pageRequest.pageSize);

    const [content, totalElements] = await qb.getManyAndCount();
    return new Page(content, pageRequest, totalElements);
}
