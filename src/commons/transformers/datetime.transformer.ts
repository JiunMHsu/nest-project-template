import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { APP_TIMEZONE } from '@commons/constants/timezone';

/**
 * Transforms incoming date strings from Buenos Aires timezone to UTC Date object
 * Date strings are expected to be in ISO 8601 format. E.g., "2024-12-31T15:00:00"
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
