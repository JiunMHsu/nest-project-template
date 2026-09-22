import { lastValueFrom, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CallHandler, Logger } from '@nestjs/common';

import { LogInterceptor, LogMode } from '@commons/interceptors/log.interceptor';
import { createHttpContext } from '@test/utils/context';

function handlerReturning(value: unknown): CallHandler {
    return { handle: () => of(value) };
}

describe('LogInterceptor', () => {
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

    async function intercept(mode: LogMode, request = {}, response: unknown = { ok: true }): Promise<unknown> {
        const interceptor = new LogInterceptor(mode);
        return lastValueFrom(interceptor.intercept(createHttpContext(request), handlerReturning(response)));
    }

    describe('mode', () => {
        it('should log the request but not the response in REQUEST mode', async () => {
            await intercept(LogMode.REQUEST);

            expect(logged.some(line => line.startsWith('[REQUEST]'))).toBe(true);
            expect(logged.some(line => line.startsWith('[RESPONSE]'))).toBe(false);
        });

        it('should log the response but not the request in RESPONSE mode', async () => {
            await intercept(LogMode.RESPONSE);

            expect(logged.some(line => line.startsWith('[REQUEST]'))).toBe(false);
            expect(logged.some(line => line.startsWith('[RESPONSE]'))).toBe(true);
        });

        it('should log both in BOTH mode', async () => {
            await intercept(LogMode.BOTH);

            expect(logged.some(line => line.startsWith('[REQUEST]'))).toBe(true);
            expect(logged.some(line => line.startsWith('[RESPONSE]'))).toBe(true);
        });
    });

    describe('label', () => {
        it('should label each line with the method and url', async () => {
            await intercept(LogMode.BOTH, { method: 'POST', originalUrl: '/api/users?q=1' });

            expect(logged.every(line => line.includes('POST /api/users?q=1'))).toBe(true);
        });
    });

    describe('request logging', () => {
        it('should log the body, query and params', async () => {
            await intercept(LogMode.REQUEST, { body: { name: 'Ada' }, query: { q: 'x' }, params: { id: '7' } });

            expect(logged.find(line => line.includes(':: body:'))).toContain('"name": "Ada"');
            expect(logged.find(line => line.includes(':: query:'))).toContain('"q": "x"');
            expect(logged.find(line => line.includes(':: params:'))).toContain('"id": "7"');
        });
    });

    describe('redaction', () => {
        it('should redact a sensitive top-level key', async () => {
            await intercept(LogMode.REQUEST, { body: { authorization: 'Bearer token' } });

            const body = logged.find(line => line.includes(':: body:'));
            expect(body).toContain('[REDACTED]');
            expect(body).not.toContain('Bearer token');
        });

        it('should match sensitive keys case-insensitively', async () => {
            await intercept(LogMode.REQUEST, { body: { apiKey: 'sk-live-123' } });

            expect(logged.find(line => line.includes(':: body:'))).not.toContain('sk-live-123');
        });

        it('should redact a nested sensitive key', async () => {
            await intercept(LogMode.REQUEST, { body: { user: { secret: 'hunter2' } } });

            expect(logged.find(line => line.includes(':: body:'))).not.toContain('hunter2');
        });

        it('should redact inside arrays', async () => {
            await intercept(LogMode.REQUEST, { body: { creds: [{ secret: 'hunter2' }] } });

            expect(logged.find(line => line.includes(':: body:'))).not.toContain('hunter2');
        });

        it('should leave non-sensitive values intact', async () => {
            await intercept(LogMode.REQUEST, { body: { name: 'Ada' } });

            expect(logged.find(line => line.includes(':: body:'))).toContain('Ada');
        });
    });

    describe('unserializable payloads', () => {
        it('should not fail the response when it contains a circular reference', async () => {
            const response: Record<string, unknown> = { id: 1 };
            response.self = response;

            await expect(intercept(LogMode.RESPONSE, {}, response)).resolves.toBe(response);
        });

        it('should not fail the response when it contains a BigInt', async () => {
            const response = { total: 10n };

            await expect(intercept(LogMode.RESPONSE, {}, response)).resolves.toBe(response);
        });

        it('should not fail the response when a getter throws', async () => {
            const response = {
                get broken(): string {
                    throw new Error('lazy relation not loaded');
                },
            };

            await expect(intercept(LogMode.RESPONSE, {}, response)).resolves.toBe(response);
        });
    });
});
