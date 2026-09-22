import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { ApiPaginatedResponse } from '@libs/paging/http';

const API_RESPONSE = 'swagger/apiResponse';

class WidgetDetails {
    public id: string;
}

class WidgetsController {
    @ApiPaginatedResponse(WidgetDetails)
    public findAll(): void {}
}

function okSchema(): { allOf: Record<string, unknown>[] } {
    const responses = Reflect.getMetadata(API_RESPONSE, WidgetsController.prototype.findAll) as Record<
        string,
        { schema: { allOf: Record<string, unknown>[] } }
    >;

    return responses['200'].schema;
}

describe('ApiPaginatedResponse', () => {
    it('should document a 200 response', () => {
        const responses = Reflect.getMetadata(API_RESPONSE, WidgetsController.prototype.findAll) as Record<
            string,
            unknown
        >;

        expect(Object.keys(responses)).toContain('200');
    });

    it('should compose the schema from PageResponse', () => {
        expect(okSchema().allOf[0]).toEqual({ $ref: '#/components/schemas/PageResponse' });
    });

    it('should point content at the given model', () => {
        expect(okSchema().allOf[1]).toEqual({
            properties: {
                content: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/WidgetDetails' },
                },
            },
        });
    });
});
