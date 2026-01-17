import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LoggerMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        this.logger.log(`Endpoint called with method ${req.method}`, req.originalUrl);
        this.logger.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`, req.originalUrl);
        this.logger.log(`Body: ${JSON.stringify(req.body, null, 2)}`, req.originalUrl);
        next();
    }
}
