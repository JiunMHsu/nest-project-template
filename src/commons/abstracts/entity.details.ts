import { PersistentEntity } from '@commons/abstracts/persistent.entity';
import { DateConverter } from '@commons/utils/datetime.util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EntityDetails {
    @ApiProperty({
        description: 'The unique identifier of the entity, UUID format',
        example: 'a3f1c9e2-5d6b-4f8e-9c2d-1e2f3a4b5c6d',
    })
    public readonly id: string;

    @ApiProperty({
        description: 'The creation timestamp of the entity in local ISO format, Buenos Aires timezone',
        example: '2023-10-05T14:48:00.000-03:00',
    })
    public readonly createdAt: string;

    @ApiProperty({
        description: 'The last update timestamp of the entity in local ISO format, Buenos Aires timezone',
        example: '2023-10-10T09:15:30.000-03:00',
    })
    public readonly updatedAt: string;

    @ApiPropertyOptional({
        description: `The deletion timestamp of the entity in local ISO format, Buenos Aires timezone.
                      This field is optional and only present if the entity has been soft-deleted.`,
        example: '2023-10-05T14:48:00.000-03:00',
    })
    public readonly deletedAt?: string;

    protected constructor(entity: PersistentEntity) {
        this.id = entity.id;
        this.createdAt = DateConverter.toLocalISO(entity.createdAt);
        this.updatedAt = DateConverter.toLocalISO(entity.updatedAt);
        this.deletedAt = DateConverter.toLocalISO(entity.deletedAt);
    }
}
