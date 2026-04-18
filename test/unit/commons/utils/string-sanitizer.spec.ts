import { describe, expect, it } from 'vitest';
import { StringSanitizer } from '@commons/utils/string-sanitizer.util';

describe('StringSanitizer.removeSpecialChars', () => {
    it('removes special characters', () => {
        expect(StringSanitizer.removeSpecialChars('Hello@World#123!')).toBe('HelloWorld123');
    });

    it('preserves letters and digits', () => {
        expect(StringSanitizer.removeSpecialChars('abc123')).toBe('abc123');
    });

    it('preserves internal spaces', () => {
        expect(StringSanitizer.removeSpecialChars('hello world')).toBe('hello world');
    });

    it('trims leading and trailing whitespace', () => {
        expect(StringSanitizer.removeSpecialChars('  hello  ')).toBe('hello');
    });

    it('removes punctuation', () => {
        expect(StringSanitizer.removeSpecialChars('foo.bar,baz!')).toBe('foobarbaz');
    });

    it('preserves unicode letters', () => {
        expect(StringSanitizer.removeSpecialChars('café naïve')).toBe('café naïve');
    });

    it('returns empty string for input with only special chars', () => {
        expect(StringSanitizer.removeSpecialChars('!@#$%^')).toBe('');
    });

    it('handles empty string', () => {
        expect(StringSanitizer.removeSpecialChars('')).toBe('');
    });
});
