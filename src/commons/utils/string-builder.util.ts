export class StringBuilder {
    private parts: string[] = [];

    /**
     * Append a string to the builder.
     *
     * @example
     * const sb = new StringBuilder();
     * sb.append('Hello, ');
     * sb.append('world!');
     * console.log(sb.toString());
     * // Output: Hello, world!
     *
     *
     * @param part The string to append.
     * @returns The StringBuilder instance (for chaining).
     */
    public append(part: string): StringBuilder {
        this.parts.push(part);
        return this;
    }

    /**
     * Append a string followed by a newline to the builder.
     *
     * @example
     * const sb = new StringBuilder();
     * sb.appendLine('Hello, world!');
     * sb.appendLine('This is a new line.');
     * console.log(sb.toString());
     * // Output: Hello, world!
     * //         This is a new line.
     *
     * @param part The string to append.
     * @return The StringBuilder instance (for chaining).
     */
    public appendLine(part: string): StringBuilder {
        this.parts.push(`${part}\n`);
        return this;
    }

    /**
     * Append a newline to the builder.
     *
     * @example
     * const sb = new StringBuilder();
     * sb.append('Hello, world!');
     * sb.newLine();
     * sb.append('This is a new line.');
     * console.log(sb.toString());
     * // Output: Hello, world!
     * //         This is a new line.
     *
     * @return The StringBuilder instance (for chaining).
     */
    public newLine(): StringBuilder {
        this.parts.push('\n');
        return this;
    }

    /**
     * Append an itemized string (with a dash and newline) to the builder.
     *
     * @example
     * const sb = new StringBuilder();
     * sb.appendItemized('Item 1');
     * sb.appendItemized('Item 2');
     * console.log(sb.toString());
     * // Output: - Item 1
     * //         - Item 2
     *
     * @param item The item string to append.
     * @return The StringBuilder instance (for chaining).
     */
    public appendItemized(item: string): StringBuilder {
        this.parts.push(`- ${item}\n`);
        return this;
    }

    /**
     * Convert the builder to a string.
     *
     * @example
     * const sb = new StringBuilder();
     * sb.append('Hello, ');
     * sb.append('world!');
     * console.log(sb.toString());
     * // Output: Hello, world!
     *
     * @returns The concatenated string.
     */
    public toString(): string {
        return this.parts.join('');
    }
}
