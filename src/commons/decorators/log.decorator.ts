import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { LogInterceptor, LogMode } from '@commons/interceptors/log.interceptor';

export const LogRequest = () => applyDecorators(UseInterceptors(new LogInterceptor(LogMode.REQUEST)));

export const LogResponse = () => applyDecorators(UseInterceptors(new LogInterceptor(LogMode.RESPONSE)));

export const LogReqRes = () => applyDecorators(UseInterceptors(new LogInterceptor(LogMode.BOTH)));
