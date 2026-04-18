import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformToUTC } from '@commons/transformers/datetime.transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateRange } from '@commons/querying/date-range';

/**
 * Abstract base class for query filter DTOs.
 *
 * Provides common filtering fields for all persistent entities: `id`,
 * date range filters for `createdAt` and `updatedAt`, and a `deleted` flag
 * to include soft-deleted records.
 *
 * Query string fields are intentionally flat for readability:
 * `?createdAfter=...&createdBefore=...` instead of `?createdAt[from]=...`.
 *
 * `DateRange` getters (`createdAt`, `updatedAt`) compose the flat fields into
 * a single object for use with `QueryBuilder.between()`.
 *
 * @example
 * ```TypeScript
 * export class ItemFilterDto extends EntitySpecification {
 *   @IsOptional()
 *   @IsString()
 *   name?: string;
 * }
 *
 * // In service:
 * queryBuilder
 *   .between('createdAt', filter.creationDateRange)
 *   .between('updatedAt', filter.updateDateRange)
 * ```
 */
export abstract class EntitySpecification {
    @ApiPropertyOptional({ description: 'Filter by unique identifier, UUID', type: String })
    @IsOptional()
    @IsUUID()
    public id?: string;

    @ApiPropertyOptional({
        description: 'Filter by creation date after this timestamp (Buenos Aires local time, no timezone suffix)',
        type: String,
        format: 'date-time',
        example: '2024-01-01T00:00:00',
    })
    @IsOptional()
    @TransformToUTC()
    public createdAfter?: Date;

    @ApiPropertyOptional({
        description: 'Filter by creation date before this timestamp (Buenos Aires local time, no timezone suffix)',
        type: String,
        format: 'date-time',
        example: '2024-12-31T23:59:59',
    })
    @IsOptional()
    @TransformToUTC()
    public createdBefore?: Date;

    @ApiPropertyOptional({
        description: 'Filter by last update date after this timestamp (Buenos Aires local time, no timezone suffix)',
        type: String,
        format: 'date-time',
        example: '2024-01-01T00:00:00',
    })
    @IsOptional()
    @TransformToUTC()
    public updatedAfter?: Date;

    @ApiPropertyOptional({
        description: 'Filter by last update date before this timestamp (Buenos Aires local time, no timezone suffix)',
        type: String,
        format: 'date-time',
        example: '2024-12-31T23:59:59',
    })
    @IsOptional()
    @TransformToUTC()
    public updatedBefore?: Date;

    @ApiPropertyOptional({
        description:
            'When true, includes soft-deleted records. When false or omitted, only active records are returned.',
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    public deleted?: boolean;

    /**
     * Composes `createdAfter` and `createdBefore` into a `DateRange` for `QueryBuilder.between()`.
     */
    get creationDateRange(): DateRange {
        return { from: this.createdAfter, to: this.createdBefore };
    }

    /**
     * Composes `updatedAfter` and `updatedBefore` into a `DateRange` for `QueryBuilder.between()`.
     */
    get updateDateRange(): DateRange {
        return { from: this.updatedAfter, to: this.updatedBefore };
    }
}
