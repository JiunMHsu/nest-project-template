import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ParsedQs } from 'qs';

/**
 * Converts comma-separated string values in a parsed query string into arrays.
 *
 * Only top-level string values are split — nested objects are passed through unchanged.
 *
 * @example
 * parseCommaSeparatedArrays({ tags: 'node,typescript,nestjs' })
 * // → { tags: ['node', 'typescript', 'nestjs'] }
 *
 * parseCommaSeparatedArrays({ name: 'john' })
 * // → { name: 'john' }  (no comma — left as-is)
 */
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

    await validateOrReject(dtoInstance as object, { whitelist: true }).catch(errors => {
        throw new BadRequestException(errors);
    });

    return dtoInstance;
}

/**
 * Param decorator that parses, transforms, and validates HTTP query parameters
 * into a typed DTO class.
 *
 * Comma-separated string values are automatically split into arrays before
 * transformation. Validation is performed via `class-validator`; invalid
 * parameters throw a `BadRequestException` (HTTP 400).
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@QueryParams() filter: ItemFilterDto) { ... }
 * ```
 */
export const QueryParams = createParamDecorator(queryToDto);
