import 'reflect-metadata';

import { lastValueFrom, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CallHandler, Logger, NestInterceptor } from '@nestjs/common';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';

import { LogReqRes, LogRequest, LogResponse } from '@commons/decorators/log.decorator';
import { LogInterceptor } from '@commons/interceptors/log.interceptor';
import { createHttpContext } from '@test/utils/context';

class WidgetsController {
    @LogRequest()
    public request(): void {}

    @LogResponse()
    public response(): void {}

    @LogReqRes()
    public both(): void {}
}

type Method = 'request' | 'response' | 'both';

function interceptorsOn(method: Method): NestInterceptor[] {
    return (Reflect.getMetadata(INTERCEPTORS_METADATA, WidgetsController.prototype[method]) ?? []) as NestInterceptor[];
}

describe('log decorators', () => {
    let logged: string[];

    beforeEach(() => {
        logged = [];
        vi.spyOn(Logger.prototype, 'log').mockImplementation((message: string) => {
            logged.push(message);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    async function run(method: Method): Promise<void> {
        const [interceptor] = interceptorsOn(method);
        const next: CallHandler = { handle: () => of({ ok: true }) };

        await lastValueFrom(interceptor.intercept(createHttpContext(), next) as ReturnType<typeof of>);
    }

    it.each<Method>(['request', 'response', 'both'])('should attach exactly one interceptor to %s', async method => {
        expect(interceptorsOn(method)).toHaveLength(1);
    });

    it.each<Method>(['request', 'response', 'both'])('should attach a LogInterceptor to %s', async method => {
        expect(interceptorsOn(method)[0]).toBeInstanceOf(LogInterceptor);
    });

    describe('LogRequest', () => {
        it('should log the request only', async () => {
            await run('request');

            expect(logged.some(line => line.startsWith('[REQUEST]'))).toBe(true);
            expect(logged.some(line => line.startsWith('[RESPONSE]'))).toBe(false);
        });
    });

    describe('LogResponse', () => {
        it('should log the response only', async () => {
            await run('response');

            expect(logged.some(line => line.startsWith('[REQUEST]'))).toBe(false);
            expect(logged.some(line => line.startsWith('[RESPONSE]'))).toBe(true);
        });
    });

    describe('LogReqRes', () => {
        it('should log both the request and the response', async () => {
            await run('both');

            expect(logged.some(line => line.startsWith('[REQUEST]'))).toBe(true);
            expect(logged.some(line => line.startsWith('[RESPONSE]'))).toBe(true);
        });
    });
});
