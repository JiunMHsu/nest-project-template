import { describe, expect, it } from 'vitest';

import { BadRequestException } from '@nestjs/common';

import { Direction } from '@libs/paging/core';
import { NamedFieldsParser, SimpleFieldsParser, SortParserFactory } from '@libs/paging/http';

describe('SortParserFactory', () => {
    it('should build a SimpleFieldsParser from an array of fields', () => {
        expect(SortParserFactory.create(['name'])).toBeInstanceOf(SimpleFieldsParser);
    });

    it('should build a NamedFieldsParser from a field map', () => {
        expect(SortParserFactory.create({ last_name: 'lastName' })).toBeInstanceOf(NamedFieldsParser);
    });
});

describe('SimpleFieldsParser', () => {
    const parser = new SimpleFieldsParser(['name', 'age']);

    describe('parse', () => {
        it('should be unsorted when no sort is given', () => {
            expect(parser.parse(undefined).isSorted()).toBe(false);
        });

        it('should be unsorted for an empty string', () => {
            expect(parser.parse('').isSorted()).toBe(false);
        });

        it('should default to ascending when no direction is given', () => {
            expect(parser.parse('name').toArray()).toEqual([{ property: 'name', direction: Direction.ASC }]);
        });

        it('should read an explicit descending direction', () => {
            expect(parser.parse('name,DESC').toArray()).toEqual([{ property: 'name', direction: Direction.DESC }]);
        });

        it('should read a direction case-insensitively', () => {
            expect(parser.parse('name,desc').toArray()).toEqual([{ property: 'name', direction: Direction.DESC }]);
        });

        it('should fall back to ascending for an unrecognised direction', () => {
            expect(parser.parse('name,sideways').toArray()).toEqual([{ property: 'name', direction: Direction.ASC }]);
        });

        it('should trim whitespace around the field and direction', () => {
            expect(parser.parse(' name , DESC ').toArray()).toEqual([{ property: 'name', direction: Direction.DESC }]);
        });

        it('should keep the declared order of repeated sort params', () => {
            expect(parser.parse(['age,DESC', 'name']).toArray()).toEqual([
                { property: 'age', direction: Direction.DESC },
                { property: 'name', direction: Direction.ASC },
            ]);
        });

        it('should ignore non-string entries', () => {
            expect(parser.parse(['name', 42]).toArray()).toEqual([{ property: 'name', direction: Direction.ASC }]);
        });

        it('should reject a field outside the whitelist', () => {
            expect(() => parser.parse('password')).toThrow(BadRequestException);
        });

        it('should name the allowed fields when rejecting', () => {
            expect(() => parser.parse('password')).toThrow("Cannot sort by 'password'. Allowed fields: name, age");
        });

        it('should say nothing is sortable when the whitelist is empty', () => {
            expect(() => new SimpleFieldsParser([]).parse('name')).toThrow(
                "Cannot sort by 'name'. No fields are sortable.",
            );
        });

        it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
            'should reject inherited object key %s',
            key => {
                expect(() => parser.parse(`${key},ASC`)).toThrow(BadRequestException);
            },
        );
    });

    describe('isEmpty', () => {
        it('should be false when fields are whitelisted', () => {
            expect(parser.isEmpty()).toBe(false);
        });

        it('should be true when no fields are whitelisted', () => {
            expect(new SimpleFieldsParser([]).isEmpty()).toBe(true);
        });
    });

    describe('allowedFields', () => {
        it('should list the whitelisted fields', () => {
            expect(parser.allowedFields()).toEqual(['name', 'age']);
        });
    });
});

describe('NamedFieldsParser', () => {
    const parser = new NamedFieldsParser({ last_name: 'lastName', created_at: 'createdAt' });

    describe('parse', () => {
        it('should map the wire name to the entity property', () => {
            expect(parser.parse('last_name').toArray()).toEqual([{ property: 'lastName', direction: Direction.ASC }]);
        });

        it('should map the wire name when descending', () => {
            expect(parser.parse('created_at,DESC').toArray()).toEqual([
                { property: 'createdAt', direction: Direction.DESC },
            ]);
        });

        it('should reject the entity property when the wire name is expected', () => {
            expect(() => parser.parse('lastName')).toThrow(BadRequestException);
        });

        it.each(['constructor', 'toString', '__proto__'])('should reject inherited object key %s', key => {
            expect(() => parser.parse(`${key},ASC`)).toThrow(BadRequestException);
        });
    });

    describe('allowedFields', () => {
        it('should list the wire names, not the entity properties', () => {
            expect(parser.allowedFields()).toEqual(['last_name', 'created_at']);
        });
    });

    describe('isEmpty', () => {
        it('should be true when the field map is empty', () => {
            expect(new NamedFieldsParser({}).isEmpty()).toBe(true);
        });
    });
});
