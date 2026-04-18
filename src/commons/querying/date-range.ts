/**
 * Represents an optional date range with a start and end bound.
 * Both bounds are optional — only the provided ones are applied as filters.
 *
 * Used internally to pass date range filters to `QueryBuilder.between()`.
 * Query string fields remain flat (`createdAfter`, `createdBefore`, etc.);
 * `DateRange` objects are composed from those flat fields at the service layer.
 *
 * @example
 * queryBuilder.between('createdAt', filter.createdAt);
 * // equivalent to:
 * queryBuilder.between('createdAt', filter.createdAfter, filter.createdBefore);
 */
export interface DateRange {
    from?: Date;
    to?: Date;
}
