import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { cors } from '@commons/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeederService } from '@database/seeder/seeder.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.enableCors(cors);
    app.setGlobalPrefix('api');

    const _host = configService.get<string>('host');
    const _port = configService.get<number>('port');

    const config = new DocumentBuilder()
        .setTitle('Nest REST API Template')
        .setVersion('1.0')
        .build();

    SwaggerModule.setup('docs', app, () =>
        SwaggerModule.createDocument(app, config),
    );

    const seedDatabase = configService.get<boolean>('seedDatabase');
    if (seedDatabase) {
        const seedService = app.get(SeederService);
        await seedService.seed();
    }

    await app.listen(_port, _host);

    const logger = app.get(Logger);
    logger.log(`Server running on http://${_host}:${_port}`);
    logger.log(`See documentation on http://${_host}:${_port}/docs`);
}

bootstrap().then();
