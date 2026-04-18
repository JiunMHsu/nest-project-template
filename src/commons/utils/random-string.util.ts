import { randomBytes } from 'crypto';

type Characters = 'uppercase' | 'lowercase' | 'digits' | 'specialChars';

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
     * Generates a random string.
     *
     * @param options - Options for generating the string.
     * @param options.with - Character sets to include (default: ['uppercase', 'lowercase']).
     * @param options.length - Length of the generated string (default: 16).
     * @returns A random string.
     */
    public static generate(options?: { with?: Characters[]; length?: number }): string {
        const length = options?.length ?? this.DEFAULT_LENGTH;
        const seeds = options?.with ?? ['uppercase', 'lowercase'];

        return this._generate(seeds, length);
    }

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

    public static generateAlphabetic(length?: number): string {
        return this._generate(['uppercase', 'lowercase'], length);
    }

    public static generateAlphanumeric(length?: number): string {
        return this._generate(['uppercase', 'lowercase', 'digits'], length);
    }

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
