export const roundTo = (num: number, decimalPlaces: number): number => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
};

/**
 * Rounds a number to 4 decimal places.
 *
 * @param num
 * @returns {number} The rounded number.
 * @throws {Error} If the input is not a number.
 */
export const roundToDefault = (num: number): number => {
    if (num === null || num === undefined) throw new Error('Invalid number');
    return roundTo(num, 4);
};

/**
 * Rounds a number to 2 decimal places.
 *
 * @param num
 * @returns {number} The rounded number.
 * @throws {Error} If the input is not a number.
 */
export const roundToTwoDecimals = (num: number): number => {
    if (num === null || num === undefined) throw new Error('Invalid number');
    return roundTo(num, 2);
};
