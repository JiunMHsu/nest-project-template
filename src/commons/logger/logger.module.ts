import { Global, Module } from '@nestjs/common';
import { loggerProvider } from './logger.provider';

@Global()
@Module({
    providers: [loggerProvider],
    exports: [loggerProvider],
})
export class LoggerModule {}
