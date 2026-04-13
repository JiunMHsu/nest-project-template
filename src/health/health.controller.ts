import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Health Check', description: 'Returns the health status of the application.' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Health check successful.',
        schema: { type: 'object', properties: { status: { type: 'string' } } },
    })
    public run(): { status: string } {
        this.logger.log('Health endpoint called');
        return { status: 'ok' };
    }
}
