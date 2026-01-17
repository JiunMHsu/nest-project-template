import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 0;

const minPageNumberError = 'Page index must not be less than zero';
const minPageSizeError = 'Page size must not be less than one';
const maxPageSizeError = `Page size must not be greater than ${MAX_PAGE_SIZE}`;

export class PageRequest {
    public readonly page: number;
    public readonly size: number;
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
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE_NUMBER;
    const size = parseInt(req.query.size as string) || DEFAULT_PAGE_SIZE;

    try {
        return new PageRequest(page, size);
    } catch (error) {
        throw new BadRequestException((error as Error).message);
    }
}

export const Paging = createParamDecorator(queryToPageRequest);
