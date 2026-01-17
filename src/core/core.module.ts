import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@core/config/app.config';
import { LoggerModule } from '@core/logger/logger.module';
import { DatabaseModule } from '@core/database/database.module';
import { SeederModule } from '@core/seeder/seeder.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            load: [configuration],
        }),

        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),

        LoggerModule,
        DatabaseModule,
        SeederModule,
    ],
})
export class CoreModule {}
