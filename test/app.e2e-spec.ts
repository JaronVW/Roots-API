import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { User, Event, Organisation, Prisma } from '@prisma/client';
import { useContainer } from 'class-validator';
import { SignUpDto } from 'src/authentication/dto/signUpDto';
import argon2 = require('argon2');

describe('AppController (e2e)', () => {
  // delete local testdb, then run locally using npm run test:prisma:deploy && npm run test:e2e:local
  let app: INestApplication;
  let prisma: PrismaClientService;

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
    content: expect.any(String) || null,
    dateOfEvent: expect.any(String),
    userId: null,
    tags: expect.any(Array),
    isArchived: expect.any(Boolean),
    organisationId: expect.any(Number),
  });

  const tagShape = expect.objectContaining({
    id: expect.any(Number),
    subject: expect.any(String),
    count: expect.any(Number),
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
    // user = await prisma.user.create({
    //   data: {
    //     email: 'exampleEmail',
    //     password: 'examplePassword',
    //     firstName: 'exampleFirstName',
    //     lastName: 'exampleLastName',
    //   },
    // });
    // tag1 = await prisma.tag.create({
    //   data: {
    //     subject: 'exampleSubject',
    //   },
    // });
    // tag2 = await prisma.tag.create({
    //   data: {
    //     subject: 'exampleSubject2',
    //   },
    // });
    // tag3 = await prisma.tag.create({
    //   data: {
    //     subject: 'exampleSubject3',
    //   },
    // });
    // event1 = await prisma.event.create({
    //   data: {
    //     title: 'exampleTitle',
    //     description: 'exampleDescription',
    //     content: 'exampleContent',
    //     dateOfEvent: new Date('2022-01-01').toISOString(),
    //     userId: user.id,
    //     tags: {
    //       connect: [
    //         {
    //           subject: 'exampleSubject',
    //         },
    //         {
    //           subject: 'exampleSubject2',
    //         },
    //       ],
    //     },
    //   },
    // });
    // event2 = await prisma.event.create({
    //   data: {
    //     title: 'exampleTitle2',
    //     description: 'exampleDescription2',
    //     content: 'exampleContent2',
    //     dateOfEvent: new Date('2019-01-01').toISOString(),
    //     userId: user.id,
    //     tags: {
    //       connect: [
    //         {
    //           subject: 'exampleSubject',
    //         },
    //         {
    //           subject: 'exampleSubject3',
    //         },
    //       ],
    //     },
    //   },
    // });
    // event3 = await prisma.event.create({
    //   data: {
    //     title: 'exampleTitle3',
    //     description: 'exampleDescription3',
    //     content: 'exampleContent3',
    //     dateOfEvent: new Date('2020-01-01').toISOString(),
    //     userId: user.id,
    //     tags: {
    //       connect: [
    //         {
    //           subject: 'exampleSubject3',
    //         },
    //       ],
    //     },
    //   },
    // });
    // eventArray = [event1, event2, event3];
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.event.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organisation.deleteMany();
    await prisma.multimedia.deleteMany();
  });

  it('/ (GET) should give Hello World!', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  //should add standard tags per organisation with count of events 0

  describe('You can create an organisation and register an account for this organisation', () => {
    let organisation: Prisma.OrganisationCreateInput;
    let user: SignUpDto;

    beforeAll(() => {
      organisation = {
        domainName: 'exampledomain.com',
        name: 'Example organisation',
      };

      user = {
        username: 'email@exampledomain.com',
        password: 'examplePassword',
        firstName: 'exampleFirstName',
        lastName: 'exampleLastName',
      };
    });

    it('should create an organisation', async () => {
      const { status, body } = await request(app.getHttpServer()).post('/organisations').send(organisation);
      expect(status).toBe(201);
      expect(body).toEqual({
        id: expect.any(Number),
        domainName: organisation.domainName,
        name: organisation.name,
      });

      request(app.getHttpServer())
        .get(`/organisations${body.id}`)
        .expect(200)
        .expect({
          id: expect.any(Number),
          domainName: organisation.domainName,
          name: organisation.name,
        });
    });

    it('should not create an organisation if the domain is not a valid email domain', async () => {
      const result = await request(app.getHttpServer()).post('/organisations').send({
        domainName: 'exampledomain',
        name: 'Example organisation',
      });

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        statusCode: 400,
        message: 'Invalid domain name',
        error: 'Bad Request',
      });
    });

    it('should not create an organisation if the domain is already taken', async () => {
      const { status: organisationStatus } = await request(app.getHttpServer())
        .post('/organisations')
        .send(organisation);
      expect(organisationStatus).toBe(201);

      const { status: organisationStatus2, body: organisationBody2 } = await request(app.getHttpServer())
        .post('/organisations')
        .send(organisation);
      expect(organisationStatus2).toBe(400);
      expect(organisationBody2).toEqual({
        statusCode: 400,
        message: 'An organisation is already using that domain name',
        error: 'Bad Request',
      });
    });

    it('should create an account for an organisation based on email domain and return access token', async () => {
      const { status: organisationStatus, body: organisationBody } = await request(app.getHttpServer())
        .post('/organisations')
        .send(organisation);
      expect(organisationStatus).toBe(201);
      expect(organisationBody).toEqual({
        id: expect.any(Number),
        domainName: organisation.domainName,
        name: organisation.name,
      });

      const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);

      expect(registerStatus).toBe(201);
      expect(registerBody).toEqual({
        access_token: expect.any(String),
      });
    });

    it('should create an account if the email domain is not case sensitive', async () => {
      const { status: organisationStatus, body: organisationBody } = await request(app.getHttpServer())
        .post('/organisations')
        .send({
          domainName: 'EXAMPLEDOMAIN.COM',
          name: 'Example organisation',
        });
      expect(organisationStatus).toBe(201);
      expect(organisationBody).toEqual({
        id: expect.any(Number),
        domainName: 'exampledomain.com',
        name: 'Example organisation',
      });

      const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'mail@exampleDOMAIN.Com',
          password: 'examplePassword',
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
        });

      expect(registerStatus).toBe(201);
      expect(registerBody).toEqual({
        access_token: expect.any(String),
      });
    });

    it('should create an account if there is another account with the same first and last name', async () => {
      const { status: organisationStatus, body: organisationBody } = await request(app.getHttpServer())
        .post('/organisations')
        .send(organisation);
      expect(organisationStatus).toBe(201);
      expect(organisationBody).toEqual({
        id: expect.any(Number),
        domainName: organisation.domainName,
        name: organisation.name,
      });

      const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);

      expect(registerStatus).toBe(201);
      expect(registerBody).toEqual({
        access_token: expect.any(String),
      });

      const { status: registerStatus2, body: registerBody2 } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'user2@exampledomain.com',
          password: 'examplePassword',
          firstName: user.firstName,
          lastName: user.lastName,
        });

      expect(registerStatus2).toBe(201);
      expect(registerBody2).toEqual({
        access_token: expect.any(String),
      });
    });

    it('should not create an account if there are no organisations', async () => {
      const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);

      expect(registerStatus).toBe(404);
      expect(registerBody).toEqual({
        statusCode: 404,
        message: 'Organisation not found',
        error: 'Not Found',
      });
    });

    it('should not create an account if there are no organisations with this email domain', async () => {
      await request(app.getHttpServer()).post('/organisations').send(organisation);

      await request(app.getHttpServer())
        .post('/organisations')
        .send({ domainName: 'exampledomain2.com', name: 'Example organisation 2' });

      const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'email@nonexisting.domain',
          password: 'examplePassword',
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
        });

      expect(registerStatus).toBe(404);
      expect(registerBody).toEqual({
        statusCode: 404,
        message: 'Organisation not found',
        error: 'Not Found',
      });
    });

    it('should not create an account if the email is already taken', async () => {
      await request(app.getHttpServer()).post('/organisations').send(organisation);

      await request(app.getHttpServer()).post('/auth/register').send(user);

      const { status: registerStatus2, body: registerBody2 } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);

      expect(registerStatus2).toBe(400);
      expect(registerBody2).toEqual({
        statusCode: 400,
        message: 'email is already in use',
        error: 'Bad Request',
      });
    });

    it('should create an account for an organisation based on email domain and login with this account', async () => {
      const { status: organisationStatus, body: organisationBody } = await request(app.getHttpServer())
        .post('/organisations')
        .send(organisation);
      expect(organisationStatus).toBe(201);
      expect(organisationBody).toEqual({
        id: expect.any(Number),
        domainName: organisation.domainName,
        name: organisation.name,
      });

      const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);

      expect(registerStatus).toBe(201);
      expect(registerBody).toEqual({
        access_token: expect.any(String),
      });

      const { status: loginStatus, body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
        username: user.username,
        password: user.password,
      });

      expect(loginStatus).toBe(201);
      expect(loginBody).toEqual({
        access_token: expect.any(String),
      });
    });
  });

  // test that other domains cannot access events of domain
  // multiple users can change the same information
  // title needs to be unique inside organisation, not out
  // tags different per organisation

  // test searching of events

  describe('A user can add, edit and archive events for their organisation', () => {
    let organisation: Organisation;
    let otherOrganisation: Organisation;
    const password = 'examplePassword';
    let user: User;
    let user2: User;
    let userOfOtherOrganisation: User;
    let event: Event;
    let eventOtherOrganisation: Event;

    beforeEach(async () => {
      organisation = await prisma.organisation.create({
        data: {
          domainName: 'exampledomain.com',
          name: 'Example organisation',
        },
      });

      otherOrganisation = await prisma.organisation.create({
        data: {
          domainName: 'otherOrganisation.com',
          name: 'Other organisation',
        },
      });

      user = await prisma.user.create({
        data: {
          email: 'user@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
        },
      });

      user2 = await prisma.user.create({
        data: {
          email: 'user2@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
        },
      });

      userOfOtherOrganisation = await prisma.user.create({
        data: {
          email: 'user@otherorganisation.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: otherOrganisation.id,
        },
      });

      event = await prisma.event.create({
        data: {
          title: 'Example event',
          dateOfEvent: new Date(),
          description: 'Example description',
          tags: {
            create: [
              {
                subject: 'Example tag1',
                organisationId: organisation.id,
              },
              {
                subject: 'Example tag2',
                organisationId: organisation.id,
              },
            ],
          },
          organisationId: organisation.id,
        },
      });

      eventOtherOrganisation = await prisma.event.create({
        data: {
          title: 'Example event other organisation',
          dateOfEvent: new Date(),
          description: 'Example description',
          tags: {
            create: [
              {
                subject: 'Example tag1',
                organisationId: otherOrganisation.id,
              },
            ],
          },
          organisationId: otherOrganisation.id,
        },
      });
    });

    describe('A user can create an event', () => {
      it('should not be able to add an event if the user is not logged in', async () => {
        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post('/events')
          .send({
            title: 'Example event 2',
            dateOfEvent: new Date(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
          });

        expect(eventStatus).toBe(401);
        expect(eventBody).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('should create an event for the organisation of the user', async () => {
        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password: password,
        });

        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .send({
            title: 'Example event 2',
            dateOfEvent: new Date(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
          });

        expect(eventStatus).toBe(201);
        // expect(eventBody).toEqual(eventShape);
        expect(eventBody).toHaveProperty('id');
        expect(eventBody).toHaveProperty('title', 'Example event 2');
        expect(eventBody).toHaveProperty('description', 'Example description');
        expect(eventBody).toHaveProperty('organisationId', organisation.id);
      });

      it('should create an event if the title is unique inside the organisation', async () => {
        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password: password,
        });

        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .send({
            title: eventOtherOrganisation.title,
            dateOfEvent: new Date(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
          });

        expect(eventStatus).toBe(201);
        // expect(eventBody).toEqual(eventShape);
        expect(eventBody).toHaveProperty('id');
        expect(eventBody).toHaveProperty('title', eventOtherOrganisation.title);
        expect(eventBody).toHaveProperty('description', 'Example description');
        expect(eventBody).toHaveProperty('organisationId', organisation.id);
      });

      it('should not create an event if the title is not unique inside the organisation', async () => {
        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password: password,
        });

        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .send({
            title: event.title,
            dateOfEvent: new Date(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
          });

        expect(eventStatus).toBe(400);
        expect(eventBody).toEqual({
          statusCode: 400,
          message: "Can't create event",
          error: 'Bad Request',
        });
      });
    });

    describe('A user can edit and archive events of their organisation', () => {
      let id: number;
      let access_token: string;

      beforeEach(async () => {
        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password: password,
        });
        access_token = loginBody.access_token;

        const { body: eventBody } = await request(app.getHttpServer())
          .post(`/events`)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            title: 'Example event 2',
            dateOfEvent: new Date(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
          });

        id = eventBody.id;
      });

      it('should update an event if user is part of the organisation', async () => {
        const { body: loginBody2 } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user2.email,
          password: password,
        });

        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .put(`/events/${id}`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`)
          .send({
            title: 'A different title',
          });

        expect(eventStatus2).toBe(200);
        expect(eventBody2).toHaveProperty('id', id);
        expect(eventBody2).toHaveProperty('title', 'A different title');
      });

      it('should not update an event if the user is not authenticated', async () => {
        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .put(`/events/${id}`)
          .send({
            title: 'A different title',
          });

        expect(eventStatus2).toBe(401);
        expect(eventBody2).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('should not update an event if user is not part of the organisation', async () => {
        const { body: loginBody2 } = await request(app.getHttpServer()).post('/auth/login').send({
          username: userOfOtherOrganisation.email,
          password: password,
        });
        expect(loginBody2).toHaveProperty('access_token');

        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .put(`/events/${id}`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`)
          .send({
            title: 'A different title',
          });

        expect(eventStatus2).toBe(401);
        expect(eventBody2).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('should not update an event if the title is not unique inside the organisation', async () => {
        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .put(`/events/${id}`)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            title: event.title,
          });

        expect(eventStatus).toBe(400);
        expect(eventBody).toEqual({
          statusCode: 400,
          message: 'Bad Request',
        });
      });

      it('should archive an event if user is part of the organisation', async () => {
        const { body: loginBody2 } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user2.email,
          password: password,
        });

        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .patch(`/events/${id}/archive`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`);

        expect(eventStatus2).toBe(200);
        expect(eventBody2).toHaveProperty('id', id);
        expect(eventBody2).toHaveProperty('isArchived', true);
      });

      it('should not archive an event if the user is not authenticated', async () => {
        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer()).patch(
          `/events/${id}/archive`,
        );

        expect(eventStatus2).toBe(401);
        expect(eventBody2).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('should not archive an event if user is not part of the organisation', async () => {
        const { body: loginBody2 } = await request(app.getHttpServer()).post('/auth/login').send({
          username: userOfOtherOrganisation.email,
          password: password,
        });

        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .patch(`/events/${id}/archive`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`);

        expect(eventStatus2).toBe(401);
        expect(eventBody2).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('should unarchive an event if user is part of the organisation', async () => {
        const { body: loginBody2 } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user2.email,
          password: password,
        });

        await request(app.getHttpServer())
          .patch(`/events/${id}/archive`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`);

        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .patch(`/events/${id}/unarchive`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`);

        expect(eventStatus2).toBe(200);
        expect(eventBody2).toHaveProperty('id', id);
        expect(eventBody2).toHaveProperty('isArchived', false);
      });

      it('should not unarchive an event if the user is not authenticated', async () => {
        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer()).patch(
          `/events/${id}/unarchive`,
        );

        expect(eventStatus2).toBe(401);
        expect(eventBody2).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });

      it('should not unarchive an event if user is not part of the organisation', async () => {
        const { body: loginBody2 } = await request(app.getHttpServer()).post('/auth/login').send({
          username: userOfOtherOrganisation.email,
          password: password,
        });

        const { status: eventStatus2, body: eventBody2 } = await request(app.getHttpServer())
          .patch(`/events/${id}/unarchive`)
          .set('Authorization', `Bearer ${loginBody2.access_token}`);

        expect(eventStatus2).toBe(401);
        expect(eventBody2).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });
    });

    // gets events of own organisation
    //
  });

  // events are returned in order of dateOfEvent descending
  // events can be filtered by a search param, that searches tags, title and description
  // events can be filtered by page and limit
  // events can be filtered by isArchived

  // tag connected or created

  describe('A user can only retrieve events of their organisation and this result can be filtered', () => {
    let organisation: Organisation;
    let otherOrganisation: Organisation;
    let user: User;
    let user1Token: string;
    let user2: User;
    let userOfOtherOrganisation: User;
    let userOfOtherOrganisationToken: string;
    let eventArray = [];
    let event: Event;
    let event2: Event;
    let event3: Event;
    let event4: Event;
    let event5: Event;
    let eventArrayOtherOrganisation = [];
    let eventOtherOrganisation: Event;
    let eventOtherOrganisation2: Event;
    let eventOtherOrganisation3: Event;

    const password = 'password';

    beforeEach(async () => {
      organisation = await prisma.organisation.create({
        data: {
          domainName: 'exampledomain.com',
          name: 'Example organisation',
        },
      });

      otherOrganisation = await prisma.organisation.create({
        data: {
          domainName: 'otherOrganisation.com',
          name: 'Other organisation',
        },
      });

      user = await prisma.user.create({
        data: {
          email: 'user@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
        },
      });

      user2 = await prisma.user.create({
        data: {
          email: 'user2@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
        },
      });

      userOfOtherOrganisation = await prisma.user.create({
        data: {
          email: 'user@otherorganisation.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: otherOrganisation.id,
        },
      });

      event = await prisma.event.create({
        data: {
          title: 'Example event',
          dateOfEvent: new Date('2020-01-01'),
          description: 'Example description',
          tags: {
            create: [
              {
                subject: 'Example tag1',
                organisationId: organisation.id,
              },
              {
                subject: 'Example tag2',
                organisationId: organisation.id,
              },
            ],
          },
          organisationId: organisation.id,
        },
      });

      event2 = await prisma.event.create({
        data: {
          title: 'Example event2',
          dateOfEvent: new Date('2019-01-02'),
          description: 'Example description',
          tags: {
            connectOrCreate: [
              {
                where: { unique_tag_organisation: { subject: 'Example tag1', organisationId: organisation.id } },
                create: { subject: 'Example tag1', organisationId: organisation.id },
              },
            ],
          },
          organisationId: organisation.id,
        },
      });

      event3 = await prisma.event.create({
        data: {
          title: 'Example event3',
          dateOfEvent: new Date('2023-01-01'),
          description: 'Example description',
          tags: {
            connectOrCreate: [
              {
                where: { unique_tag_organisation: { subject: 'Example tag1', organisationId: organisation.id } },
                create: { subject: 'Example tag1', organisationId: organisation.id },
              },
            ],
          },
          organisationId: organisation.id,
        },
      });

      event4 = await prisma.event.create({
        data: {
          title: 'Example event4',
          dateOfEvent: new Date('2020-01-01'),
          description: 'Example description',
          tags: {
            connectOrCreate: [
              {
                where: { unique_tag_organisation: { subject: 'Example tag1', organisationId: organisation.id } },
                create: { subject: 'Example tag1', organisationId: organisation.id },
              },
            ],
          },
          organisationId: organisation.id,
        },
      });

      event5 = await prisma.event.create({
        data: {
          title: 'Example event5',
          dateOfEvent: new Date('2022-01-01'),
          description: 'Example description',
          tags: {
            connectOrCreate: [
              {
                where: { unique_tag_organisation: { subject: 'Example tag1', organisationId: organisation.id } },
                create: { subject: 'Example tag1', organisationId: organisation.id },
              },
            ],
          },
          organisationId: organisation.id,
        },
      });
      eventArray = [event, event2, event3, event4, event5];

      eventOtherOrganisation = await prisma.event.create({
        data: {
          title: 'Example event other organisation',
          dateOfEvent: new Date('2020-01-01'),
          description: 'Example description',
          tags: {
            create: [
              {
                subject: 'Example tag1',
                organisationId: otherOrganisation.id,
              },
            ],
          },
          organisationId: otherOrganisation.id,
        },
      });

      eventOtherOrganisation2 = await prisma.event.create({
        data: {
          title: 'Example event other organisation2',
          dateOfEvent: new Date('2022-01-01'),
          description: 'Example description',
          tags: {
            connectOrCreate: [
              {
                where: { unique_tag_organisation: { subject: 'Example tag1', organisationId: otherOrganisation.id } },
                create: { subject: 'Example tag1', organisationId: otherOrganisation.id },
              },
            ],
          },
          organisationId: otherOrganisation.id,
        },
      });

      eventOtherOrganisation3 = await prisma.event.create({
        data: {
          title: 'Example event other organisation3',
          dateOfEvent: new Date(),
          description: 'Example description',
          tags: {
            connectOrCreate: [
              {
                where: { unique_tag_organisation: { subject: 'Example tag1', organisationId: otherOrganisation.id } },
                create: { subject: 'Example tag1', organisationId: otherOrganisation.id },
              },
            ],
          },
          organisationId: otherOrganisation.id,
        },
      });
      eventArrayOtherOrganisation = [eventOtherOrganisation, eventOtherOrganisation2, eventOtherOrganisation3];

      const { body: loginBody } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: password });
      user1Token = loginBody.access_token;

      const { body: loginBody2 } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: userOfOtherOrganisation.email, password: password });
      userOfOtherOrganisationToken = loginBody2.access_token;
    });

    it('should return the events of your organisation', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(5);
      body.forEach((event: Event) => {
        expect(event.organisationId).toBe(organisation.id);
      });

      const { status: status2, body: body2 } = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userOfOtherOrganisationToken}`);
      expect(status2).toBe(200);
      expect(body2).toHaveLength(3);
      body2.forEach((event: Event) => {
        expect(event.organisationId).toBe(otherOrganisation.id);
      });
    });

    it('should not return any events if there are no events in your organisation', async () => {
      await prisma.event.deleteMany();
      const { status, body } = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(0);
    });

    it('should return the events of your organisation by date descending', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(5);

      const sortedEvents = eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
      body.forEach((event: Event, index: number) => {
        expect(event.id).toBe(sortedEvents[index].id);
        expect(event.organisationId).toBe(organisation.id);
      });

      const { status: status2, body: body2 } = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userOfOtherOrganisationToken}`);
      expect(status2).toBe(200);
      expect(body2).toHaveLength(3);

      const sortedEvents2 = eventArrayOtherOrganisation.sort(
        (a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime(),
      );
      body2.forEach((event: Event, index: number) => {
        expect(event.id).toBe(sortedEvents2[index].id);
        expect(event.organisationId).toBe(otherOrganisation.id);
      });
    });

    it('should return the events of your organisation by date ascending', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/events?order=asc')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(5);

      const sortedEvents = eventArray.sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime());
      body.forEach((event: Event, index: number) => {
        expect(event.id).toBe(sortedEvents[index].id);
        expect(event.organisationId).toBe(organisation.id);
      });
    });

    it('should return the events of your organisation by date ascending and skip 2', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/events?order=asc&min=2')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(3);

      const sortedEvents = eventArray.sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime());
      body.forEach((event: Event, index: number) => {
        expect(event.id).toBe(sortedEvents[index + 2].id);
        expect(event.organisationId).toBe(organisation.id);
      });
    });

    it('should return the events of your organisation by date ascending and skip 1 and take 2', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/events?order=asc&min=1&max=3')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(2);

      const sortedEvents = eventArray.sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime());
      body.forEach((event: Event, index: number) => {
        expect(event.id).toBe(sortedEvents[index + 1].id);
        expect(event.organisationId).toBe(organisation.id);
      });
    });

    it('should return the events of your organisation by date descending and return max 10 events', async () => {
      await prisma.event.createMany({
        data: [
          {
            title: 'Event 6',
            description: 'Event 6',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
          {
            title: 'Event 7',
            description: 'Event 7',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
          {
            title: 'Event 8',
            description: 'Event 8',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
          {
            title: 'Event 9',
            description: 'Event 9',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
          {
            title: 'Event 10',
            description: 'Event 10',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
          {
            title: 'Event 11',
            description: 'Event 11',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
          {
            title: 'Event 12',
            description: 'Event 12',
            dateOfEvent: new Date('2021-01-01'),
            organisationId: organisation.id,
          },
        ],
      });
      const { status, body } = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toHaveLength(10);

      const { status: status2, body: body2 } = await request(app.getHttpServer())
        .get('/events?min=6')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status2).toBe(200);
      expect(body2).toHaveLength(4);
    });

    // describe('')
  });

  // check for get tags, count and only of organisation (so count of other organisation same tag is different)
  // a user can add new tags when adding a new event, count of these tags is then one

  // testing multimedia

  // describe.skip('Event', () => {
  //   describe('GET /events', () => {
  //     it('should return an array of events', async () => {
  //       eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
  //       const { status, body } = await request(app.getHttpServer()).get('/events');
  //       expect(status).toBe(200);
  //       expect(body).toEqual(expect.arrayContaining([eventShape]));
  //       for (let i = 0; i < body.length; i++) {
  //         expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
  //       }
  //     });

  //     it('should return the events specified by the query', async () => {
  //       eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
  //       eventArray = eventArray.slice(2, 3);
  //       const { status, body } = await request(app.getHttpServer()).get('/events?min=2&max=3');
  //       expect(status).toBe(200);
  //       expect(body).toEqual(expect.arrayContaining([eventShape]));
  //       expect(body.length).toBe(1);
  //       for (let i = 0; i < body.length; i++) {
  //         expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
  //       }
  //     });

  //     it('should return the events in order of date asc if query param order is asc', async () => {
  //       const { status, body } = await request(app.getHttpServer()).get('/events?order=asc');
  //       expect(status).toBe(200);
  //       expect(body).toEqual(expect.arrayContaining([eventShape]));
  //       eventArray.sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime());
  //       for (let i = 0; i < body.length; i++) {
  //         expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
  //       }
  //     });

  //     it('should return the events in order of date desc if query param order is desc', async () => {
  //       const { status, body } = await request(app.getHttpServer()).get('/events?order=desc');
  //       expect(status).toBe(200);
  //       expect(body).toStrictEqual(expect.arrayContaining([eventShape]));
  //       eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
  //       for (let i = 0; i < body.length; i++) {
  //         expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
  //       }
  //     });

  //     it('should return a bad request when the query param is not valid', async () => {
  //       const { status, body } = await request(app.getHttpServer()).get('/events?order=invalid');
  //       expect(status).toBe(400);
  //       // if the error message changes, this test needs to be adjusted
  //       expect(body).toHaveProperty('message', ['order must match /^(asc|desc)$/ regular expression']);
  //     });

  //     it('should return the events in order of date desc if query param order is not provided', async () => {
  //       const { status, body } = await request(app.getHttpServer()).get('/events');
  //       expect(status).toBe(200);
  //       expect(body).toStrictEqual(expect.arrayContaining([eventShape]));
  //       eventArray.sort((a, b) => b.dateOfEvent.getTime() - a.dateOfEvent.getTime());
  //       for (let i = 0; i < body.length; i++) {
  //         expect(new Date(body[i].dateOfEvent)).toEqual(eventArray[i].dateOfEvent);
  //       }
  //     });
  //   });

  //   describe('GET /events/:id', () => {
  //     it('should return an event', async () => {
  //       const { status, body } = await request(app.getHttpServer()).get(`/events/${event1.id}`);
  //       expect(status).toBe(200);
  //       expect(body).toStrictEqual(eventShape);
  //       expect(body).toHaveProperty('id', event1.id);
  //     });

  //     it('should return a bad request when the id is not valid', async () => {
  //       await request(app.getHttpServer()).get('/events/invalid').expect(400);
  //     });

  //     it('should return a not found when the id is not found', async () => {
  //       await request(app.getHttpServer()).get('/events/0').expect(404);
  //     });
  //   });

  //   describe('POST /events', () => {
  //     it('should create a new event', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .post('/events')
  //         .send({
  //           title: 'Example title create',
  //           description: 'Example description create',
  //           dateOfEvent: new Date('2018-01-01'),
  //         })
  //         .expect(201);
  //       expect(body).toHaveProperty('id');
  //       expect(body).toHaveProperty('title', 'Example title create');
  //       expect(body).toHaveProperty('description', 'Example description create');
  //       expect(body).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');
  //       expect(body).toHaveProperty('isArchived', false);
  //     });

  //     it('should return a bad request when the body is not valid', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .post('/events')
  //         .send({
  //           title: 'example title',
  //           description: 'exampleDescription',
  //           dateOfEvent: 'invalid',
  //         })
  //         .expect(400);
  //       expect(body).toHaveProperty('message', ['dateOfEvent must be a valid ISO 8601 date string']);
  //     });

  //     it('should return a bad request when the body is not provided', async () => {
  //       const { body } = await request(app.getHttpServer()).post('/events').expect(400);
  //       expect(body).toHaveProperty('message', [
  //         'title must be a string',
  //         'title should not be empty',
  //         'description must be a string',
  //         'description should not be empty',
  //       ]);
  //     });

  //     it('should return a bad request when the body is empty', async () => {
  //       const { body } = await request(app.getHttpServer()).post('/events').send({}).expect(400);
  //       expect(body).toHaveProperty('message', [
  //         'title must be a string',
  //         'title should not be empty',
  //         'description must be a string',
  //         'description should not be empty',
  //       ]);
  //     });

  //     it('should return a bad request when the body is missing a property', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .post('/events')
  //         .send({
  //           description: 'exampleName',
  //         })
  //         .expect(400);
  //       expect(body).toHaveProperty('message', ['title must be a string', 'title should not be empty']);
  //     });

  //     it('should return a bad request when the body has an extra property', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .post('/events')
  //         .send({
  //           title: 'example title',
  //           description: 'example description',
  //           dateOfEvent: new Date('2020-01-01'),
  //           extra: 'extra',
  //         })
  //         .expect(400);
  //       expect(body).toHaveProperty('message');
  //     });
  //   });

  //   describe('PUT /events/:id', () => {
  //     it('should update an event', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .put(`/events/${event1.id}`)
  //         .send({
  //           title: 'Example title update',
  //           description: 'Example description update',
  //           dateOfEvent: new Date('2018-01-01'),
  //         })
  //         .expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('title', 'Example title update');
  //       expect(body).toHaveProperty('description', 'Example description update');
  //       expect(body).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');
  //     });

  //     it('should create and update an event', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .post(`/events`)
  //         .send({
  //           title: 'Example title create',
  //           description: 'Example description create',
  //           dateOfEvent: new Date('2018-01-01'),
  //         })
  //         .expect(201);
  //       expect(body).toHaveProperty('id');
  //       expect(body).toHaveProperty('title', 'Example title create');
  //       expect(body).toHaveProperty('description', 'Example description create');
  //       expect(body).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');

  //       const { body: body2 } = await request(app.getHttpServer())
  //         .put(`/events/${body.id}`)
  //         .send({
  //           title: 'Example title update',
  //           description: 'Example description update',
  //           dateOfEvent: new Date('2018-01-01'),
  //         })
  //         .expect(200);
  //       expect(body2).toHaveProperty('id', body.id);
  //       expect(body2).toHaveProperty('title', 'Example title update');
  //       expect(body2).toHaveProperty('description', 'Example description update');
  //       expect(body2).toHaveProperty('dateOfEvent', '2018-01-01T00:00:00.000Z');
  //     });

  //     it('should return a bad request when the body is not valid', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .put(`/events/${event1.id}`)
  //         .send({
  //           title: 'example title',
  //           description: 'exampleDescription',
  //           dateOfEvent: 'invalid',
  //         })
  //         .expect(400);
  //       expect(body).toHaveProperty('message', ['dateOfEvent must be a valid ISO 8601 date string']);
  //     });

  //     it('should still return an OK if body is not provided', async () => {
  //       const { body } = await request(app.getHttpServer()).put(`/events/${event1.id}`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('title', event1.title);
  //       expect(body).toHaveProperty('description', event1.description);
  //     });

  //     it('should update without all required properties for creating an event', async () => {
  //       const { body } = await request(app.getHttpServer())
  //         .put(`/events/${event1.id}`)
  //         .send({
  //           description: 'a new description',
  //         })
  //         .expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('title', event1.title);
  //       expect(body).toHaveProperty('description', 'a new description');
  //     });
  //   });

  //   describe('DELETE /events/:id', () => {
  //     it('should delete an event', async () => {
  //       const { body } = await request(app.getHttpServer()).delete(`/events/${event1.id}`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('title', event1.title);
  //       expect(body).toHaveProperty('description', event1.description);
  //     });

  //     it('should return a not found when the event does not exist', async () => {
  //       const { body } = await request(app.getHttpServer()).delete(`/events/0`).expect(404);
  //       expect(body).toHaveProperty('message', "Event doesn't exist");
  //     });

  //     it('should return a not found when the event id is invalid', async () => {
  //       const { body } = await request(app.getHttpServer()).delete(`/events/invalid`).expect(400);
  //       expect(body).toHaveProperty('message', 'Invalid id');
  //     });

  //     it('should return a not found if an id is not provided, as it is not a valid route', async () => {
  //       const { body } = await request(app.getHttpServer()).delete(`/events/`).expect(404);
  //       expect(body).toHaveProperty('message', 'Cannot DELETE /events/');
  //     });
  //   });

  //   describe('PATCH events/:id/archive', () => {
  //     it('should archive an event', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/archive`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('isArchived', true);
  //     });

  //     it('should return a not found when the event does not exist', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/0/archive`).expect(404);
  //       expect(body).toHaveProperty('message', "Event doesn't exist");
  //     });

  //     it('should return a not found when the event id is invalid', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/invalid/archive`).expect(400);
  //       expect(body).toHaveProperty('message', "Can't archive event");
  //     });

  //     it('should return a not found if an id is not provided, as it is not a valid route', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events//archive`).expect(404);
  //       expect(body).toHaveProperty('message', 'Cannot PATCH /events//archive');
  //     });

  //     it('should still return an OK if body is not provided', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/archive`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('isArchived', true);
  //     });

  //     it('should update without all required properties for creating an event', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/archive`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('isArchived', true);
  //     });
  //   });

  //   describe('PATCH events/:id/unarchive', () => {
  //     it('should unarchive an event', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/unarchive`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('isArchived', false);
  //     });

  //     it('should return a not found when the event does not exist', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/0/unarchive`).expect(404);
  //       expect(body).toHaveProperty('message', "Event doesn't exist");
  //     });

  //     it('should return a not found when the event id is invalid', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/invalid/unarchive`).expect(400);
  //       expect(body).toHaveProperty('message', "Can't unarchive event");
  //     });

  //     it('should return a not found if an id is not provided, as it is not a valid route', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events//unarchive`).expect(404);
  //       expect(body).toHaveProperty('message', 'Cannot PATCH /events//unarchive');
  //     });

  //     it('should still return an OK if body is not provided', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/unarchive`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('isArchived', false);
  //     });

  //     it('should update without all required properties for creating an event', async () => {
  //       const { body } = await request(app.getHttpServer()).patch(`/events/${event1.id}/unarchive`).expect(200);
  //       expect(body).toHaveProperty('id', event1.id);
  //       expect(body).toHaveProperty('isArchived', false);
  //     });
  //   });
  // });

  // describe.skip('Tags', () => {
  //   describe('GET /tags', () => {
  //     it('should return an array of tags', async () => {
  //       const { body } = await request(app.getHttpServer()).get(`/tags`).expect(200);
  //       expect(body).toEqual(expect.arrayContaining([tagShape]));
  //     });

  //     it('should be ordered by number of events', async () => {
  //       const { body } = await request(app.getHttpServer()).get(`/tags`).expect(200);
  //       expect(body[0]).toHaveProperty('id', tag1.id);
  //       expect(body[1]).toHaveProperty('id', tag3.id);
  //       expect(body[2]).toHaveProperty('id', tag2.id);
  //     });
  //   });
  // });

  // describe.skip('User', () => {
  //   describe('POST /users', () => {
  //     it.skip('should create a new user', () => {
  //       return request(app.getHttpServer())
  //         .post('/users')
  //         .send({
  //           email: 'exampleEmail2',
  //           password: 'examplePassword2',
  //           firstName: 'exampleFirstName2',
  //           lastName: 'exampleLastName2',
  //         })
  //         .expect(201)
  //         .expect(userShape);
  //     });
  //   });

  //   describe('GET /users/:id', () => {
  //     it.skip('should return a user', () => {
  //       return request(app.getHttpServer()).get(`/users/${user.id}`).expect(200).expect(userShape);
  //     });
  //   });

  //   describe('PUT /users/:id', () => {
  //     it.skip('should update a user', () => {
  //       return request(app.getHttpServer())
  //         .put(`/users/${user.id}`)
  //         .send({
  //           email: 'exampleEmail2',
  //           password: 'examplePassword2',
  //           firstName: 'exampleFirstName2',
  //           lastName: 'exampleLastName2',
  //         })
  //         .expect(200)
  //         .expect(userShape);
  //     });
  //   });

  //   describe('DELETE /users/:id', () => {
  //     it.skip('should delete a user', () => {
  //       return request(app.getHttpServer()).delete(`/users/${user.id}`).expect(200).expect(userShape);
  //     });
  //   });
  // });
});
