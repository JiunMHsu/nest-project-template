import { randomBytes } from 'crypto';

type Characters = 'uppercase' | 'lowercase' | 'digits' | 'specialChars';

/**
 * Generates random strings of various character compositions.
 *
 * `generateSecure()` uses Node's `crypto.randomBytes()` and is safe for
 * tokens, temporary passwords, and other security-sensitive values.
 * All other methods use `Math.random()` and are suitable for non-security
 * purposes such as test data or display IDs.
 */
export class RandomString {
    private static DEFAULT_LENGTH = 16;

    private static characterSets: Record<Characters, string> = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        specialChars: '!@#$%^&*()_+',
    };

    private static _generate(chars: Characters[], length?: number): string {
        length = length ?? this.DEFAULT_LENGTH;
        if (length <= 0) return '';
        if (chars.length === 0) return '';

        const seeds = this.buildSeeds(chars);

        const seedsLength = seeds.length;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += seeds.charAt(Math.floor(Math.random() * seedsLength));
        }
        return result;
    }

    /**
     * Generates a random string using the specified character sets.
     *
     * Defaults to uppercase + lowercase letters, length 16.
     *
     * @example
     * RandomString.generate() // → "KmLpQwErtYuIoPaS"
     * RandomString.generate({ with: ['digits'], length: 6 }) // → "482957"
     */
    public static generate(options?: { with?: Characters[]; length?: number }): string {
        const length = options?.length ?? this.DEFAULT_LENGTH;
        const seeds = options?.with ?? ['uppercase', 'lowercase'];

        return this._generate(seeds, length);
    }

    /**
     * Generates a cryptographically secure random string using all character
     * sets (uppercase, lowercase, digits, special characters).
     *
     * Uses `crypto.randomBytes()` — safe for tokens, temporary passwords,
     * and other security-sensitive values.
     *
     * @example
     * RandomString.generateSecure(32) // → "aB3$kL9@mN2#pQ5&xY8!zW4^vR7*cT1!"
     */
    public static generateSecure(length?: number): string {
        const _length = length ?? this.DEFAULT_LENGTH;
        if (_length <= 0) return '';

        const seeds = this.buildSeeds(['uppercase', 'lowercase', 'digits', 'specialChars']);
        const bytes = randomBytes(_length);
        let result = '';
        for (let i = 0; i < _length; i++) {
            result += seeds.charAt(bytes[i] % seeds.length);
        }
        return result;
    }

    /**
     * Generates a random string containing only ASCII letters (upper and lowercase).
     *
     * @example
     * RandomString.generateAlphabetic(10) // → "KmLpQwErTy"
     */
    public static generateAlphabetic(length?: number): string {
        return this._generate(['uppercase', 'lowercase'], length);
    }

    /**
     * Generates a random string containing ASCII letters and digits (no special characters).
     *
     * @example
     * RandomString.generateAlphanumeric(12) // → "aB3kL9mN2pQ5"
     */
    public static generateAlphanumeric(length?: number): string {
        return this._generate(['uppercase', 'lowercase', 'digits'], length);
    }

    /**
     * Generates a random numeric string.
     *
     * @example
     * RandomString.generateNumeric(6) // → "482957"
     */
    public static generateNumeric(length?: number): string {
        return this._generate(['digits'], length);
    }

    private static buildSeeds(characters: Characters[]): string {
        let seeds = '';
        for (const option of characters) {
            seeds += RandomString.characterSets[option];
        }

        return seeds;
    }
}
