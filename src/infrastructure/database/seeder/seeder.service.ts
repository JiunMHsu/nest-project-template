import { Injectable } from '@nestjs/common';

import { SeedOptions } from './seeder.options';

@Injectable()
export class SeederService {
    public async clear(): Promise<void> {
        // Implement clearing logic here
    }

    public async seed(__options: SeedOptions): Promise<void> {
        // Implement seeding logic here
    }
}
