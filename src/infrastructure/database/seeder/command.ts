import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { SeederAppModule } from './seeder-app.module';
import { SeederService } from './seeder.service';
import { SeedOptions } from './seeder.options';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeederAppModule, { logger: ['log', 'error', 'warn'] });
    const logger = new Logger('Seeder');

    const seeder = app.get(SeederService);
    const options = new SeedOptions(process.argv.slice(2));

    try {
        if (options.shouldClear) {
            logger.log('Clearing database...');
            await seeder.clear();
        }

        logger.log('Seeding database...');
        await seeder.seed(options);
        logger.log('Seeding completed.');
    } catch (error) {
        logger.error('Seeding failed:', error);
        throw error;
    } finally {
        await app.close();
    }
}

bootstrap().then();
