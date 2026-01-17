import { Injectable } from '@nestjs/common';

@Injectable()
export class SeederService {
    public async clear(): Promise<void> {
        // Implement clearing logic here
    }

    public async seed(): Promise<void> {
        // Implement seeding logic here
    }
}
