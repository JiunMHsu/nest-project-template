import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class PostgresConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    public createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        const isProduction = this.configService.get<string>('env') === 'production';

        return {
            type: 'postgres',
            host: this.configService.get<string>('database.host'),
            port: this.configService.get<number>('database.port'),
            username: this.configService.get<string>('database.username'),
            password: this.configService.get<string>('database.password'),
            database: this.configService.get<string>('database.name'),
            autoLoadEntities: true,
            synchronize: false,
            dropSchema: false,
            migrationsRun: false,
            logging: !isProduction,
            namingStrategy: new SnakeNamingStrategy(),
            useUTC: true,
        };
    }
}
