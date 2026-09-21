import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),

        // DatabaseModule,
    ],
})
export class InfrastructureModule {}
