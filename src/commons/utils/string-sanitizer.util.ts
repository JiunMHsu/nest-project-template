/**
 * String sanitization utilities.
 */
export class StringSanitizer {
    /**
     * Removes all characters that are not Unicode letters, digits, or spaces,
     * then trims leading and trailing whitespace.
     *
     * Preserves accented and non-ASCII letters (e.g. `é`, `ñ`, `中`).
     *
     * @example
     * StringSanitizer.removeSpecialChars('Hello@World#123!') // → 'HelloWorld123'
     * StringSanitizer.removeSpecialChars('café naïve')       // → 'café naïve'
     * StringSanitizer.removeSpecialChars('  hello  ')        // → 'hello'
     */
    public static removeSpecialChars(input: string): string {
        return input.replace(/[^\p{L}\p{N} ]/gu, '').trim();
    }
}
