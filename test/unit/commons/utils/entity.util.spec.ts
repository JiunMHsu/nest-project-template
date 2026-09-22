import { describe, expect, it } from 'vitest';

import { updateEntity } from '@commons/utils/entity.util';

interface User {
    name: string;
    phone: string | null;
    email: string | null;
    age: number;
    active: boolean;
}

function user(): User {
    return { name: 'Ada', phone: '555', email: 'ada@example.com', age: 36, active: true };
}

describe('updateEntity', () => {
    it('should apply a provided value', () => {
        expect(updateEntity(user(), { name: 'Grace' }).name).toBe('Grace');
    });

    it('should leave fields absent from the update alone', () => {
        expect(updateEntity(user(), { name: 'Grace' }).phone).toBe('555');
    });

    it('should skip an explicitly undefined value', () => {
        expect(updateEntity(user(), { phone: undefined }).phone).toBe('555');
    });

    it('should skip null by default', () => {
        expect(updateEntity(user(), { email: null }).email).toBe('ada@example.com');
    });

    it('should write null when the field is allowed to be nulled', () => {
        expect(updateEntity(user(), { email: null }, { allowNull: ['email'] }).email).toBeNull();
    });

    it('should still skip null for fields outside the allow list', () => {
        const updated = updateEntity(user(), { email: null, phone: null }, { allowNull: ['email'] });

        expect(updated.phone).toBe('555');
    });

    it.each([
        ['zero', 'age', 0],
        ['an empty string', 'name', ''],
        ['false', 'active', false],
    ])('should apply %s, which is defined but falsy', (_label, field, value) => {
        const updated = updateEntity(user(), { [field]: value } as Partial<User>);

        expect(updated[field as keyof User]).toBe(value);
    });

    it('should mutate and return the same reference', () => {
        const entity = user();

        expect(updateEntity(entity, { name: 'Grace' })).toBe(entity);
    });

    it('should leave the entity untouched for an empty update', () => {
        expect(updateEntity(user(), {})).toEqual(user());
    });
});
