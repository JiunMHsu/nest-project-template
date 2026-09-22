import { Expose } from 'class-transformer';

import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';

export function NamedProperty(name: string, options: ApiPropertyOptions = {}) {
    return applyDecorators(Expose({ name }), ApiProperty({ ...options, name }));
}
export function NamedPropertyOptional(name: string, options: ApiPropertyOptions = {}) {
    return applyDecorators(Expose({ name }), ApiPropertyOptional({ ...options, name }));
}
