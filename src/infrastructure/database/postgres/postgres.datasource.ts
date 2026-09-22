import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { config } from '@config/app.config';

const {
    env,
    database: { host, port, username, password, name, synchronize, dropSchema },
} = config;
const isProduction = env === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database: name,
    entities: ['dist/**/entities/*.entity.js'],
    migrations: ['dist/**/database/migrations/*.js'],
    synchronize: !isProduction && synchronize,
    dropSchema: !isProduction && dropSchema,
    migrationsRun: false,
    logging: !isProduction,
    namingStrategy: new SnakeNamingStrategy(),
    useUTC: true,
};

/**
 * This data source is default-exported and used for running migrations and other TypeORM CLI commands.
 */
export default new DataSource(dataSourceOptions);
