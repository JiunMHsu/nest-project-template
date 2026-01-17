import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ParsedQs } from 'qs';

export function parseCommaSeparatedArrays(parsedQs: ParsedQs): ParsedQs {
    const result: ParsedQs = {};
    const separator = ',';

    for (const [key, value] of Object.entries(parsedQs)) {
        if (typeof value !== 'string' || !value.includes(separator)) {
            result[key] = value;
            continue;
        }

        result[key] = value
            .split(separator)
            .map(v => v.trim())
            .filter(v => v);
    }

    return result;
}

async function queryToDto<T>(dtoClass: new () => T, ctx: ExecutionContext): Promise<T> {
    const request: Request = ctx.switchToHttp().getRequest();

    const queryParams = parseCommaSeparatedArrays(request.query);
    const dtoInstance = plainToInstance(dtoClass, queryParams, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
    });

    await validateOrReject(dtoInstance as object, { whitelist: true })
        .then(() => dtoInstance)
        .catch(() => {
            throw new Error();
        });

    return dtoInstance;
}

export const QueryParams = createParamDecorator(queryToDto);
