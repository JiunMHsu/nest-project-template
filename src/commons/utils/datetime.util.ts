import { DateTime } from 'luxon';
import { APP_TIMEZONE } from '@commons/constants/timezone';

/**
 * Date formatting utilities for the application timezone (Buenos Aires, UTC-3).
 */
export class DateConverter {
    /**
     * Converts a UTC `Date` to an ISO 8601 string in the Buenos Aires timezone.
     *
     * Returns `undefined` when the input is `null` or `undefined`, making it
     * safe to use with optional fields like `deletedAt`.
     *
     * @example
     * DateConverter.toLocalISO(new Date('2024-07-01T12:00:00Z'))
     * // → '2024-07-01T09:00:00.000-03:00'
     *
     * DateConverter.toLocalISO(null)
     * // → undefined
     */
    public static toLocalISO(date: Date | null | undefined): string | undefined {
        if (!date) return undefined;
        return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(APP_TIMEZONE).toISO();
    }
}
