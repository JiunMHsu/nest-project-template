/**
 * An optional date range with a start and end bound. Both bounds are
 * optional — only the provided ones are meant to be applied as filters.
 */
export interface DateRange {
    from?: Date;
    to?: Date;
}
