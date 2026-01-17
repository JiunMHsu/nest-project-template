import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { SeederService } from './seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = new Logger('Seeder');

    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');

    const seeder = app.get(SeederService);

    try {
        if (shouldClear) {
            logger.log('🗑️  Clearing database...');
            await seeder.clear();
        }

        logger.log('🌱 Seeding database...');
        await seeder.seed();
        logger.log('✅ Seeding completed!');
    } catch (error) {
        logger.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await app.close();
    }
}

bootstrap().then();
