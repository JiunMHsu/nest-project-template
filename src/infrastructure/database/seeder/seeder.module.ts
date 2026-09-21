import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from '@database/postgres';
import { SeederService } from '@database/seeder/seeder.service';

@Module({
    imports: [TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true })],
    providers: [SeederService],
    exports: [SeederService],
})
export class SeederModule {}
