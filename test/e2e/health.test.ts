import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';

describe('AppHealth (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        try {
            const moduleRef = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();

            app = moduleRef.createNestApplication();
            await app.init();
        } catch (error) {
            console.error('Error in beforeAll setup:', error);
        }
    });

    afterAll(async () => {
        await app.close();
    });

    it('/GET health', async () => {
        const response = await request(app.getHttpServer()).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
});
