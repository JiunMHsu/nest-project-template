import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';
import { SeedOptions } from './seeder.options';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeederModule, { logger: ['log', 'error', 'warn'] });
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

void bootstrap();
