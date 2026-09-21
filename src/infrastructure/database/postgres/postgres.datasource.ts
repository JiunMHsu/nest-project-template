import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { config } from '@config/app.config';

const isProduction = config.env === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: ['dist/**/entities/*.entity.js'],
    migrations: ['dist/**/database/migrations/*.js'],
    synchronize: !isProduction && config.database.synchronize,
    dropSchema: !isProduction && config.database.dropSchema,
    migrationsRun: false,
    logging: !isProduction,
    namingStrategy: new SnakeNamingStrategy(),
    useUTC: true,
};

/**
 * This data source is default-exported and used for running migrations and other TypeORM CLI commands.
 */
export default new DataSource(dataSourceOptions);
