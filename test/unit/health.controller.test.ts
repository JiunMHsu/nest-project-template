import { Logger } from '@nestjs/common';
import { HealthController } from '@src/health/health.controller';
import { createMock, Mock } from 'test/utils/mock';

describe('HealthController', () => {
    let controller: HealthController;
    let logger: Mock<Logger>;

    beforeEach(async () => {
        logger = createMock<Logger>();
        controller = new HealthController(logger);
    });

    describe('run', () => {
        it('should return is healthy', () => {
            expect(controller.run()).toEqual({ status: 'ok' });
            expect(logger.log).toHaveBeenCalledTimes(1);
        });
    });
});
