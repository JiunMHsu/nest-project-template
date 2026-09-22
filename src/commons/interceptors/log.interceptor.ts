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

const CIRCULAR = '[Circular]';
const UNSERIALIZABLE = '[Unserializable]';

/**
 * Deep-copies `value` with sensitive keys masked.
 *
 * `ancestors` tracks the objects on the current branch so a cycle — common in
 * TypeORM entities with bidirectional relations — is replaced rather than
 * recursed into. Logging must never be able to fail the request it is logging.
 */
function redact(value: unknown, ancestors: WeakSet<object>): unknown {
    if (!value || typeof value !== 'object') return value;
    if (ancestors.has(value)) return CIRCULAR;

    ancestors.add(value);
    const redacted = Array.isArray(value)
        ? value.map(item => redact(item, ancestors))
        : Object.fromEntries(
              Object.entries(value as Record<string, unknown>).map(([k, v]) =>
                  REDACTED_KEYS.has(k.toLowerCase()) ? [k, REDACTED] : [k, redact(v, ancestors)],
              ),
          );
    ancestors.delete(value);

    return redacted;
}

function format(value: unknown) {
    // A BigInt, or a getter that throws, must not escape into the request path.
    try {
        return JSON.stringify(redact(value, new WeakSet()), null, 2);
    } catch {
        return UNSERIALIZABLE;
    }
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
