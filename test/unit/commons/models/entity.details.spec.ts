import 'reflect-metadata';

import { instanceToPlain } from 'class-transformer';
import { describe, expect, it } from 'vitest';

import { EntityDetails } from '@commons/models/entity.details';
import { PersistentEntity } from '@commons/models/persistent-entity.abstract';

class Widget extends PersistentEntity {}

class WidgetDetails extends EntityDetails {
    public constructor(entity: PersistentEntity) {
        super(entity);
    }
}

function widget(overrides: Partial<Widget> = {}): Widget {
    return Object.assign(new Widget(), {
        id: 'a3f1c9e2-5d6b-4f8e-9c2d-1e2f3a4b5c6d',
        createdAt: new Date('2024-01-01T09:30:00Z'),
        updatedAt: new Date('2024-02-01T18:45:00Z'),
        deletedAt: null,
        ...overrides,
    });
}

describe('EntityDetails', () => {
    it('should copy the id verbatim', () => {
        expect(new WidgetDetails(widget()).id).toBe('a3f1c9e2-5d6b-4f8e-9c2d-1e2f3a4b5c6d');
    });

    it('should convert createdAt to a UTC ISO string', () => {
        expect(new WidgetDetails(widget()).createdAt).toBe('2024-01-01T09:30:00.000Z');
    });

    it('should convert updatedAt to a UTC ISO string', () => {
        expect(new WidgetDetails(widget()).updatedAt).toBe('2024-02-01T18:45:00.000Z');
    });

    it('should leave deletedAt undefined when the entity is live', () => {
        expect(new WidgetDetails(widget()).deletedAt).toBeUndefined();
    });

    it('should convert deletedAt once the entity is soft-deleted', () => {
        const details = new WidgetDetails(widget({ deletedAt: new Date('2024-03-01T00:00:00Z') }));

        expect(details.deletedAt).toBe('2024-03-01T00:00:00.000Z');
    });

    it('should serialise every field under its snake_case wire name', () => {
        const details = new WidgetDetails(widget({ deletedAt: new Date('2024-03-01T00:00:00Z') }));

        expect(instanceToPlain(details)).toEqual({
            id: 'a3f1c9e2-5d6b-4f8e-9c2d-1e2f3a4b5c6d',
            created_at: '2024-01-01T09:30:00.000Z',
            updated_at: '2024-02-01T18:45:00.000Z',
            deleted_at: '2024-03-01T00:00:00.000Z',
        });
    });
});
