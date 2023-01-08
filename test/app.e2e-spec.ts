import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { User, Event, Tag } from '@prisma/client';
import { useContainer } from 'class-validator';

describe('AppController (e2e)', () => {
  // delete local testdb, then run locally using npm run test:prisma:deploy && npm run test:e2e
  let app: INestApplication;
  let prisma: PrismaClientService;
  let user: User;
  let event1: Event;
  let event2: Event;
  let event3: Event;
  let eventArray: Event[];
  let tag1: Tag;
  let tag2: Tag;
  let tag3: Tag;

  const userShape = expect.objectContaining({
    id: expect.any(Number),
    email: expect.any(String),
    password: expect.any(String),
    firstName: expect.any(String),
    lastName: expect.any(String),
  });

  const eventShape = expect.objectContaining({
    id: expect.any(Number),
    title: expect.any(String),
    description: expect.any(String),
    content: expect.any(String),
    dateOfEvent: expect.any(String),
    userId: expect.any(Number),
    tags: expect.any(Array),
    isArchived: expect.any(Boolean),
    organisationId: null,
  });

  const tagShape = expect.objectContaining({
    id: expect.any(Number),
    subject: expect.any(String),
    _count: expect.objectContaining({ Events: expect.any(Number) }),
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaClientService>(PrismaClientService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        email: 'exampleEmail',
        password: 'examplePassword',
        firstName: 'exampleFirstName',
        lastName: 'exampleLastName',
      },
    });

    tag1 = await prisma.tag.create({
      data: {
        subject: 'exampleSubject',
      },
    });

    tag2 = await prisma.tag.create({
      data: {
        subject: 'exampleSubject2',
      },
    });

    tag3 = await prisma.tag.create({
      data: {
        subject: 'exampleSubject3',
      },
    });

    event1 = await prisma.event.create({
      data: {
        title: 'exampleTitle',
        description: 'exampleDescription',
        content: 'exampleContent',
        dateOfEvent: new Date('2022-01-01').toISOString(),
        userId: user.id,
        tags: {
          connect: [
            {
              subject: 'exampleSubject',
            },
            {
              subject: 'exampleSubject2',
            },
          ],
        },
      },
    });

    event2 = await prisma.event.create({
      data: {
        title: 'exampleTitle2',
        description: 'exampleDescription2',
        content: 'exampleContent2',
        dateOfEvent: new Date('2019-01-01').toISOString(),
        userId: user.id,
        tags: {
          connect: [
            {
              subject: 'exampleSubject',
            },
            {
              subject: 'exampleSubject3',
            },
          ],
        },
      },
    });

    event3 = await prisma.event.create({
      data: {
        title: 'exampleTitle3',
        description: 'exampleDescription3',
        content: 'exampleContent3',
        dateOfEvent: new Date('2020-01-01').toISOString(),
        userId: user.id,
        tags: {
          connect: [
            {
              subject: 'exampleSubject3',
            },
          ],
        },
      },
    });

    eventArray = [event1, event2, event3];
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.event.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  describe('Event', () => {
    describe('GET /events', () => {
      it('should return an array of events', async () => {
        eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
        const { status, body } = await request(app.getHttpServer()).get('/events');
        expect(status).toBe(200);
        expect(body).toEqual(expect.arrayContaining([eventShape]));
        for (let i = 0; i < body.length; i++) {
          expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
        }
      });

      it('should return the events specified by the query', async () => {
        eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
        eventArray = eventArray.slice(2, 3);
        const { status, body } = await request(app.getHttpServer()).get('/events?min=2&max=3');
        expect(status).toBe(200);
        expect(body).toEqual(expect.arrayContaining([eventShape]));
        expect(body.length).toBe(1);
        for (let i = 0; i < body.length; i++) {
          expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
        }
      });

      it('should return the events in order of date asc if query param order is asc', async () => {
        const { status, body } = await request(app.getHttpServer()).get('/events?order=asc');
        expect(status).toBe(200);
        expect(body).toEqual(expect.arrayContaining([eventShape]));
        eventArray.sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime());
        for (let i = 0; i < body.length; i++) {
          expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
        }
      });

      it('should return the events in order of date desc if query param order is desc', async () => {
        const { status, body } = await request(app.getHttpServer()).get('/events?order=desc');
        expect(status).toBe(200);
        expect(body).toStrictEqual(expect.arrayContaining([eventShape]));
        eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
        for (let i = 0; i < body.length; i++) {
          expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
        }
      });

      it('should return a bad request when the query param is not valid', async () => {
        const { status, body } = await request(app.getHttpServer()).get('/events?order=invalid');
        expect(status).toBe(400);
        // if the error message changes, this test needs to be adjusted
        expect(body).toHaveProperty('message', ['order must match /^(asc|desc)$/ regular expression']);
      });

      it('should return the events in order of date desc if query param order is not provided', async () => {
        const { status, body } = await request(app.getHttpServer()).get('/events');
        expect(status).toBe(200);
        expect(body).toStrictEqual(expect.arrayContaining([eventShape]));
        eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
        for (let i = 0; i < body.length; i++) {
          expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
        }
      });
    });

    describe('GET /events/:id', () => {
      it('should return an event', async () => {
        const { status, body } = await request(app.getHttpServer()).get(`/events/${event1.id}`);
        expect(status).toBe(200);
        expect(body).toStrictEqual(eventShape);
        expect(body).toHaveProperty('id', event1.id);
      });

      it('should return a bad request when the id is not valid', async () => {
        await request(app.getHttpServer()).get('/events/invalid').expect(400);
      });

      it('should return a not found when the id is not found', async () => {
        await request(app.getHttpServer()).get('/events/0').expect(404);
      });
    });

    describe('POST /events', () => {
      it('should create a new event', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'Example title create',
            description: 'Example description create',
            dateOfEvent: new Date('2018-01-01'),
          })
          .expect(201);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('title', 'Example title create');
        expect(body).toHaveProperty('description', 'Example description create');
        expect(body).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');
        expect(body).toHaveProperty('isArchived', false);
      });

      it('should return a bad request when the body is not valid', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'example title',
            description: 'exampleDescription',
            dateOfEvent: 'invalid',
          })
          .expect(400);
        expect(body).toHaveProperty('message', ['dateOfEvent must be a valid ISO 8601 date string']);
      });

      it('should return a bad request when the body is not provided', async () => {
        const { body } = await request(app.getHttpServer()).post('/events').expect(400);
        expect(body).toHaveProperty('message', [
          'title must be a string',
          'title should not be empty',
          'description must be a string',
          'description should not be empty',
        ]);
      });

      it('should return a bad request when the body is empty', async () => {
        const { body } = await request(app.getHttpServer()).post('/events').send({}).expect(400);
        expect(body).toHaveProperty('message', [
          'title must be a string',
          'title should not be empty',
          'description must be a string',
          'description should not be empty',
        ]);
      });

      it('should return a bad request when the body is missing a property', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/events')
          .send({
            description: 'exampleName',
          })
          .expect(400);
        expect(body).toHaveProperty('message', ['title must be a string', 'title should not be empty']);
      });

      it('should return a bad request when the body has an extra property', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'example title',
            description: 'example description',
            dateOfEvent: new Date('2020-01-01'),
            extra: 'extra',
          })
          .expect(400);
        expect(body).toHaveProperty('message');
      });
    });

    describe('PUT /events/:id', () => {
      it('should update an event', async () => {
        const { body } = await request(app.getHttpServer())
          .put(`/events/${event1.id}`)
          .send({
            title: 'Example title update',
            description: 'Example description update',
            dateOfEvent: new Date('2018-01-01'),
          })
          .expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('title', 'Example title update');
        expect(body).toHaveProperty('description', 'Example description update');
        expect(body).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');
      });

      it('should create and update an event', async () => {
        const { body } = await request(app.getHttpServer())
          .post(`/events`)
          .send({
            title: 'Example title create',
            description: 'Example description create',
            dateOfEvent: new Date('2018-01-01'),
          })
          .expect(201);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('title', 'Example title create');
        expect(body).toHaveProperty('description', 'Example description create');
        expect(body).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');

        const { body: body2 } = await request(app.getHttpServer())
          .put(`/events/${body.id}`)
          .send({
            title: 'Example title update',
            description: 'Example description update',
            dateOfEvent: new Date('2018-01-01'),
          })
          .expect(200);
        expect(body2).toHaveProperty('id', body.id);
        expect(body2).toHaveProperty('title', 'Example title update');
        expect(body2).toHaveProperty('description', 'Example description update');
        expect(body2).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');
      });

      it('should return a bad request when the body is not valid', async () => {
        const { body } = await request(app.getHttpServer())
          .put(`/events/${event1.id}`)
          .send({
            title: 'example title',
            description: 'exampleDescription',
            dateOfEvent: 'invalid',
          })
          .expect(400);
        expect(body).toHaveProperty('message', ['dateOfEvent must be a valid ISO 8601 date string']);
      });

      it('should still return an OK if body is not provided', async () => {
        const { body } = await request(app.getHttpServer()).put(`/events/${event1.id}`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('title', event1.title);
        expect(body).toHaveProperty('description', event1.description);
      });

      it('should update without all required properties for creating an event', async () => {
        const { body } = await request(app.getHttpServer())
          .put(`/events/${event1.id}`)
          .send({
            description: 'a new description',
          })
          .expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('title', event1.title);
        expect(body).toHaveProperty('description', 'a new description');
      });
    });

    describe('DELETE /events/:id', () => {
      it('should delete an event', async () => {
        const { body } = await request(app.getHttpServer()).delete(`/events/${event1.id}`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('title', event1.title);
        expect(body).toHaveProperty('description', event1.description);
      });

      it('should return a not found when the event does not exist', async () => {
        const { body } = await request(app.getHttpServer()).delete(`/events/0`).expect(404);
        expect(body).toHaveProperty('message', 'Not Found');
      });

      it('should return a not found when the event id is invalid', async () => {
        const { body } = await request(app.getHttpServer()).delete(`/events/invalid`).expect(400);
        expect(body).toHaveProperty('message', 'Invalid id');
      });

      it('should return a not found if an id is not provided, as it is not a valid route', async () => {
        const { body } = await request(app.getHttpServer()).delete(`/events/`).expect(404);
        expect(body).toHaveProperty('message', 'Cannot DELETE /events/');
      });
    });

    describe('PATCH events/:id/archive', () => {
      it('should archive an event', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/archive`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('isArchived', true);
      });

      it('should return a not found when the event does not exist', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/0/archive`).expect(404);
        expect(body).toHaveProperty('message', 'Not Found');
      });

      it('should return a not found when the event id is invalid', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/invalid/archive`).expect(400);
        expect(body).toHaveProperty('message', 'Bad Request');
      });

      it('should return a not found if an id is not provided, as it is not a valid route', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events//archive`).expect(404);
        expect(body).toHaveProperty('message', 'Cannot PATCH /events//archive');
      });

      it('should still return an OK if body is not provided', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/archive`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('isArchived', true);
      });

      it('should update without all required properties for creating an event', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/archive`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('isArchived', true);
      });
    });

    describe('PATCH events/:id/unarchive', () => {
      it('should unarchive an event', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/unarchive`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('isArchived', false);
      });

      it('should return a not found when the event does not exist', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/0/unarchive`).expect(404);
        expect(body).toHaveProperty('message', 'Not Found');
      });

      it('should return a not found when the event id is invalid', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/invalid/unarchive`).expect(400);
        expect(body).toHaveProperty('message', 'Bad Request');
      });

      it('should return a not found if an id is not provided, as it is not a valid route', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events//unarchive`).expect(404);
        expect(body).toHaveProperty('message', 'Cannot PATCH /events//unarchive');
      });

      it('should still return an OK if body is not provided', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/unarchive`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('isArchived', false);
      });

      it('should update without all required properties for creating an event', async () => {
        const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/unarchive`).expect(200);
        expect(body).toHaveProperty('id', event1.id);
        expect(body).toHaveProperty('isArchived', false);
      });
    });
  });

  describe('Tags', () => {
    describe('GET /tags', () => {
      it('should return an array of tags', async () => {
        const { body } = await request(app.getHttpServer()).get(`/tags`).expect(200);
        expect(body).toEqual(expect.arrayContaining([tagShape]));
      });

      it('should be ordered by number of events', async () => {
        const { body } = await request(app.getHttpServer()).get(`/tags`).expect(200);
        expect(body[0]).toHaveProperty('id', tag1.id);
        expect(body[1]).toHaveProperty('id', tag3.id);
        expect(body[2]).toHaveProperty('id', tag2.id);
      });
    });
  });

  describe('User', () => {
    describe('POST /users', () => {
      it.skip('should create a new user', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'exampleEmail2',
            password: 'examplePassword2',
            firstName: 'exampleFirstName2',
            lastName: 'exampleLastName2',
          })
          .expect(201)
          .expect(userShape);
      });
    });

    describe('GET /users/:id', () => {
      it.skip('should return a user', () => {
        return request(app.getHttpServer()).get(`/users/${user.id}`).expect(200).expect(userShape);
      });
    });

    describe('PUT /users/:id', () => {
      it.skip('should update a user', () => {
        return request(app.getHttpServer())
          .put(`/users/${user.id}`)
          .send({
            email: 'exampleEmail2',
            password: 'examplePassword2',
            firstName: 'exampleFirstName2',
            lastName: 'exampleLastName2',
          })
          .expect(200)
          .expect(userShape);
      });
    });

    describe('DELETE /users/:id', () => {
      it.skip('should delete a user', () => {
        return request(app.getHttpServer()).delete(`/users/${user.id}`).expect(200).expect(userShape);
      });
    });
  });
});
