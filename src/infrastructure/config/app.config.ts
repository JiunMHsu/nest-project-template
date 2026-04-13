import { ConfigFactory } from '@nestjs/config';

export const configuration: ConfigFactory = () => ({
    env: process.env.NODE_ENV || 'development',

    loggerLevel: process.env.LOGGER_LEVEL || 'log',

    host: process.env.APP_HOST || '127.0.0.1',
    port: parseInt(process.env.APP_PORT || '3524', 10),

    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:5173'],

    appUrl: process.env.APP_URL || `http://${process.env.APP_HOST}:${process.env.APP_PORT}`,

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
        name: process.env.DB_NAME || 'nest_template',
    },

    admin: {
        email: process.env.ADMIN_EMAIL || '',
        password: process.env.ADMIN_PASSWORD || '',
    },
});
