import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { SeederService } from './seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = app.get(Logger);

    try {
        const seeder = app.get(SeederService);

        logger.log('Seeding started...');
        await seeder.seed();
        logger.log('Seeding completed.');

        await app.close();
    } catch (error) {
        logger.error('Seeding failed.');
        logger.error(error);
        process.exit(1);
    }
}

bootstrap().then();
