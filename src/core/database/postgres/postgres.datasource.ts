import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

process.loadEnvFile();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * This data source is used for running migrations and other TypeORM CLI commands.
 * It should not be used directly in the application. Use TypeORM's DataSource
 * instance injected by NestJS instead.
 */
const pg = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/**/entities/*.entity.js'],
    migrations: ['dist/core/database/migrations/*.js'],
    synchronize: false,
    dropSchema: false,
    migrationsRun: false,
    logging: !isProduction,
    namingStrategy: new SnakeNamingStrategy(),
    useUTC: true,
});

export default pg;
