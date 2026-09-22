/**
 * Date formatting utilities.
 */
export class DateConverter {
    /**
     * Converts a `Date` to a UTC ISO 8601 string.
     *
     * Returns `undefined` when the input is `null` or `undefined`, making it
     * safe to use with optional fields like `deletedAt`.
     *
     * @example
     * DateConverter.toISO(new Date('2024-07-01T12:00:00Z'))
     * // → '2024-07-01T12:00:00.000Z'
     *
     * DateConverter.toISO(null)
     * // → undefined
     */
    public static toISO(date: Date | null | undefined): string | undefined {
        if (!date) return undefined;
        return date.toISOString();
    }
}
