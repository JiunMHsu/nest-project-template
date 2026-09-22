import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DiscoveryModule } from '@nestjs/core';

import { configuration } from '@config/app.config';
import { dataSourceOptions } from '@database/postgres';

export async function createIntegrationTestModule(entities: any[], providers: Provider[]): Promise<TestingModule> {
    return Test.createTestingModule({
        imports: [
            await ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: [configuration],
            }),
            TypeOrmModule.forRoot({ ...dataSourceOptions }),
            TypeOrmModule.forFeature(entities),
            EventEmitterModule.forRoot(),
            DiscoveryModule,
        ],
        providers: providers,
    }).compile();
}
