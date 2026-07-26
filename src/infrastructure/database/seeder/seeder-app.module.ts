import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from '@config/app.config';

import { PostgresConfigService } from '@database/postgres/postgres-config.service';
import { SeederModule } from '@database/seeder/seeder.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true, load: [configuration] }),
        TypeOrmModule.forRootAsync({ imports: [ConfigModule], useClass: PostgresConfigService }),
        TypeOrmModule.forFeature([
            // Add required entities here if needed for seeding
        ]),
        SeederModule,
    ],
    providers: [PostgresConfigService],
})
export class SeederAppModule {}
