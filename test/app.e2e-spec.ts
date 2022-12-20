import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { User, Event } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClientService;
  let user: User;
  let event: Event;
  

  const catShape = expect.objectContaining({
    id: expect.any(String),
    name: expect.any(String),
    breed: expect.any(String),
    age: expect.any(Number),
    ownerId: expect.any(String),
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
