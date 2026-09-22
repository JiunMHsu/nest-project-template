import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { validationExceptionFactory } from '@commons/utils/validation-exception.factory';
import { config } from '@config/app.config';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, exceptionFactory: validationExceptionFactory }));

    const document = new DocumentBuilder().setTitle('Nest REST API Template').setVersion('1.0').build();
    SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, document));

    const { host, port } = config.app;

    await app.listen(port, host);

    const logger = new Logger('Bootstrap');
    logger.log(`Server running on http://${host}:${port}`);
    logger.log(`See documentation on http://${host}:${port}/api/docs`);
}

void bootstrap();
