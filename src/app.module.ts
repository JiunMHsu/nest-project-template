import { Module } from '@nestjs/common';
import configuration from '@config/app.config';
import { DatabaseModule } from '@database/database.module';
import { LoggerModule } from '@commons/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            load: [configuration],
        }),
        DatabaseModule,
        LoggerModule,
        HealthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
