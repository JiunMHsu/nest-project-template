import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { EntitySpecification } from '@commons/querying/entity.specification';

class TestSpec extends EntitySpecification {}

function make(data: Record<string, unknown>): TestSpec {
    return plainToInstance(TestSpec, data);
}

describe('EntitySpecification', () => {
    describe('creationDateRange', () => {
        it('returns both bounds when both fields are set', () => {
            const spec = make({
                createdAfter: '2024-01-01T00:00:00',
                createdBefore: '2024-12-31T23:59:59',
            });
            expect(spec.creationDateRange.from).toBeInstanceOf(Date);
            expect(spec.creationDateRange.to).toBeInstanceOf(Date);
        });

        it('returns undefined bounds when neither field is set', () => {
            const spec = make({});
            expect(spec.creationDateRange.from).toBeUndefined();
            expect(spec.creationDateRange.to).toBeUndefined();
        });

        it('returns only from when createdAfter is set', () => {
            const spec = make({ createdAfter: '2024-01-01T00:00:00' });
            expect(spec.creationDateRange.from).toBeInstanceOf(Date);
            expect(spec.creationDateRange.to).toBeUndefined();
        });

        it('returns only to when createdBefore is set', () => {
            const spec = make({ createdBefore: '2024-12-31T23:59:59' });
            expect(spec.creationDateRange.from).toBeUndefined();
            expect(spec.creationDateRange.to).toBeInstanceOf(Date);
        });
    });

    describe('updateDateRange', () => {
        it('returns both bounds when both fields are set', () => {
            const spec = make({
                updatedAfter: '2024-01-01T00:00:00',
                updatedBefore: '2024-12-31T23:59:59',
            });
            expect(spec.updateDateRange.from).toBeInstanceOf(Date);
            expect(spec.updateDateRange.to).toBeInstanceOf(Date);
        });

        it('returns undefined bounds when neither field is set', () => {
            const spec = make({});
            expect(spec.updateDateRange.from).toBeUndefined();
            expect(spec.updateDateRange.to).toBeUndefined();
        });
    });

    describe('deleted boolean transform', () => {
        it('coerces string "true" to true', () => {
            expect(make({ deleted: 'true' }).deleted).toBe(true);
        });

        it('coerces string "false" to false', () => {
            expect(make({ deleted: 'false' }).deleted).toBe(false);
        });

        it('passes boolean true through', () => {
            expect(make({ deleted: true }).deleted).toBe(true);
        });

        it('passes boolean false through', () => {
            expect(make({ deleted: false }).deleted).toBe(false);
        });

        it('returns undefined when not provided', () => {
            expect(make({}).deleted).toBeUndefined();
        });

        it('returns undefined for unrecognised values', () => {
            expect(make({ deleted: 'yes' }).deleted).toBeUndefined();
        });
    });
});
