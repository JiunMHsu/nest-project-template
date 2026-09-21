import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { validationExceptionFactory } from '@commons/utils/validation-exception.factory';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, exceptionFactory: validationExceptionFactory }));

    const document = new DocumentBuilder().setTitle('Nest REST API Template').setVersion('1.0').build();
    SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, document));

    const host = configService.get<string>('app.host');
    const port = configService.get<number>('app.port');

    await app.listen(port, host);

    const logger = new Logger('Bootstrap');
    logger.log(`Server running on http://${host}:${port}`);
    logger.log(`See documentation on http://${host}:${port}/api/docs`);
}

void bootstrap();
