import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';
import { eventsCreateDto } from './dto/events.dto';

const testEvent1: eventsCreateDto = {
  userId: 1,
  title: 'Test 1',
  description: 'Test 1',
  dateOfEvent: new Date(),
  multimediaItems: [],
  tags: [],
};

const eventArray = [
  {
    userId: 1,
    title: 'Test 1',
    description: 'Test 1',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
  },
  {
    userId: 1,
    title: 'Test 2',
    description: 'Test 2',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
  },
  {
    userId: 1,
    title: 'Test 3',
    description: 'Test 3',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
  },
  {
    userId: 1,
    title: 'Test 4',
    description: 'Test 4',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
  },
];

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
            getAll: jest.fn().mockResolvedValue([testEvent1, ...eventArray.slice(1)]),
            getOne: jest.fn().mockImplementation((id: string) => Promise.resolve(testEvent1)),
            insertOne: jest.fn().mockImplementation((event: eventsCreateDto) => Promise.resolve({ id: 1, ...event })),
            updateOne: jest.fn().mockImplementation((id: string, event: eventsCreateDto) => Promise.resolve({ id, ...event })),
            deleteOne: jest.fn().mockResolvedValue({ deleted: true }),
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

  describe('findAll', () => {
    let findAllService;

    beforeEach(() => {
      findAllService = jest.spyOn(eventsService, 'findAll');
    });

    it('should return an array of events', async () => {
      const result = await controller.findAll(new EventQueryParamsDto());
      expect(result).toBeInstanceOf(Array);
    });
  });
});
