import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';
import { EventsCreateDto } from './dto/events.dto';
import { JwtModule } from '@nestjs/jwt';

const testEvent1: EventsCreateDto = {
  userId: 1,
  title: 'Test 1',
  description: 'Test 1',
  content: 'Test 1',
  dateOfEvent: new Date('2020-01-01'),
  multimediaItems: [],
  tags: [],
  organisationId: 1,
};

const eventArray = [
  testEvent1,
  {
    userId: 1,
    title: 'Test 2',
    description: 'Test 2',
    content: 'Test 2',
    dateOfEvent: new Date('2020-01-01'),
    multimediaItems: [],
    tags: [],
    organisationId: 1,
  },
  {
    userId: 1,
    title: 'Test 3',
    description: 'Test 3',
    content: 'Test 3',
    dateOfEvent: new Date('2020-01-01'),
    multimediaItems: [],
    tags: [],
    organisationId: 1,
  },
  {
    userId: 1,
    title: 'Test 4',
    description: 'Test 4',
    content: 'Test 4',
    dateOfEvent: new Date('2020-01-01'),
    multimediaItems: [],
    tags: [],
    organisationId: 1,
  },
];

const createdEvent: EventsCreateDto = {
  userId: 1,
  title: 'Test 5',
  description: 'Test 5',
  content: 'Test 5',
  dateOfEvent: new Date('2020-01-01'),
  multimediaItems: [],
  tags: [],
  organisationId: 1,
};

const updatedEvent: EventsCreateDto = {
  userId: 1,
  title: 'Test updated',
  description: 'Test updated',
  content: 'Test updated',
  dateOfEvent: new Date('2020-01-01'),
  multimediaItems: [],
  tags: [],
  organisationId: 1,
};

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      imports: [
        JwtModule.register({
          secretOrPrivateKey: process.env.SECRETKEY || 'secretKey',
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      providers: [
        {
          provide: EventsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(eventArray),
            findOne: jest.fn().mockImplementation(() => Promise.resolve(testEvent1)),
            create: jest.fn().mockImplementation(() => Promise.resolve({ id: 5, ...createdEvent })),
            update: jest.fn().mockImplementation(() => Promise.resolve({ id: 5, ...updatedEvent })),
            remove: jest.fn().mockResolvedValue(updatedEvent),
            archive: jest.fn().mockResolvedValue(testEvent1),
            unarchive: jest.fn().mockResolvedValue(testEvent1),
          },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get events', () => {
    const dto: EventQueryParamsDto = {
      min: 0,
      max: 0,
      order: '',
      searchQuery: '',
      getArchivedItems: false,
    };
    it('should get an array of Events', async () => {
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      await expect(controller.findAll(dto, req)).resolves.toEqual([
        {
          userId: 1,
          title: 'Test 1',
          description: 'Test 1',
          content: 'Test 1',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
          organisationId: 1,
        },
        {
          userId: 1,
          title: 'Test 2',
          description: 'Test 2',
          content: 'Test 2',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
          organisationId: 1,
        },
        {
          userId: 1,
          title: 'Test 3',
          description: 'Test 3',
          content: 'Test 3',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
          organisationId: 1,
        },
        {
          userId: 1,
          title: 'Test 4',
          description: 'Test 4',
          content: 'Test 4',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
          organisationId: 1,
        },
      ]);
    });
  });

  describe('get event by id', () => {
    const req = { headers: { authorization: 'Bearer token  ' }, user: { userId: 1, organisationId: 1, username: '' } };
    it('should get a single Event', async () => {
      await expect(controller.findOne('1', req)).resolves.toEqual(eventArray[0]);
    });
  });

  describe('new event', () => {
    it('should create a new Event', async () => {
      const newEventDto: EventsCreateDto = {
        userId: 1,
        title: 'Test event 5',
        description: 'Test event 5',
        content: 'Test event 5',
        dateOfEvent: new Date('2022-12-21'),
        multimediaItems: [],
        tags: [],
        organisationId: 1,
      };
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      await expect(controller.create(newEventDto, undefined, req)).resolves.toEqual({
        id: 5,
        ...createdEvent,
      });
    });
  });

  describe('update event', () => {
    it('should update an Event', async () => {
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      await expect(controller.update('5', updatedEvent, undefined, req)).resolves.toEqual({
        id: 5,
        ...updatedEvent,
      });
    });
  });

  describe('archive event', () => {
    it('should archive an Event', async () => {
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      await expect(controller.archive('1', req)).resolves.toEqual({
        ...testEvent1,
      });
    });
  });

  describe('unarchive event', () => {
    it('should unarchive an Event', async () => {
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      await expect(controller.unarchive('1', req)).resolves.toEqual({
        ...testEvent1,
      });
    });
  });

  describe('delete event', () => {
    it('should return that deleted Event', async () => {
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      await expect(controller.remove('5', req)).resolves.toEqual(updatedEvent);
    });

    it('should return that it did not delete the event', async () => {
      const req = {
        headers: { authorization: 'Bearer token  ' },
        user: { userId: 1, organisationId: 1, username: '' },
      };
      jest.spyOn(eventsService, 'remove').mockRejectedValueOnce({ errorCode: 404, message: 'Not found' });
      await expect(controller.remove('1000', req)).rejects.toEqual({ errorCode: 404, message: 'Not found' });
    });
  });
});
