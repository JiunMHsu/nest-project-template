import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { APP_TIMEZONE } from '@commons/constants/timezone';

/**
 * `class-transformer` property decorator that converts an incoming date string
 * from Buenos Aires local time to a UTC `Date` object.
 *
 * Input strings must be in ISO 8601 format **without** timezone information
 * (e.g. `"2024-12-31T15:00:00"`). The value is interpreted as Buenos Aires
 * local time and then converted to UTC.
 *
 * - `undefined` / `null` / empty string → `undefined`
 * - Existing `Date` object → returned as-is (assumed UTC)
 * - String with timezone suffix (`Z`, `+HH:MM`, `-HH:MM`) → throws
 * - Invalid format → throws
 *
 * @example
 * ```typescript
 * class FilterDto {
 *   @TransformToUTC()
 *   @IsOptional()
 *   createdAfter?: Date;
 * }
 * // Query: ?createdAfter=2024-07-01T09:00:00
 * // Result: createdAfter = 2024-07-01T12:00:00.000Z  (UTC-3 → UTC)
 * ```
 */
export function TransformToUTC() {
    return Transform(({ value }: { value: string | Date | undefined }): Date | undefined => {
        if (!value) return undefined;

        // If it's already a Date object, assume it is UTC
        if (value instanceof Date) return value;

        // If it's a string, parse as Buenos Aires time and convert to UTC
        if (typeof value === 'string') {
            if (value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)) {
                const err = 'Date must not include timezone. Provide local Buenos Aires time only.';
                throw new Error(err);
            }

            const localTime = DateTime.fromISO(value, { zone: APP_TIMEZONE });
            if (!localTime.isValid) throw new Error(`Invalid date format: ${value}`);
            return localTime.toUTC().toJSDate();
        }

        throw new Error(`Unsupported date type: ${typeof value}`);
    });
}
