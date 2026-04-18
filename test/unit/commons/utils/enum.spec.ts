import { describe, expect, it } from 'vitest';
import { convertEnum, getEnumValueByString } from '@commons/utils/enum.util';

enum Status {
    Active = 'active',
    Inactive = 'inactive',
    Pending = 'pending',
}

enum ApiStatus {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

describe('getEnumValueByString', () => {
    it('returns enum value when string matches', () => {
        expect(getEnumValueByString(Status, 'active')).toBe('active');
        expect(getEnumValueByString(Status, 'inactive')).toBe('inactive');
    });

    it('returns undefined when string does not match any value', () => {
        expect(getEnumValueByString(Status, 'unknown')).toBeUndefined();
    });

    it('returns undefined when input is undefined', () => {
        expect(getEnumValueByString(Status, undefined)).toBeUndefined();
    });

    it('is case-sensitive', () => {
        expect(getEnumValueByString(Status, 'Active')).toBeUndefined();
        expect(getEnumValueByString(Status, 'ACTIVE')).toBeUndefined();
    });

    it('returns the enum value (not the key)', () => {
        const result = getEnumValueByString(Status, 'pending');
        expect(result).toBe(Status.Pending);
    });
});

describe('convertEnum', () => {
    it('returns undefined when source value has no match in target enum', () => {
        // Status.Active = 'active', ApiStatus has no 'active' value
        expect(convertEnum(Status.Active, ApiStatus)).toBeUndefined();
    });

    it('returns matching target value when values are equal strings', () => {
        enum SourceEnum {
            X = 'ACTIVE',
        }
        expect(convertEnum(SourceEnum.X, ApiStatus)).toBe('ACTIVE');
    });

    it('returns undefined for empty target enum', () => {
        enum EmptyEnum {}
        expect(convertEnum(Status.Active, EmptyEnum as Record<string, string>)).toBeUndefined();
    });
});
