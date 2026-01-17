import { z } from 'zod';

/**
 * Gets the enum's value by string.
 *
 * @template T Enum type (string-based).
 * @param enumObj The enum object to search in.
 * @param value The value to look for in the enum.
 * @returns {T[keyof T] | undefined} The corresponding enum value if found, otherwise `undefined`.
 *
 * @throws {Error} If the provided value is not a valid string.
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
 * Converts a value from one enum to another based on matching string values.
 *
 * @template T Source enum type (string-based).
 * @template U Target enum type (string-based).
 * @param sourceValue The value from the source enum to convert.
 * @param targetEnum The target enum object to convert to.
 * @returns {U[keyof U] | undefined} The corresponding value in the target enum if found, otherwise `undefined`.
 */
export function convertEnum<T extends Record<string, string>, U extends Record<string, string>>(
    sourceValue: T[keyof T],
    targetEnum: U,
): U[keyof U] | undefined {
    return getEnumValueByString(targetEnum, sourceValue);
}
