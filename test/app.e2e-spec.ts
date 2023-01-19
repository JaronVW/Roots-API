import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';
import { User, Event, Organisation, Prisma } from '@prisma/client';
import { useContainer } from 'class-validator';
import { SignUpDto } from 'src/authentication/dto/signUpDto';
import argon2 = require('argon2');
import { join } from 'path';
import { MailService } from 'src/mail/mail.service';

describe('AppController (e2e)', () => {
  // delete local testdb, then run locally using npm run test:prisma:deploy && npm run test:e2e:local
  let app: INestApplication;
  let prisma: PrismaClientService;
  let mailService: MailService;

  // TODO: rewrite tests with verification needed (create or update user manually (set to active), can verification email be tested?) ;-;
  // TODO: testing activating and deactivating users

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaClientService>(PrismaClientService);
    mailService = app.get<MailService>(MailService);

    jest.mock('src/mail/mail.service');
    mailService.sendVerificationMail = jest.fn().mockResolvedValue('Mail sent');
    mailService.sendPasswordResetMail = jest.fn().mockResolvedValue('Mail sent');

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.multimedia.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organisation.deleteMany();
  });

  it('/ (GET) should give Hello World!', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

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

    describe('You can create an organisation', () => {
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
    });

    describe('You can register an account for an organisation', () => {
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
        expect(registerBody).toEqual({});
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
        expect(registerBody).toEqual({});
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
        expect(registerBody).toEqual({});

        const { status: registerStatus2, body: registerBody2 } = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'user2@exampledomain.com',
            password: 'examplePassword',
            firstName: user.firstName,
            lastName: user.lastName,
          });

        expect(registerStatus2).toBe(201);
        expect(registerBody2).toEqual({});

        const count = await prisma.user.count({ where: { firstName: user.firstName, lastName: user.lastName } });
        expect(count).toBe(2);
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
        expect(registerBody).toEqual({});

        await prisma.user.update({
          where: { email: user.username },
          data: { isActive: true },
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

    describe('Your account needs to be verified before it can be used', () => {
      it('should give a deactivated account if a user has not verified their email and a verificationrequest should be persisted', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});
        const userFromDb = await prisma.user.findUnique({ where: { email: user.username } });
        expect(userFromDb?.isActive).toBe(false);

        const verificationRequest = await prisma.verificationRequest.findUnique({
          where: { email: user.username },
        });
        expect(verificationRequest).toEqual({
          id: expect.any(Number),
          email: user.username,
          token: expect.any(String),
          expires: expect.any(Date),
        });
      });

      it('should give an activated account if a user has verified their email using the token from the verification request', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});

        const verificationRequest = await prisma.verificationRequest.findUnique({
          where: { email: user.username },
        });

        const { status: verifyStatus, body: verifyBody } = await request(app.getHttpServer()).patch(
          `/auth/verify/${verificationRequest?.token}`,
        );

        expect(verifyStatus).toBe(200);
        expect(verifyBody).toHaveProperty('message', 'Account verified');

        const userFromDb = await prisma.user.findUnique({ where: { email: user.username } });
        expect(userFromDb?.isActive).toBe(true);
      });

      it('should login successfully if the user has verified their email', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});

        const verificationRequest = await prisma.verificationRequest.findUnique({
          where: { email: user.username },
        });

        await request(app.getHttpServer()).patch(`/auth/verify/${verificationRequest?.token}`);

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

    describe('You can reset your password', () => {
      it('should send a password reset email if the user exists', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});

        const { status: resetStatus, body: resetBody } = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({ email: user.username });

        expect(resetStatus).toBe(201);
        expect(resetBody).toHaveProperty('message', 'Mail sent');
      });

      it('should not send a password reset email if the user does not exist', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});

        await prisma.user.update({
          where: { email: user.username },
          data: { isActive: true },
        });

        const { status: resetStatus, body: resetBody } = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({ email: 'nonexistent@mail.com' });

        expect(resetStatus).toBe(400);
        expect(resetBody).toHaveProperty('message', 'Something went wrong');
      });

      it('should reset the password if the token is valid', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});

        await prisma.user.update({
          where: { email: user.username },
          data: { isActive: true },
        });

        const { status: resetStatus, body: resetBody } = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({ email: user.username });

        expect(resetStatus).toBe(201);
        expect(resetBody).toHaveProperty('message', 'Mail sent');

        const passwordResetRequest = await prisma.resetPasswordRequest.findUnique({
          where: { email: user.username },
        });

        const { status: resetPasswordStatus, body: resetPasswordBody } = await request(app.getHttpServer())
          .post(`/auth/reset-password/${passwordResetRequest?.token}`)
          .send({ password: 'newPassword' });

        expect(resetPasswordStatus).toBe(201);
        expect(resetPasswordBody).toHaveProperty('message', 'Password changed');

        const { status: loginStatus, body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.username,
          password: 'newPassword',
        });

        expect(loginStatus).toBe(201);
        expect(loginBody).toEqual({
          access_token: expect.any(String),
        });
      });

      it('should not reset the password if the token is invalid', async () => {
        await request(app.getHttpServer()).post('/organisations').send(organisation);

        const { status: registerStatus, body: registerBody } = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        expect(registerStatus).toBe(201);
        expect(registerBody).toEqual({});

        await prisma.user.update({
          where: { email: user.username },
          data: { isActive: true },
        });

        const { status: resetStatus, body: resetBody } = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({ email: user.username });

        expect(resetStatus).toBe(201);
        expect(resetBody).toHaveProperty('message', 'Mail sent');

        const { status: resetPasswordStatus, body: resetPasswordBody } = await request(app.getHttpServer())
          .patch(`/auth/reset-password/invalidToken`)
          .send({ password: 'newPassword' });

        expect(resetPasswordStatus).toBe(404);
        expect(resetPasswordBody).toHaveProperty('error', 'Not Found');
        expect(resetPasswordBody).toHaveProperty('message', 'Cannot PATCH /auth/reset-password/invalidToken');
      });
    });

    describe('You can activate and deactivate other users of the same organisation', () => {
      let organisation: Organisation;
      let otherOrganisation: Organisation;
      let user: User;
      let access_token: string;
      let activatedUser: User;
      let deactivatedUser: User;
      let userOfOtherOrganisation: User;
      let access_tokenOfOtherOrganisation: string;
      const password = 'password';

      beforeEach(async () => {
        organisation = await prisma.organisation.create({
          data: {
            name: 'Test Organisation',
            domainName: 'testorganisation.com',
          },
        });

        otherOrganisation = await prisma.organisation.create({
          data: {
            name: 'Other Organisation',
            domainName: 'otherorganisation.com',
          },
        });

        user = await prisma.user.create({
          data: {
            email: 'firsturser@testorganisation.com ',
            firstName: 'First',
            lastName: 'User',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: organisation.domainName,
              },
            },
            isActive: true,
          },
        });

        activatedUser = await prisma.user.create({
          data: {
            email: 'activeduser@testorganisation.com',
            firstName: 'Actived',
            lastName: 'User',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: organisation.domainName,
              },
            },
            isActive: true,
          },
        });

        deactivatedUser = await prisma.user.create({
          data: {
            email: 'deactivateduser@testorganisation.com',
            firstName: 'Deactivated',
            lastName: 'User',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: organisation.domainName,
              },
            },
            isActive: false,
          },
        });

        userOfOtherOrganisation = await prisma.user.create({
          data: {
            email: 'user@otherorganisation.com',
            firstName: 'Other',
            lastName: 'User',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: otherOrganisation.domainName,
              },
            },
            isActive: true,
          },
        });

        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password,
        });
        access_token = loginBody.access_token;

        const { body: loginBodyOfOtherOrganisation } = await request(app.getHttpServer()).post('/auth/login').send({
          username: userOfOtherOrganisation.email,
          password,
        });
        access_tokenOfOtherOrganisation = loginBodyOfOtherOrganisation.access_token;
      });

      it('should deactivate a user from the same organisation', async () => {
        const { status: deactivateStatus, body: deactivateBody } = await request(app.getHttpServer())
          .patch(`/users/setInactive/${activatedUser.id}`)
          .set('Authorization', `Bearer ${access_token}`);

        expect(deactivateStatus).toBe(200);
        expect(deactivateBody).toHaveProperty('message', 'Set inactive');
      });

      it('should activate a user from the same organisation', async () => {
        const { status: activateStatus, body: activateBody } = await request(app.getHttpServer())
          .patch(`/users/setActive/${deactivatedUser.id}`)
          .set('Authorization', `Bearer ${access_token}`);

        expect(activateStatus).toBe(200);
        expect(activateBody).toHaveProperty('message', 'Set active');
      });

      it('should not deactivate a user from another organisation', async () => {
        const { status: deactivateStatus, body: deactivateBody } = await request(app.getHttpServer())
          .patch(`/users/setInactive/${activatedUser.id}`)
          .set('Authorization', `Bearer ${access_tokenOfOtherOrganisation}`);

        expect(deactivateStatus).toBe(403);
        expect(deactivateBody).toHaveProperty('error', 'Forbidden');
      });

      it('should not activate a user from another organisation', async () => {
        const { status: activateStatus, body: activateBody } = await request(app.getHttpServer())
          .patch(`/users/setActive/${deactivatedUser.id}`)
          .set('Authorization', `Bearer ${access_tokenOfOtherOrganisation}`);

        expect(activateStatus).toBe(403);
        expect(activateBody).toHaveProperty('message', 'Forbidden');
      });
    });

    describe('You can retrieve all users of your organisation', () => {
      let organisation: Organisation;
      let otherOrganisation: Organisation;
      let user: User;
      let access_token: string;
      let userOfOtherOrganisation: User;
      const password = 'password';

      beforeEach(async () => {
        organisation = await prisma.organisation.create({
          data: {
            name: 'Test Organisation',
            domainName: 'testorganisation.com',
          },
        });

        otherOrganisation = await prisma.organisation.create({
          data: {
            name: 'Other Organisation',
            domainName: 'otherorganisation.com',
          },
        });

        user = await prisma.user.create({
          data: {
            email: `user@${organisation.domainName}`,
            firstName: 'Example',
            lastName: 'User',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: organisation.domainName,
              },
            },
            isActive: true,
          },
        });

        await prisma.user.create({
          data: {
            email: `user2@${organisation.domainName}`,
            firstName: 'User',
            lastName: 'Two',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: organisation.domainName,
              },
            },
            isActive: false,
          },
        });

        await prisma.user.create({
          data: {
            email: `user3@${organisation.domainName}`,
            firstName: 'User',
            lastName: 'Three',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: organisation.domainName,
              },
            },
            isActive: true,
          },
        });

        userOfOtherOrganisation = await prisma.user.create({
          data: {
            email: `user@${otherOrganisation.domainName}`,
            firstName: 'Other',
            lastName: 'User',
            password: await argon2.hash(password),
            organisation: {
              connect: {
                domainName: otherOrganisation.domainName,
              },
            },
            isActive: true,
          },
        });

        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password,
        });
        access_token = loginBody.access_token;
      });

      it('should return all users of the organisation excluding yourself', async () => {
        const { status, body } = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${access_token}`);

        expect(status).toBe(200);
        expect(body).toHaveLength(2);
        expect(body[0]).toHaveProperty('email', `user2@${organisation.domainName}`);
        expect(body[1]).toHaveProperty('email', `user3@${organisation.domainName}`);
      });

      it('should not return any users if you are not authenticated', async () => {
        const { status, body } = await request(app.getHttpServer()).get('/users');

        expect(status).toBe(401);
        expect(body).toEqual(expect.objectContaining({ message: 'Unauthorized', statusCode: 401 }));
      });
    });
  });

  describe('You can add, edit and archive events for your organisation', () => {
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
          isActive: true,
        },
      });

      user2 = await prisma.user.create({
        data: {
          email: 'user2@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
          isActive: true,
        },
      });

      userOfOtherOrganisation = await prisma.user.create({
        data: {
          email: 'user@otherorganisation.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: otherOrganisation.id,
          isActive: true,
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

    describe('You can create an event', () => {
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

      it('should create an event that has a multimedia item', async () => {
        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password: password,
        });

        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .field('title', 'Example event with image')
          .field('dateOfEvent', new Date().toISOString())
          .field('description', 'Example description')
          .field('tags[0][subject]', 'Example tag1')
          .field('tags[1][subject]', 'Example tag2')
          .field('multimediaItems[0][multimedia]', 'avans_logo.png')
          .attach('files', join(process.cwd(), 'test/avans_logo.png'));
        expect(eventStatus).toBe(201);

        const { status: getEventStatus, body: getEventBody } = await request(app.getHttpServer())
          .get(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${loginBody.access_token}`);
        expect(getEventStatus).toBe(200);
        expect(getEventBody).toHaveProperty('id');
        expect(getEventBody).toHaveProperty('title', 'Example event with image');
        expect(getEventBody).toHaveProperty('description', 'Example description');
        expect(getEventBody).toHaveProperty('organisationId', organisation.id);
        expect(getEventBody).toHaveProperty('multimediaItems');
        expect(getEventBody.multimediaItems).toHaveLength(1);
        expect(getEventBody.multimediaItems[0]).toHaveProperty('id');
        expect(getEventBody.multimediaItems[0]).toHaveProperty('multimedia', 'avans_logo.png');

        const { status: deleteStatus } = await request(app.getHttpServer())
          .put(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .send({
            title: 'Deleting the image from this event',
            dateOfEvent: new Date().toISOString(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
            multimediaItems: [],
          });
        expect(deleteStatus).toBe(200);
      });

      it('should create an event that has multiple multimedia items', async () => {
        const { body: loginBody } = await request(app.getHttpServer()).post('/auth/login').send({
          username: user.email,
          password: password,
        });

        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .field('title', 'Example event with two images')
          .field('dateOfEvent', new Date().toISOString())
          .field('description', 'Example description')
          .field('tags[0][subject]', 'Example tag1')
          .field('tags[1][subject]', 'Example tag2')
          .field('multimediaItems[0][multimedia]', 'avans_logo.png')
          .field('multimediaItems[1][multimedia]', 'ihomer_logo.jpg')
          .attach('files', join(process.cwd(), 'test/avans_logo.png'))
          .attach('files', join(process.cwd(), 'test/ihomer_logo.jpg'));
        expect(eventStatus).toBe(201);

        const { status: getEventStatus, body: getEventBody } = await request(app.getHttpServer())
          .get(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${loginBody.access_token}`);
        expect(getEventStatus).toBe(200);
        expect(getEventBody).toHaveProperty('id');
        expect(getEventBody).toHaveProperty('title', 'Example event with two images');
        expect(getEventBody).toHaveProperty('description', 'Example description');
        expect(getEventBody).toHaveProperty('organisationId', organisation.id);
        expect(getEventBody).toHaveProperty('multimediaItems');
        expect(getEventBody.multimediaItems).toHaveLength(2);
        expect(getEventBody.multimediaItems[0]).toHaveProperty('id');
        expect(getEventBody.multimediaItems[0]).toHaveProperty('multimedia', 'avans_logo.png');
        expect(getEventBody.multimediaItems[1]).toHaveProperty('id');
        expect(getEventBody.multimediaItems[1]).toHaveProperty('multimedia', 'ihomer_logo.jpg');

        const { status: deleteStatus } = await request(app.getHttpServer())
          .put(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${loginBody.access_token}`)
          .send({
            title: 'Deleting the images from this event',
            dateOfEvent: new Date().toISOString(),
            description: 'Example description',
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
            multimediaItems: [],
          });
        expect(deleteStatus).toBe(200);
      });
    });

    describe('You can edit and archive events of your organisation', () => {
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

      it('should update an event with a new image', async () => {
        const { status: eventStatus, body: eventBody } = await request(app.getHttpServer())
          .post(`/events`)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            title: 'An event that does not have an image yet',
            description: 'A different description',
            dateOfEvent: new Date().toISOString(),
            tags: [{ subject: 'Example tag1' }, { subject: 'Example tag2' }],
          });
        expect(eventStatus).toBe(201);
        expect(eventBody).toHaveProperty('id');
        expect(eventBody).toHaveProperty('title', 'An event that does not have an image yet');
        expect(eventBody).toHaveProperty('description', 'A different description');
        expect(eventBody).toHaveProperty('dateOfEvent');

        const { status: getStatus, body: getBody } = await request(app.getHttpServer())
          .get(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${access_token}`);
        expect(getStatus).toBe(200);
        expect(getBody).toHaveProperty('id', eventBody.id);
        expect(getBody).toHaveProperty('title', 'An event that does not have an image yet');
        expect(getBody).toHaveProperty('multimediaItems');
        expect(getBody.multimediaItems).toHaveLength(0);

        const { status: updateStatus, body: updateBody } = await request(app.getHttpServer())
          .put(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${access_token}`)
          .field('title', 'Event now does have an image')
          .field('dateOfEvent', new Date().toISOString())
          .field('description', 'Example description')
          .field('tags[0][subject]', 'Example tag1')
          .field('tags[1][subject]', 'Example tag2')
          .field('multimediaItems[0][multimedia]', 'avans_logo.png')
          .field('multimediaItems[1][multimedia]', 'ihomer_logo.jpg')
          .attach('files', join(process.cwd(), 'test/avans_logo.png'))
          .attach('files', join(process.cwd(), 'test/ihomer_logo.jpg'));
        expect(updateStatus).toBe(200);
        expect(updateBody).toHaveProperty('id', eventBody.id);
        expect(updateBody).toHaveProperty('title', 'Event now does have an image');
        expect(updateBody).toHaveProperty('multimediaItems');
        expect(updateBody.multimediaItems).toHaveLength(2);
        expect(updateBody.multimediaItems[0]).toHaveProperty('multimedia', 'avans_logo.png');
        expect(updateBody.multimediaItems[1]).toHaveProperty('multimedia', 'ihomer_logo.jpg');

        await request(app.getHttpServer())
          .put(`/events/${eventBody.id}`)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            title: 'Deleting images',
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
  });

  describe('You can only retrieve events of your organisation and this result can be filtered', () => {
    let organisation: Organisation;
    let otherOrganisation: Organisation;
    let user: User;
    let user1Token: string;
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
          isActive: true,
        },
      });

      await prisma.user.create({
        data: {
          email: 'user2@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
          isActive: true,
        },
      });

      userOfOtherOrganisation = await prisma.user.create({
        data: {
          email: 'user@otherorganisation.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: otherOrganisation.id,
          isActive: true,
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

    describe('You can get events of your organisation and filter by date', () => {
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

      it('should return the events of your organisation by date ascending, skip 1 and take 2', async () => {
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
    });

    describe('You can search events by title, description or tags', () => {
      it('should return events where the title, description or the tags contain the search string', async () => {
        const { body: newEvent } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'a word in the title',
            description: 'a different word in the description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
          });

        const { body: all } = await request(app.getHttpServer())
          .get('/events?searchQuery=')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(all).toHaveLength(6);

        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=title')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(1);
        expect(body[0].id).toBe(newEvent.id);

        const { body: body2 } = await request(app.getHttpServer())
          .get('/events?searchQuery=tle')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body2).toHaveLength(1);
        expect(body2[0].id).toBe(newEvent.id);

        const { body: body3 } = await request(app.getHttpServer())
          .get('/events?searchQuery=tagName1')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body3).toHaveLength(1);
        expect(body3[0].id).toBe(newEvent.id);

        const { body: body4 } = await request(app.getHttpServer())
          .get('/events?searchQuery=different')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body4).toHaveLength(1);
        expect(body4[0].id).toBe(newEvent.id);

        const { body: newEvent2 } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'another word in the title',
            description: 'another different word in the description',
            dateOfEvent: new Date('2021-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }, { subject: 'Tag for event2' }],
          });

        const { body: body5 } = await request(app.getHttpServer())
          .get('/events?searchQuery=different')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body5).toHaveLength(2);
        expect(body5[0].id).toBe(newEvent.id);
        expect(body5[1].id).toBe(newEvent2.id);

        const { body: body6 } = await request(app.getHttpServer())
          .get('/events?searchQuery=tagName1')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body6).toHaveLength(2);
        expect(body6[0].id).toBe(newEvent.id);
        expect(body6[1].id).toBe(newEvent2.id);

        const { body: body7 } = await request(app.getHttpServer())
          .get('/events?searchQuery=tag for event2')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body7).toHaveLength(1);
        expect(body7[0].id).toBe(newEvent2.id);
      });

      it('should return all events if the searchstring is empty', async () => {
        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(5);
      });

      it('should only return events where the tagname contains the full search string', async () => {
        const { body: newEvent } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'title',
            description: 'description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
          });

        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=tagName1')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(1);
        expect(body[0].id).toBe(newEvent.id);

        const { body: body2 } = await request(app.getHttpServer())
          .get('/events?searchQuery=Name1')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body2).toHaveLength(0);
      });

      it('should not return an event where the tagname does not contain the full search string', async () => {
        await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'title',
            description: 'description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
          });

        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=Name1')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(0);
      });
    });

    describe('You can choose whether to include archived events in your search', () => {
      it('should only return events that are not archived', async () => {
        const { body: newEvent } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'a unique title for archiving test',
            description: 'description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
          });

        const { body: unarchived } = await request(app.getHttpServer())
          .get('/events?searchQuery=archiving')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(unarchived).toHaveLength(1);

        await request(app.getHttpServer())
          .patch(`/events/${newEvent.id}/archive`)
          .set('Authorization', `Bearer ${user1Token}`);

        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=archiving')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(0);
      });

      it('should return both archived and unarchived events if the archived query parameter is set to true', async () => {
        const { body: newEvent } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'a unique title for archiving test',
            description: 'description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
          });

        const { body: unarchived } = await request(app.getHttpServer())
          .get('/events?searchQuery=archiving')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(unarchived).toHaveLength(1);

        await request(app.getHttpServer())
          .patch(`/events/${newEvent.id}/archive`)
          .set('Authorization', `Bearer ${user1Token}`);

        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=archiving&getArchivedItems=true')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(1);
      });

      it('should return all events if the archived query parameter is set to true and the searchstring is empty', async () => {
        const { body: newEvent } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'a unique title for archiving test',
            description: 'description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
          });

        const { body: unarchived } = await request(app.getHttpServer())
          .get('/events?searchQuery=')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(unarchived).toHaveLength(6);

        await request(app.getHttpServer())
          .patch(`/events/${newEvent.id}/archive`)
          .set('Authorization', `Bearer ${user1Token}`);

        const { body: archived } = await request(app.getHttpServer())
          .get('/events?searchQuery=')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(archived).toHaveLength(5);

        const { body } = await request(app.getHttpServer())
          .get('/events?searchQuery=&getArchivedItems=true')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(body).toHaveLength(6);
      });

      it('should return all archived and unarchived events by date ascending, skip 2 and take 3', async () => {
        const { body: newEvent } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'a unique title for archiving test',
            description: 'description',
            dateOfEvent: new Date('2022-01-01'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
            isArchived: true,
          });

        const { body: newEvent2 } = await request(app.getHttpServer())
          .post('/events')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            title: 'a unique title for archiving test 2',
            description: 'description',
            dateOfEvent: new Date('2022-01-02'),
            tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
            isArchived: true,
          });

        const { body: searchResult } = await request(app.getHttpServer())
          .get('/events?order=asc&getArchivedItems=false&min=2&max=5')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(searchResult).toHaveLength(3);
        const sortedEvents = eventArray.sort((a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime());
        expect(searchResult[0].id).toEqual(sortedEvents[2].id);
        expect(searchResult[1].id).toEqual(sortedEvents[3].id);
        expect(searchResult[2].id).toEqual(sortedEvents[4].id);

        const { body: searchResult2 } = await request(app.getHttpServer())
          .get('/events?order=asc&getArchivedItems=true&min=2&max=5')
          .set('Authorization', `Bearer ${user1Token}`);
        expect(searchResult2).toHaveLength(3);
        newEvent.dateOfEvent = new Date(newEvent.dateOfEvent);
        newEvent2.dateOfEvent = new Date(newEvent2.dateOfEvent);
        const sortedEvents2 = [...eventArray, newEvent, newEvent2].sort(
          (a, b) => a.dateOfEvent.getTime() - b.dateOfEvent.getTime(),
        );
        expect(searchResult2[0].id).toEqual(sortedEvents2[2].id);
        expect(searchResult2[1].id).toEqual(sortedEvents2[3].id);
        expect(searchResult2[2].id).toEqual(sortedEvents2[4].id);
      });
    });
  });

  describe('You can add tags to an event and create new tags if they do not exist yet for your organisation', () => {
    let user1Token: string;
    let userOfOtherOrganisationToken: string;

    const password = 'password';

    beforeEach(async () => {
      const organisation = await prisma.organisation.create({
        data: {
          domainName: 'exampledomain.com',
          name: 'Example organisation',
        },
      });

      const otherOrganisation = await prisma.organisation.create({
        data: {
          domainName: 'otherOrganisation.com',
          name: 'Other organisation',
        },
      });

      const user = await prisma.user.create({
        data: {
          email: 'user@exampledomain.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: organisation.id,
          isActive: true,
        },
      });

      const userOfOtherOrganisation = await prisma.user.create({
        data: {
          email: 'user@otherorganisation.com',
          password: await argon2.hash(password),
          firstName: 'exampleFirstName',
          lastName: 'exampleLastName',
          organisationId: otherOrganisation.id,
          isActive: true,
        },
      });

      await prisma.event.create({
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

      await prisma.event.create({
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

      await prisma.event.create({
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

      await prisma.event.create({
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

      await prisma.event.create({
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

      await prisma.event.create({
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

      await prisma.event.create({
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

      await prisma.event.create({
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

      const { body: loginBody } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: password });
      user1Token = loginBody.access_token;

      const { body: loginBody2 } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: userOfOtherOrganisation.email, password: password });
      userOfOtherOrganisationToken = loginBody2.access_token;
    });

    it('should get all tags of this organisation', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status).toBe(200);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Example tag1',
            count: 5,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Example tag2',
            count: 1,
            id: expect.any(Number),
          }),
        ]),
      );
    });

    it('should get all tags of this organisation but not tags of other organisation', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'title',
          description: 'description',
          dateOfEvent: new Date('2022-01-01'),
          tags: [{ subject: 'anotherTagOfThisOrganisation' }, { subject: 'anotherTagOfThisOrganisation2' }],
        });

      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${userOfOtherOrganisationToken}`)
        .send({
          title: 'title',
          description: 'description',
          dateOfEvent: new Date('2022-01-01'),
          tags: [{ subject: 'tagOfOtherOrganisation1' }, { subject: 'tagOfOtherOrganisation2' }],
        });

      const { status: status2, body: body2 } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(status2).toBe(200);
      expect(body2).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Example tag1',
            count: 5,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Example tag2',
            count: 1,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'anotherTagOfThisOrganisation',
            count: 1,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'anotherTagOfThisOrganisation2',
            count: 1,
            id: expect.any(Number),
          }),
        ]),
      );
    });

    it('should add five standard tags when creating an organisation', async () => {
      await request(app.getHttpServer()).post('/organisations').send({
        domainName: 'newOrganisation.nl',
        name: 'New organisation for testing tags',
      });

      await prisma.user.create({
        data: {
          email: 'newUser@newOrganisation.nl',
          password: await argon2.hash('password'),
          organisation: {
            connect: {
              domainName: 'newOrganisation.nl',
            },
          },
          firstName: 'newUser',
          lastName: 'newUser',
          isActive: true,
        },
      });

      const { body: loginBody } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'newUser@newOrganisation.nl', password: 'password' });
      const newUserToken = loginBody.access_token;

      const { status, body } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${newUserToken}`);
      expect(status).toBe(200);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Financiën',
            count: 0,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Werk cultuur',
            count: 0,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Administratie',
            count: 0,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Infrastructuur',
            count: 0,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Verhuizing',
            count: 0,
            id: expect.any(Number),
          }),
        ]),
      );
    });

    it('should add a tag to an event', async () => {
      const { status, body: newEvent } = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'title',
          description: 'description',
          dateOfEvent: new Date('2022-01-01'),
          tags: [{ subject: 'tagName1' }, { subject: 'tagName2' }],
        });
      expect(status).toBe(201);

      const { body: getBody } = await request(app.getHttpServer())
        .get(`/events/${newEvent.id}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(getBody).toHaveProperty('id');
      expect(getBody).toHaveProperty('tags');
      expect(getBody.tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ subject: 'tagName1' }),
          expect.objectContaining({ subject: 'tagName2' }),
        ]),
      );
    });

    it('should create a new tag if it does not exist within the organisation yet', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${userOfOtherOrganisationToken}`)
        .send({
          title: 'title',
          description: 'description',
          dateOfEvent: new Date('2022-01-01'),
          tags: [{ subject: 'tagOfOtherOrganisation' }],
        });

      const { body: tags } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Example tag1',
            count: 5,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Example tag2',
            count: 1,
            id: expect.any(Number),
          }),
        ]),
      );

      const { status } = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'title',
          description: 'description',
          dateOfEvent: new Date('2022-01-01'),
          tags: [{ subject: 'tagName3' }, { subject: 'tagOfOtherOrganisation' }],
        });
      expect(status).toBe(201);

      const { body: getBody } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(getBody).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Example tag1',
            count: 5,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Example tag2',
            count: 1,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'tagName3',
            count: 1,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'tagOfOtherOrganisation',
            count: 1,
            id: expect.any(Number),
          }),
        ]),
      );
    });

    it('should give a different count for two tags with the same subject but different organisation', async () => {
      const { body: getBody } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(getBody).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Example tag1',
            count: 5,
            id: expect.any(Number),
          }),
          expect.objectContaining({
            subject: 'Example tag2',
            count: 1,
            id: expect.any(Number),
          }),
        ]),
      );

      const { body: tagsOtherOrganisation } = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${userOfOtherOrganisationToken}`);
      expect(tagsOtherOrganisation).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'Example tag1',
            count: 3,
            id: expect.any(Number),
          }),
        ]),
      );
    });
  });
});
