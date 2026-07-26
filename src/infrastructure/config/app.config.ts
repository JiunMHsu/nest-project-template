import { existsSync } from 'node:fs';
import { ConfigFactory } from '@nestjs/config';

// Avoids ENOENT throws when running the app in a container.
if (existsSync('.env')) process.loadEnvFile();

export const config = {
    env: getOrDefault<'development' | 'production' | 'test'>('NODE_ENV', 'development'),
    logLevel: getOrDefault<'verbose' | 'debug' | 'log' | 'warn' | 'error' | 'fatal'>('LOGGER_LEVEL', 'log'),

    app: {
        name: getOrDefault('APP_NAME', 'App'),
        host: getOrDefault('APP_HOST', '127.0.0.1'),
        port: parseInt(getOrDefault('APP_PORT', '9898'), 10),
        url: getOrDefault(
            'APP_URL',
            `http://${getOrDefault('APP_HOST', '127.0.0.1')}:${getOrDefault('APP_PORT', '9898')}`,
        ),
    },

    cors: {
        origins: getOrDefault('CORS_ORIGINS', 'http://localhost:5173')
            .split(',')
            .map(origin => origin.trim()),
    },

    jwt: {
        secret: getOrThrow('JWT_SECRET'),
        expiresIn: parseInt(getOrDefault('JWT_EXPIRES_IN', '3600'), 10),
        refreshSecret: getOrThrow('JWT_REFRESH_SECRET'),
        refreshExpiresIn: parseInt(getOrDefault('JWT_REFRESH_EXPIRES_IN', '604800'), 10),
    },

    hashSalt: parseInt(getOrDefault('HASH_SALT', '10'), 10),

    database: {
        host: getOrDefault('DB_HOST', 'localhost'),
        port: parseInt(getOrDefault('DB_PORT', '5432'), 10),
        username: getOrDefault('DB_USER', 'postgres'),
        password: getOrDefault('DB_PASSWORD', 'postgres'),
        name: getOrDefault('DB_NAME', 'nest_template'),
        synchronize: getBooleanOrDefault('DB_SYNCHRONIZE', false),
        dropSchema: getBooleanOrDefault('DB_DROP_SCHEMA', false),
    },

    admin: {
        email: getOrDefault('ADMIN_EMAIL', 'admin@admin.com'),
        password: getOrDefault('ADMIN_PASSWORD', 'admin'),
    },
};

export const configuration: ConfigFactory = () => config;

function getOrThrow<T extends string>(key: string): T {
    const value = process.env[key];
    if (!value) throw new Error(`Environment variable not found: ${key}`);
    return value as T;
}

function getOrDefault<T extends string>(key: string, defaultValue: T): T {
    const value = process.env[key];
    return (value ?? defaultValue) as T;
}

function getBooleanOrDefault(key: string, defaultValue: boolean): boolean {
    const boolMap: { [key: string]: boolean } = { true: true, false: false };
    const value = process.env[key] ?? '';
    return boolMap[value.toLowerCase()] ?? defaultValue;
}
