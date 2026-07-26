import { Observable, tap } from 'rxjs';
import { Request } from 'express';

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

export enum LogMode {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE',
    BOTH = 'BOTH',
}

const REDACTED_KEYS = new Set(['authorization', 'apikey', 'secret']);

const REDACTED = '[REDACTED]';

function redact(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) =>
                REDACTED_KEYS.has(k.toLowerCase()) ? [k, REDACTED] : [k, redact(v)],
            ),
        );
    }
    return value;
}

function format(value: unknown) {
    return JSON.stringify(redact(value), null, 2);
}

function logRequest(logger: Logger, mode: LogMode, label: string, req: Request) {
    if (mode === LogMode.RESPONSE) return;
    logger.log(`[REQUEST] ${label} :: body: ${format(req.body)}`);
    logger.log(`[REQUEST] ${label} :: query: ${format(req.query)}`);
    logger.log(`[REQUEST] ${label} :: params: ${format(req.params)}`);
}

function logResponse(logger: Logger, mode: LogMode, label: string, response: unknown) {
    if (mode === LogMode.REQUEST) return;
    logger.log(`[RESPONSE] ${label} :: ${format(response)}`);
}

@Injectable()
export class LogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LogInterceptor.name);

    constructor(private readonly mode: LogMode) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req: Request = context.switchToHttp().getRequest();
        const label = `${req.method} ${req.originalUrl}`;
        logRequest(this.logger, this.mode, label, req);
        return next.handle().pipe(tap(response => logResponse(this.logger, this.mode, label, response)));
    }
}
