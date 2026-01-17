import { Logger, Provider } from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

export const loggerProvider: Provider = {
    provide: Logger,
    useFactory: (configService: ConfigService) => {
        const level = configService.get<LogLevel>('loggerLevel');

        const logLevelHierarchy: Record<LogLevel, LogLevel[]> = {
            verbose: ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
            debug: ['debug', 'log', 'warn', 'error', 'fatal'],
            log: ['log', 'warn', 'error', 'fatal'],
            warn: ['warn', 'error', 'fatal'],
            error: ['error', 'fatal'],
            fatal: ['fatal'],
        };

        const levelsToEnable = logLevelHierarchy[level] || ['log', 'warn', 'error', 'fatal'];

        const logger = new Logger('Orichat', { timestamp: true });
        logger.localInstance.setLogLevels?.(levelsToEnable);
        return logger;
    },
    inject: [ConfigService],
};
