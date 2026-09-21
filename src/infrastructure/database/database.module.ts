import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from './postgres';
import { SeederModule } from './seeder/seeder.module';

@Module({
    imports: [TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true })],
})
export class DatabaseModule {}
