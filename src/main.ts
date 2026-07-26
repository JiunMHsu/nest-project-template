import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.useLogger(app.get(ConsoleLogger));

    const configService = app.get(ConfigService);
    const cors: CorsOptions = {
        origin: configService.get<string[]>('cors.origins'),
        methods: 'GET, HEAD, POST, PUT, PATCH, DELETE',
        credentials: true,
    };

    app.enableCors(cors);
    app.setGlobalPrefix('api');

    const exceptionFactory = (errors: ValidationError[]) => {
        // Customize error handling further if needed
        return new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints).join(', ')).join('; ')}`);
    };
    app.useGlobalPipes(new ValidationPipe({ transform: true, exceptionFactory }));

    const document = new DocumentBuilder().setTitle('Nest REST API Template').setVersion('1.0').build();
    SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, document));

    const host = configService.get<string>('app.host');
    const port = configService.get<number>('app.port');

    await app.listen(port, host);

    const logger = new Logger('Bootstrap');
    logger.log(`Server running on http://${host}:${port}`);
    logger.log(`See documentation on http://${host}:${port}/docs`);
}

bootstrap().then();
