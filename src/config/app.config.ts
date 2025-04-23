import { ConfigFactory } from '@nestjs/config';

export interface IAppConfig {
    env: string;

    host: string;
    port: number;

    jwt: {
        secret: string;
        expiresIn: number;
        refreshSecret: string;
        refreshExpiresIn: number;
    };

    hashSalt: number;

    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        log: boolean;
        autoloadEntities: boolean;
        sync: boolean;
        dropSchema: boolean;
    };

    seedDatabase?: boolean;

    admin: {
        email: string;
        password: string;
    };
}

const appConfig: ConfigFactory<IAppConfig> = () => ({
    env: process.env.NODE_ENV || 'development',

    host: process.env.APP_HOST || '127.0.0.1',
    port: parseInt(process.env.APP_PORT || '3524', 10),

    jwt: {
        secret: process.env.JWT_SECRET || '',
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10), // 1 hour
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        refreshExpiresIn: parseInt(
            process.env.JWT_REFRESH_EXPIRES_IN || '2592000', // 30 days
            10,
        ),
    },

    hashSalt: parseInt(process.env.HASH_SALT || '10', 10),

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'orionfin_advisor_db',
        log: parseBool(process.env.DB_LOGGING, false),
        autoloadEntities: parseBool(process.env.DB_AUTOLOAD_ENTITIES, false),
        sync: parseBool(process.env.DB_SYNC, false),
        dropSchema: parseBool(process.env.DB_DROP_SCHEMA, false),
    },

    seedDatabase: parseBool(process.env.SEED_DB, false),

    admin: {
        email: process.env.ADMIN_EMAIL || '',
        password: process.env.ADMIN_PASSWORD || '',
    },
});

const parseBool = (
    value: string | undefined | null,
    fallback?: boolean,
): boolean => {
    if (!value) return fallback || false;
    return value.toLowerCase() === 'true';
};

export default appConfig;
