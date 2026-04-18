/**
 * Rounds a number to the given number of decimal places.
 *
 * Uses the multiply-then-divide method, which is fast but subject to
 * floating-point representation errors for certain values (e.g. `1.005`).
 * For financial calculations requiring exact rounding, use a dedicated
 * decimal library instead.
 *
 * @example
 * roundTo(3.14159, 2) // → 3.14
 * roundTo(3.14159, 0) // → 3
 */
export const roundTo = (num: number, decimalPlaces: number): number => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
};

/**
 * Rounds a number to 4 decimal places.
 *
 * @throws {Error} If the input is `null` or `undefined`.
 *
 * @example
 * roundToDefault(1.23456789) // → 1.2346
 */
export const roundToDefault = (num: number): number => {
    if (num === null || num === undefined) throw new Error('Invalid number');
    return roundTo(num, 4);
};

/**
 * Rounds a number to 2 decimal places.
 *
 * @throws {Error} If the input is `null` or `undefined`.
 *
 * @example
 * roundToTwoDecimals(10.9876) // → 10.99
 */
export const roundToTwoDecimals = (num: number): number => {
    if (num === null || num === undefined) throw new Error('Invalid number');
    return roundTo(num, 2);
};

/**
 * Generates an array of consecutive integers from `start` to `end`, inclusive.
 *
 * Returns an empty array when `start > end`.
 *
 * @example
 * sequence(1, 5)  // → [1, 2, 3, 4, 5]
 * sequence(3, 3)  // → [3]
 * sequence(5, 1)  // → []
 */
export const sequence = (start: number, end: number): number[] => {
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
};
