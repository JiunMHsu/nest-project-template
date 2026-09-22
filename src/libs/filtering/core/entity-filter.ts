import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsUUID } from 'class-validator';

import { NamedPropertyOptional } from '@commons/decorators/named-property.decorator';
import { DateRange } from '@libs/filtering/core/date-range';

/**
 * Base class for entity filter DTOs: id, created/updated date ranges, and a
 * soft-delete visibility flag. Query params stay flat (`createdAfter`,
 * `createdBefore`, ...) for readability; the `createdDateRange`/
 * `updatedDateRange` getters compose them for the query layer.
 *
 * Dates are parsed as standard ISO 8601 (with an explicit UTC offset or `Z`)
 * — no implicit local timezone, consistent with the rest of this API.
 */
export abstract class EntityFilter {
    @NamedPropertyOptional('id', { description: 'Filter by unique identifier, UUID' })
    @IsOptional()
    @IsUUID()
    public id?: string;

    @NamedPropertyOptional('created_after', {
        description: 'Filter by creation date after this UTC timestamp',
        example: '2024-01-01T00:00:00Z',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    public createdAfter?: Date;

    @NamedPropertyOptional('created_before', {
        description: 'Filter by creation date before this UTC timestamp',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    public createdBefore?: Date;

    @NamedPropertyOptional('updated_after', {
        description: 'Filter by last-update date after this UTC timestamp',
        example: '2024-01-01T00:00:00Z',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    public updatedAfter?: Date;

    @NamedPropertyOptional('updated_before', {
        description: 'Filter by last-update date before this UTC timestamp',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    public updatedBefore?: Date;

    @NamedPropertyOptional('deleted', { description: 'Include soft-deleted records. Defaults to excluding them.' })
    @IsOptional()
    @Transform(({ value }: { value: unknown }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    public deleted?: boolean;

    /** Composes `createdAfter`/`createdBefore` into a `DateRange`. */
    public get createdDateRange(): DateRange {
        return { from: this.createdAfter, to: this.createdBefore };
    }

    /** Composes `updatedAfter`/`updatedBefore` into a `DateRange`. */
    public get updatedDateRange(): DateRange {
        return { from: this.updatedAfter, to: this.updatedBefore };
    }
}
