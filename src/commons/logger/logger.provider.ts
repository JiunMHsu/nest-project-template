import { Logger, Provider } from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

export const loggerProvider: Provider = {
    provide: Logger,
    useFactory: (configService: ConfigService) => {
        const level = configService.get<LogLevel>('LOGGER_LEVEL', 'log');
        const logger = new Logger();
        logger.localInstance.setLogLevels?.([level]);
        return logger;
    },
    inject: [ConfigService],
};
