import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    @Get()
    @HttpCode(HttpStatus.OK)
    public run(): { status: string } {
        this.logger.log('Health endpoint called');
        return { status: 'ok' };
    }
}
