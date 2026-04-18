/**
 * Fluent string builder for constructing multi-part strings iteratively.
 *
 * Internally accumulates string parts and joins them on `toString()`,
 * avoiding intermediate string allocations. Useful when building strings
 * conditionally across multiple branches.
 *
 * @example
 * const sb = new StringBuilder();
 * sb.appendLine('Summary')
 *   .appendItemized('First point')
 *   .appendItemized('Second point');
 * console.log(sb.toString());
 * // Summary
 * // - First point
 * // - Second point
 */
export class StringBuilder {
    private parts: string[] = [];

    /**
     * Appends a string as-is.
     *
     * @example
     * sb.append('Hello').append(', ').append('World') // → "Hello, World"
     */
    public append(part: string): StringBuilder {
        this.parts.push(part);
        return this;
    }

    /**
     * Appends a string followed by a newline character.
     *
     * @example
     * sb.appendLine('Line 1').appendLine('Line 2') // → "Line 1\nLine 2\n"
     */
    public appendLine(part: string): StringBuilder {
        this.parts.push(`${part}\n`);
        return this;
    }

    /**
     * Appends a bare newline character.
     *
     * @example
     * sb.append('A').newLine().append('B') // → "A\nB"
     */
    public newLine(): StringBuilder {
        this.parts.push('\n');
        return this;
    }

    /**
     * Appends a string prefixed with `"- "` and followed by a newline,
     * producing a simple markdown-style bullet.
     *
     * @example
     * sb.appendItemized('Item 1').appendItemized('Item 2')
     * // → "- Item 1\n- Item 2\n"
     */
    public appendItemized(item: string): StringBuilder {
        this.parts.push(`- ${item}\n`);
        return this;
    }

    /** Returns all accumulated parts joined into a single string. */
    public toString(): string {
        return this.parts.join('');
    }
}
