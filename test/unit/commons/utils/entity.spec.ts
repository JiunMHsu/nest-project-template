import { describe, expect, it } from 'vitest';
import { updateEntity } from '@commons/utils/entity.util';

interface TestEntity {
    name: string;
    email: string;
    phone: string | null;
    age: number;
}

describe('updateEntity', () => {
    const makeEntity = (): TestEntity => ({
        name: 'John',
        email: 'john@example.com',
        phone: null,
        age: 30,
    });

    it('applies defined updates', () => {
        const entity = makeEntity();
        const result = updateEntity(entity, { name: 'Jane' });
        expect(result.name).toBe('Jane');
    });

    it('skips undefined values', () => {
        const entity = makeEntity();
        const result = updateEntity(entity, { name: undefined });
        expect(result.name).toBe('John');
    });

    it('skips null values by default', () => {
        const entity = makeEntity();
        entity.email = 'john@example.com';
        const result = updateEntity(entity, { email: null as unknown as string });
        expect(result.email).toBe('john@example.com');
    });

    it('applies null when field is in allowNull list', () => {
        const entity = makeEntity();
        const result = updateEntity(entity, { phone: null }, { allowNull: ['phone'] });
        expect(result.phone).toBeNull();
    });

    it('does not apply null for fields not in allowNull list', () => {
        const entity = makeEntity();
        entity.email = 'john@example.com';
        const result = updateEntity(entity, { email: null as unknown as string }, { allowNull: ['phone'] });
        expect(result.email).toBe('john@example.com');
    });

    it('applies multiple updates at once', () => {
        const entity = makeEntity();
        const result = updateEntity(entity, { name: 'Jane', age: 25 });
        expect(result.name).toBe('Jane');
        expect(result.age).toBe(25);
    });

    it('mutates and returns the same entity reference', () => {
        const entity = makeEntity();
        const result = updateEntity(entity, { name: 'Jane' });
        expect(result).toBe(entity);
    });

    it('handles empty updates object', () => {
        const entity = makeEntity();
        const result = updateEntity(entity, {});
        expect(result).toEqual(makeEntity());
    });
});
