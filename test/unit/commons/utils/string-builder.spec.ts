import { describe, expect, it } from 'vitest';
import { StringBuilder } from '@commons/utils/string-builder.util';

describe('StringBuilder', () => {
    describe('append', () => {
        it('appends strings without modification', () => {
            const sb = new StringBuilder();
            expect(sb.append('Hello').append(', ').append('World').toString()).toBe('Hello, World');
        });

        it('returns the same instance for chaining', () => {
            const sb = new StringBuilder();
            expect(sb.append('a')).toBe(sb);
        });

        it('starts empty', () => {
            expect(new StringBuilder().toString()).toBe('');
        });
    });

    describe('appendLine', () => {
        it('appends string followed by newline', () => {
            const sb = new StringBuilder();
            expect(sb.appendLine('Line 1').toString()).toBe('Line 1\n');
        });

        it('appends multiple lines correctly', () => {
            const sb = new StringBuilder();
            sb.appendLine('A').appendLine('B');
            expect(sb.toString()).toBe('A\nB\n');
        });
    });

    describe('newLine', () => {
        it('adds a bare newline character', () => {
            const sb = new StringBuilder();
            sb.append('hello').newLine().append('world');
            expect(sb.toString()).toBe('hello\nworld');
        });
    });

    describe('appendItemized', () => {
        it('prefixes item with dash and appends newline', () => {
            const sb = new StringBuilder();
            sb.appendItemized('Item 1');
            expect(sb.toString()).toBe('- Item 1\n');
        });

        it('formats multiple items correctly', () => {
            const sb = new StringBuilder();
            sb.appendItemized('A').appendItemized('B');
            expect(sb.toString()).toBe('- A\n- B\n');
        });
    });

    describe('toString', () => {
        it('concatenates all parts in order', () => {
            const sb = new StringBuilder();
            sb.appendLine('Title').appendItemized('Point 1').appendItemized('Point 2');
            expect(sb.toString()).toBe('Title\n- Point 1\n- Point 2\n');
        });
    });
});
