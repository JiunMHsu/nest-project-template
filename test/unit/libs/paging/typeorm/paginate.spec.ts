import { SelectQueryBuilder } from 'typeorm';
import { beforeEach, describe, expect, it } from 'vitest';

import { Order, Page, PageRequest, Sort } from '@libs/paging/core';
import { applySort, paginate } from '@libs/paging/typeorm';
import { createMock, Mock } from '@test/utils/mock';

interface Widget {
    id: string;
    name: string;
}

function queryBuilder(): Mock<SelectQueryBuilder<Widget>> {
    const qb = createMock<SelectQueryBuilder<Widget>>();
    qb.orderBy.mockReturnValue(qb);
    qb.addOrderBy.mockReturnValue(qb);
    qb.skip.mockReturnValue(qb);
    qb.take.mockReturnValue(qb);
    return qb;
}

describe('applySort', () => {
    let qb: Mock<SelectQueryBuilder<Widget>>;

    beforeEach(() => {
        qb = queryBuilder();
    });

    it('should order by nothing when the sort is empty', () => {
        applySort(qb, 'w', Sort.unsorted());

        expect(qb.orderBy).not.toHaveBeenCalled();
    });

    it('should prefix the property with the alias', () => {
        applySort(qb, 'w', Sort.by('name'));

        expect(qb.orderBy).toHaveBeenCalledWith('w.name', 'ASC');
    });

    it('should pass a descending direction through', () => {
        applySort(qb, 'w', Sort.of(Order.desc('createdAt')));

        expect(qb.orderBy).toHaveBeenCalledWith('w.createdAt', 'DESC');
    });

    it('should not add a second order clause for a single order', () => {
        applySort(qb, 'w', Sort.by('name'));

        expect(qb.addOrderBy).not.toHaveBeenCalled();
    });

    it('should open with orderBy for the first order', () => {
        applySort(qb, 'w', Sort.of(Order.asc('name'), Order.desc('createdAt')));

        expect(qb.orderBy).toHaveBeenCalledExactlyOnceWith('w.name', 'ASC');
    });

    it('should append subsequent orders with addOrderBy', () => {
        applySort(qb, 'w', Sort.of(Order.asc('name'), Order.desc('createdAt'), Order.asc('id')));

        expect(qb.addOrderBy.mock.calls).toEqual([
            ['w.createdAt', 'DESC'],
            ['w.id', 'ASC'],
        ]);
    });

    it('should return the query builder', () => {
        expect(applySort(qb, 'w', Sort.by('name'))).toBe(qb);
    });
});

describe('paginate', () => {
    let qb: Mock<SelectQueryBuilder<Widget>>;

    beforeEach(() => {
        qb = queryBuilder();
        qb.getManyAndCount.mockResolvedValue([[{ id: '1', name: 'a' }], 57]);
    });

    it('should skip by the page offset', async () => {
        await paginate(qb, 'w', PageRequest.of(2, 10));

        expect(qb.skip).toHaveBeenCalledWith(20);
    });

    it('should take the page size', async () => {
        await paginate(qb, 'w', PageRequest.of(2, 10));

        expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('should apply the sort from the request', async () => {
        await paginate(qb, 'w', PageRequest.of(0, 10, Sort.of(Order.desc('name'))));

        expect(qb.orderBy).toHaveBeenCalledWith('w.name', 'DESC');
    });

    it('should not order an unsorted request', async () => {
        await paginate(qb, 'w', PageRequest.of(0, 10));

        expect(qb.orderBy).not.toHaveBeenCalled();
    });

    it('should return a Page', async () => {
        expect(await paginate(qb, 'w', PageRequest.of(0, 10))).toBeInstanceOf(Page);
    });

    it('should fill the page with the rows returned', async () => {
        expect((await paginate(qb, 'w', PageRequest.of(0, 10))).content).toEqual([{ id: '1', name: 'a' }]);
    });

    it('should carry the total count from the query', async () => {
        expect((await paginate(qb, 'w', PageRequest.of(0, 10))).totalCount).toBe(57);
    });

    it('should carry the page index and size from the request', async () => {
        const page = await paginate(qb, 'w', PageRequest.of(2, 10));

        expect(page.page).toBe(2);
        expect(page.count).toBe(10);
    });

    it('should resolve the total pages from the size and count', async () => {
        expect((await paginate(qb, 'w', PageRequest.of(0, 10))).totalPages).toBe(6);
    });

    it('should count the rows in one round trip', async () => {
        await paginate(qb, 'w', PageRequest.of(0, 10));

        expect(qb.getManyAndCount).toHaveBeenCalledTimes(1);
    });
});
