/**
 * Update entity with partial updates
 * It skips undefined values and, by default, null values
 *
 * @param entity The entity to update
 * @param updates The partial updates
 * @param option Options for updating
 * @param option.allowNull List of keys that allow null values to be set
 *
 * @returns The updated entity
 */
export function updateEntity<T>(
    entity: T,
    updates: Partial<T>,
    option: { allowNull: string[] } = { allowNull: [] },
): T {
    const keys = Object.keys(updates) as (keyof T)[];
    for (const key of keys) {
        const value = updates[key];
        if (value === undefined) continue;
        if (value === null && !option.allowNull.includes(key as string)) continue;
        entity[key] = value;
    }

    return entity;
}
