import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,
    ) {}

    async seed() {}
}
