import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostgresConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions():
        | Promise<TypeOrmModuleOptions>
        | TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('database.host'),
            port: this.configService.get<number>('database.port'),
            username: this.configService.get<string>('database.username'),
            password: this.configService.get<string>('database.password'),
            database: this.configService.get<string>('database.name'),
            // entities: ['dist/modules/**/entities/*.entity.js'],
            autoLoadEntities: this.configService.get<boolean>(
                'database.autoloadEntities',
            ),
            logging: this.configService.get<boolean>('database.log'),
            synchronize: this.configService.get<boolean>('database.sync'),
            dropSchema: this.configService.get<boolean>('database.dropSchema'),
        };
    }
}
