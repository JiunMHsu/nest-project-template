import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

interface ParamMetadata {
    index: number;
    data: unknown;
    factory?: (data: unknown, ctx: ExecutionContext) => unknown;
}

/**
 * Extracts the factory behind a `createParamDecorator`-based decorator applied
 * to `target[methodName]`, bound to the data it was declared with.
 *
 * Nest stores this metadata on the constructor, keyed by method name, so the
 * factory can be invoked directly against a fake `ExecutionContext`.
 */
export function getParamFactory(
    target: object,
    methodName: string,
    parameterIndex = 0,
): (ctx: ExecutionContext) => unknown {
    const metadata = (Reflect.getMetadata(ROUTE_ARGS_METADATA, target, methodName) ?? {}) as Record<
        string,
        ParamMetadata
    >;

    const param = Object.values(metadata).find(
        entry => typeof entry?.factory === 'function' && entry.index === parameterIndex,
    );

    if (!param?.factory) {
        throw new Error(`No custom param decorator at index ${parameterIndex} of ${methodName}`);
    }

    const { factory, data } = param;
    return ctx => factory(data, ctx);
}
