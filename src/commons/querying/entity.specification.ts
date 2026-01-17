import { IsOptional, IsUUID } from 'class-validator';
import { TransformToUTC } from '@commons/transformers/datetime.transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Abstract class representing a specification for querying entities.
 * It includes common filtering criteria such as ID, creation and update timestamps, and active status.
 *
 * Is meant to be extended by more specific specification classes for different entities.
 */
export abstract class EntitySpecification {
    @ApiPropertyOptional({ description: 'Filter by unique identifier, UUID', type: String })
    @IsOptional()
    @IsUUID()
    public id?: string;

    @ApiPropertyOptional({
        description: 'Filter by creation date after the specified timestamp',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @TransformToUTC()
    public createdAfter?: Date;

    @ApiPropertyOptional({
        description: 'Filter by creation date before the specified timestamp',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @TransformToUTC()
    public createdBefore?: Date;

    @ApiPropertyOptional({
        description: 'Filter by last update date after the specified timestamp',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @TransformToUTC()
    public updatedAfter?: Date;

    @ApiPropertyOptional({
        description: 'Filter by last update date before the specified timestamp',
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @TransformToUTC()
    public updatedBefore?: Date;
}
