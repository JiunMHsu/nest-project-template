import { ConsoleLogger, LogLevel, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const loggerProvider: Provider = {
    provide: ConsoleLogger,
    useFactory: (configService: ConfigService) => {
        const level = configService.get<LogLevel>('logLevel');
        const appName = configService.get<string>('app.name');

        const logLevelHierarchy: Record<LogLevel, LogLevel[]> = {
            verbose: ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
            debug: ['debug', 'log', 'warn', 'error', 'fatal'],
            log: ['log', 'warn', 'error', 'fatal'],
            warn: ['warn', 'error', 'fatal'],
            error: ['error', 'fatal'],
            fatal: ['fatal'],
        };

        const logLevels = logLevelHierarchy[level] ?? logLevelHierarchy.log;

        return new ConsoleLogger(appName, { timestamp: true, logLevels });
    },
    inject: [ConfigService],
};
