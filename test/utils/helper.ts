import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from '@core/config/app.config';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PostgresConfigService } from '@core/database/postgres/postgres-config.service';
import { DiscoveryModule } from '@nestjs/core';

export async function createIntegrationTestModule(
    entities: EntityClassOrSchema[],
    providers: Provider[],
): Promise<TestingModule> {
    return Test.createTestingModule({
        imports: [
            await ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: [configuration],
            }),
            TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useClass: PostgresConfigService,
            }),
            TypeOrmModule.forFeature(entities),
            EventEmitterModule.forRoot(),
            DiscoveryModule,
        ],
        providers: providers,
    }).compile();
}
