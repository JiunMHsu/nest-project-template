import { PersistentEntity } from '@commons/models/persistent-entity.abstract';
import { DateConverter } from '@commons/utils/datetime.util';
import { NamedProperty, NamedPropertyOptional } from '@commons/decorators/named-property.decorator';

export class EntityDetails {
    @NamedProperty('id', {
        description: 'The unique identifier of the entity, UUID format',
        example: 'a3f1c9e2-5d6b-4f8e-9c2d-1e2f3a4b5c6d',
    })
    public readonly id: string;

    @NamedProperty('created_at', {
        description: 'The creation timestamp of the entity, UTC ISO 8601 format',
        example: '2023-10-05T17:48:00.000Z',
    })
    public readonly createdAt: string;

    @NamedProperty('updated_at', {
        description: 'The last update timestamp of the entity, UTC ISO 8601 format',
        example: '2023-10-10T12:15:30.000Z',
    })
    public readonly updatedAt: string;

    @NamedPropertyOptional('deleted_at', {
        description:
            'The deletion timestamp of the entity, UTC ISO 8601 format. Only present if the entity has been soft-deleted.',
        example: '2023-10-05T17:48:00.000Z',
    })
    public readonly deletedAt?: string;

    protected constructor(entity: PersistentEntity) {
        this.id = entity.id;
        this.createdAt = DateConverter.toISO(entity.createdAt);
        this.updatedAt = DateConverter.toISO(entity.updatedAt);
        this.deletedAt = DateConverter.toISO(entity.deletedAt);
    }
}
