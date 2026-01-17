export class StringSanitizer {
    public static removeSpecialChars(input: string): string {
        return input.replace(/[^\p{L}\p{N} ]/gu, '').trim();
    }
}
