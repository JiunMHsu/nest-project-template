import 'reflect-metadata';

import { instanceToPlain, plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';

import { NamedProperty, NamedPropertyOptional } from '@commons/decorators/named-property.decorator';

const API_MODEL_PROPERTIES = 'swagger/apiModelProperties';

class Dto {
    @NamedProperty('created_at', { description: 'When it was created', example: '2024-01-01T00:00:00.000Z' })
    public createdAt: string;

    @NamedPropertyOptional('deleted_at', { description: 'When it was deleted' })
    public deletedAt?: string;
}

function swaggerMetadataOf(property: string): Record<string, unknown> {
    return Reflect.getMetadata(API_MODEL_PROPERTIES, Dto.prototype, property) as Record<string, unknown>;
}

describe('NamedProperty', () => {
    describe('transformation', () => {
        it('should read the property from its wire name', () => {
            const dto = plainToInstance(Dto, { created_at: '2024-01-01' }, { excludeExtraneousValues: true });

            expect(dto.createdAt).toBe('2024-01-01');
        });

        it('should not read the property from its class name', () => {
            const dto = plainToInstance(Dto, { createdAt: '2024-01-01' }, { excludeExtraneousValues: true });

            expect(dto.createdAt).toBeUndefined();
        });

        it('should write the property under its wire name', () => {
            const dto = plainToInstance(Dto, { created_at: '2024-01-01' }, { excludeExtraneousValues: true });

            expect(instanceToPlain(dto)).toHaveProperty('created_at', '2024-01-01');
        });
    });

    describe('swagger metadata', () => {
        it('should document the property under its wire name', () => {
            expect(swaggerMetadataOf('createdAt')).toMatchObject({ name: 'created_at' });
        });

        it('should pass the supplied options through', () => {
            expect(swaggerMetadataOf('createdAt')).toMatchObject({
                description: 'When it was created',
                example: '2024-01-01T00:00:00.000Z',
            });
        });

        it('should leave required unset, which Swagger reads as required', () => {
            expect(swaggerMetadataOf('createdAt').required).toBeUndefined();
        });
    });
});

describe('NamedPropertyOptional', () => {
    it('should document the property under its wire name', () => {
        expect(swaggerMetadataOf('deletedAt')).toMatchObject({ name: 'deleted_at' });
    });

    it('should mark the property as not required', () => {
        expect(swaggerMetadataOf('deletedAt')).toMatchObject({ required: false });
    });

    it('should still expose the property under its wire name', () => {
        const dto = plainToInstance(Dto, { deleted_at: '2024-03-01' }, { excludeExtraneousValues: true });

        expect(dto.deletedAt).toBe('2024-03-01');
    });
});
