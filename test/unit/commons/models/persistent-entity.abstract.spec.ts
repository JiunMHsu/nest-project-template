import { describe, expect, it } from 'vitest';

import { PersistentEntity } from '@commons/models/persistent-entity.abstract';

class Widget extends PersistentEntity {}

describe('PersistentEntity', () => {
    describe('isActive', () => {
        it('should be active when it has never been deleted', () => {
            const widget = new Widget();
            widget.deletedAt = null;

            expect(widget.isActive).toBe(true);
        });

        it('should be active when deletedAt was never set', () => {
            expect(new Widget().isActive).toBe(true);
        });

        it('should be inactive once soft-deleted', () => {
            const widget = new Widget();
            widget.deletedAt = new Date('2024-05-01T00:00:00Z');

            expect(widget.isActive).toBe(false);
        });
    });
});
