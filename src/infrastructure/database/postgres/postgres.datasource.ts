import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { config } from '@config/app.config';

const isProduction = config.env === 'production';

/**
 * This data source is used for running migrations and other TypeORM CLI commands.
 * It should not be used directly in the application. Use TypeORM's DataSource
 * instance injected by NestJS instead.
 */
const pg = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    entities: ['dist/**/**/entities/*.entity.js'],
    migrations: ['dist/core/database/migrations/*.js'],
    synchronize: config.database.synchronize,
    dropSchema: config.database.dropSchema,
    migrationsRun: false,
    logging: !isProduction,
    namingStrategy: new SnakeNamingStrategy(),
    useUTC: true,
});

export default pg;
