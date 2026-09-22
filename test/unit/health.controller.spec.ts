import { beforeEach, describe, expect, it } from 'vitest';

import { HealthController } from '@src/health/health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(() => {
        controller = new HealthController();
    });

    describe('run', () => {
        it('should return is healthy', () => {
            expect(controller.run()).toEqual({ status: 'ok' });
        });
    });
});
