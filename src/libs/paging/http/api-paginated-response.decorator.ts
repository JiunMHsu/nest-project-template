import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PageResponse } from '@libs/paging/http/page.response';

/**
 * Documents an endpoint returning `PageResponse<TModel>`.
 *
 * NestJS Swagger can't infer generics from `PageResponse<T>` on its own, and
 * `content` would render as an untyped array. This composes the schema by hand:
 * `PageResponse`'s own shape, with `content` pointed at `model`.
 *
 * @example
 * @Get()
 * @ApiPaginatedResponse(UserDetails)
 * findAll(@Query() spec: UserSpecification, @Paginate([...]) pageRequest: PageRequest) { ... }
 */
export function ApiPaginatedResponse<TModel extends Type<unknown>>(model: TModel): MethodDecorator {
    return applyDecorators(
        ApiExtraModels(PageResponse, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PageResponse) },
                    {
                        properties: {
                            content: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
}
