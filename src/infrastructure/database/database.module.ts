import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from './postgres';

@Module({
    imports: [TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true })],
})
export class DatabaseModule {}
