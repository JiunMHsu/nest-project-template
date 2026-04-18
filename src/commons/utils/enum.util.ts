import { z } from 'zod';

/**
 * Looks up a string-based enum value by its string representation.
 *
 * Returns `undefined` when the string doesn't match any enum value,
 * making it safe to use in validation/mapping contexts without throwing.
 *
 * @param enumObj The enum object to search.
 * @param value   The string to look up.
 * @returns The matching enum value, or `undefined` if not found.
 *
 * @example
 * enum Status { Active = 'active', Inactive = 'inactive' }
 *
 * getEnumValueByString(Status, 'active')   // → 'active'
 * getEnumValueByString(Status, 'ACTIVE')   // → undefined  (case-sensitive)
 * getEnumValueByString(Status, undefined)  // → undefined
 */
export function getEnumValueByString<T extends Record<string, string>>(
    enumObj: T,
    value: string | undefined,
): T[keyof T] | undefined {
    if (value === undefined) return undefined;

    const _string = z.string();
    const parseRes = _string.safeParse(value);
    if (!parseRes.success) throw new Error(`Value is not a valid string: ${value}`);

    const key = Object.keys(enumObj).find(k => enumObj[k] === value);
    return key ? (enumObj[key] as T[keyof T]) : undefined;
}

/**
 * Converts a value from one string-based enum to another by matching on
 * the string value.
 *
 * Returns `undefined` when no matching value exists in the target enum.
 * Useful for mapping between internal and external representations of the
 * same concept when the string values happen to be equal.
 *
 * @example
 * enum Source { Active = 'ACTIVE' }
 * enum Target { Active = 'ACTIVE', Inactive = 'INACTIVE' }
 *
 * convertEnum(Source.Active, Target) // → 'ACTIVE'
 */
export function convertEnum<T extends Record<string, string>, U extends Record<string, string>>(
    sourceValue: T[keyof T],
    targetEnum: U,
): U[keyof U] | undefined {
    return getEnumValueByString(targetEnum, sourceValue);
}
