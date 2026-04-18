/**
 * Applies partial updates to an entity, skipping `undefined` values and,
 * by default, `null` values.
 *
 * This is useful in PATCH handlers where only the fields explicitly provided
 * by the caller should be updated, and `null` should only be written when
 * the field is intentionally nullable (e.g. clearing a foreign key).
 *
 * @param entity  The entity to mutate.
 * @param updates Partial updates to apply.
 * @param option.allowNull Fields that are permitted to be set to `null`.
 * @returns The same (mutated) entity reference.
 *
 * @example
 * updateEntity(user, { name: 'Jane', phone: undefined });
 * // name is updated, phone is skipped
 *
 * updateEntity(user, { email: null }, { allowNull: ['email'] });
 * // email is explicitly cleared to null
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
