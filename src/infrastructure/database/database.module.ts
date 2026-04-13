import { Module } from '@nestjs/common';
import { PostgresConfigService } from './postgres/postgres-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeederModule } from './seeder/seeder.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: PostgresConfigService,
        }),
        SeederModule,
    ],
    providers: [PostgresConfigService],
})
export class DatabaseModule {}
