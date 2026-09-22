import { Request } from 'express';

import { ExecutionContext } from '@nestjs/common';

/**
 * Builds a minimal `ExecutionContext` over a partial Express request, so param
 * decorators and interceptors can be exercised without booting an HTTP server.
 */
export function createHttpContext(request: Partial<Request> = {}): ExecutionContext {
    const req = {
        method: 'GET',
        originalUrl: '/',
        query: {},
        body: {},
        params: {},
        ...request,
    } as unknown as Request;

    const res = {};

    return {
        switchToHttp: () => ({
            getRequest: () => req,
            getResponse: () => res,
            getNext: () => undefined,
        }),
    } as unknown as ExecutionContext;
}
