import { Module } from '@nestjs/common';
import { PostgresConfigService } from './postgres/postgres-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: PostgresConfigService,
        }),
    ],
    providers: [PostgresConfigService],
})
export class DatabaseModule {}
