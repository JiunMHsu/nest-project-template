import { Module } from '@nestjs/common';

import { InfrastructureModule } from '@infrastructure/infrastructure.module';

import { HealthModule } from './health/health.module';

@Module({
    imports: [InfrastructureModule, HealthModule],
})
export class AppModule {}
