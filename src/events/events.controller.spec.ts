import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';
import { eventsCreateDto, eventsUpdateDto } from './dto/events.dto';
import { NotFoundException } from '@nestjs/common';

const testEvent1: eventsCreateDto = {
  userId: 1,
  title: 'Test 1',
  description: 'Test 1',
  dateOfEvent: new Date('2020-01-01'),
  multimediaItems: [],
  tags: [],
};

const eventArray = [
  testEvent1,
  {
    userId: 1,
    title: 'Test 2',
    description: 'Test 2',
    dateOfEvent: new Date('2020-01-01'),
    multimediaItems: [],
    tags: [],
  },
  {
    userId: 1,
    title: 'Test 3',
    description: 'Test 3',
    dateOfEvent: new Date('2020-01-01'),
    multimediaItems: [],
    tags: [],
  },
  {
    userId: 1,
    title: 'Test 4',
    description: 'Test 4',
    dateOfEvent: new Date('2020-01-01'),
    multimediaItems: [],
    tags: [],
  },
];

const createdEvent: eventsCreateDto = {
  userId: 1,
  title: 'Test 5',
  description: 'Test 5',
  dateOfEvent: new Date('2020-01-01'),
  multimediaItems: [],
  tags: [],
};

const updatedEvent: eventsCreateDto = {
  userId: 1,
  title: 'Test updated',
  description: 'Test updated',
  dateOfEvent: new Date('2020-01-01'),
  multimediaItems: [],
  tags: [],
};

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(eventArray),
            findOne: jest.fn().mockImplementation((id: '1') => Promise.resolve(testEvent1)),
            create: jest
              .fn()
              .mockImplementation((event: eventsCreateDto) => Promise.resolve({ id: 5, ...createdEvent })),
            update: jest
              .fn()
              .mockImplementation((id: string, event: eventsUpdateDto) => Promise.resolve({ id: 5, ...updatedEvent })),
            remove: jest.fn().mockResolvedValue(updatedEvent),
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
    };
    it('should get an array of Event', async () => {
      await expect(controller.findAll(dto)).resolves.toEqual([
        {
          userId: 1,
          title: 'Test 1',
          description: 'Test 1',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
        },
        {
          userId: 1,
          title: 'Test 2',
          description: 'Test 2',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
        },
        {
          userId: 1,
          title: 'Test 3',
          description: 'Test 3',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
        },
        {
          userId: 1,
          title: 'Test 4',
          description: 'Test 4',
          dateOfEvent: new Date('2020-01-01'),
          multimediaItems: [],
          tags: [],
        },
      ]);
    });
  });

  describe('getById', () => {
    it('should get a single Event', async () => {
      await expect(controller.findOne('1')).resolves.toEqual(eventArray[0]);
    });
  });

  describe('newCat', () => {
    it('should create a new Event', async () => {
      const newEventDto: eventsCreateDto = {
        userId: 1,
        title: 'Test event 5',
        description: 'Test event 5',
        dateOfEvent: new Date('2022-12-21'),
        multimediaItems: [],
        tags: [],
      };
      await expect(controller.create(newEventDto)).resolves.toEqual({
        id: 5,
        ...createdEvent,
      });
    });
  });

  describe('updateCat', () => {
    it('should update a Event', async () => {
      await expect(controller.update('5', updatedEvent)).resolves.toEqual({
        id: 5,
        ...updatedEvent,
      });
    });
  });

  describe('deleteCat', () => {
    it('should return that deleted Event', async () => {
      await expect(controller.remove('5')).resolves.toEqual(updatedEvent);
    });

    it('should return that it not delete an event', async () => {
      const deleteSpy = jest
        .spyOn(eventsService, 'remove')
        .mockRejectedValueOnce({ errorCode: 404, message: 'Not found' });
      await expect(controller.remove('1000')).rejects.toEqual({ errorCode: 404, message: 'Not found' });
    });
  });
});
