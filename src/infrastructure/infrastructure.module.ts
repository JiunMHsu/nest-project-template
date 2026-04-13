import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@infrastructure/config/app.config';
import { LoggerModule } from '@infrastructure/logger/logger.module';
// import { DatabaseModule } from '@infrastructure/database/database.module';
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
        // DatabaseModule,
    ],
})
export class InfrastructureModule {}
