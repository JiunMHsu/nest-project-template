import { describe, expect, it } from 'vitest';

import { convertEnum, getEnumValueByString } from '@commons/utils/enum.util';

enum Status {
    Active = 'active',
    Inactive = 'inactive',
}

enum ExternalStatus {
    Active = 'active',
    Archived = 'archived',
}

describe('getEnumValueByString', () => {
    it('should find a matching enum value', () => {
        expect(getEnumValueByString(Status, 'active')).toBe(Status.Active);
    });

    it('should match on the value, not the key', () => {
        expect(getEnumValueByString(Status, 'Active')).toBeUndefined();
    });

    it('should be case sensitive', () => {
        expect(getEnumValueByString(Status, 'ACTIVE')).toBeUndefined();
    });

    it('should return undefined for an unknown value', () => {
        expect(getEnumValueByString(Status, 'deleted')).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
        expect(getEnumValueByString(Status, undefined)).toBeUndefined();
    });

    it('should return undefined for an empty string', () => {
        expect(getEnumValueByString(Status, '')).toBeUndefined();
    });

    it('should throw for a non-string rather than returning undefined', () => {
        expect(() => getEnumValueByString(Status, null)).toThrow('Value is not a valid string: null');
    });
});

describe('convertEnum', () => {
    it('should map a value shared by both enums', () => {
        expect(convertEnum(Status.Active, ExternalStatus)).toBe(ExternalStatus.Active);
    });

    it('should return undefined when the target enum lacks the value', () => {
        expect(convertEnum(Status.Inactive, ExternalStatus)).toBeUndefined();
    });
});
