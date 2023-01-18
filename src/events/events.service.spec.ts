import { Test } from '@nestjs/testing';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { EventsService } from './events.service';
import { EventsCreateDto } from './dto/events.dto';
import { NotFoundException } from '@nestjs/common/exceptions';

const testEvent1: EventsCreateDto = {
  userId: 1,
  title: 'Test 1',
  description: 'Test 1',
  content: 'Test 1',
  dateOfEvent: new Date(),
  multimediaItems: [],
  tags: [],
  organisationId: 1,
};

const eventArray = [
  {
    userId: 1,
    title: 'Test 1',
    description: 'Test 1',
    content: 'Test 1',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    organisationId: 1,
  },
  {
    userId: 1,
    title: 'Test 2',
    description: 'Test 2',
    content: 'Test 2',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    organisationId: 1,
  },
  {
    userId: 1,
    title: 'Test 3',
    description: 'Test 3',
    content: 'Test 3',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    organisationId: 1,
  },
  {
    userId: 1,
    title: 'Test 4',
    description: 'Test 4',
    content: 'Test 4',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    organisationId: 1,
  },
];

const oneEvent = eventArray[0];

const db = {
  event: {
    findMany: jest.fn().mockResolvedValue(eventArray),
    findUnique: jest.fn().mockResolvedValue(oneEvent),
    findFirst: jest.fn().mockResolvedValue(oneEvent),
    create: jest.fn().mockReturnValue(oneEvent),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(oneEvent),
    delete: jest.fn().mockResolvedValue(oneEvent),
    count: jest.fn().mockResolvedValue(4),
  },
};

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaClientService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaClientService,
          useValue: db,
        },
      ],
    }).compile();

    service = mod.get<EventsService>(EventsService);
    prisma = mod.get<PrismaClientService>(PrismaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of Events', async () => {
      const events = await service.findAll(
        {
          min: 0,
          max: 0,
          order: '',
          searchQuery: '',
          getArchivedItems: false,
        },
        1,
      );
      expect(events).toEqual(eventArray);
    });
  });

  describe('getOne', () => {
    it('should get a single Event', async () => {
      const event = await service.findOne(1, 1);
      expect(event).toEqual(oneEvent);
    });
  });

  describe('insertOne', () => {
    it('should successfully insert an Event', async () => {
      const event = await service.create(testEvent1);
      expect(event).toEqual(oneEvent);
    });
  });

  describe('updateOne', () => {
    it('should call the update method', async () => {
      const event = await service.update({
        where: { id: Number(1) },
        event: oneEvent,
      });
      expect(event).toEqual(oneEvent);
    });

    it('should return a notfound exception', async () => {
      jest.spyOn(prisma.event, 'update').mockRejectedValueOnce({ code: 'P2025', message: 'Bad Delete Method.' });
      expect(
        service.update({
          where: { id: Number(1000) },
          event: oneEvent,
        }),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteOne', () => {
    it('should return {deleted: true}', async () => {
      const event = await service.remove({ id: Number(1) }, 1);
      expect(event).toEqual(oneEvent);
    });

    it('should return a notfound exception', async () => {
      jest.spyOn(prisma.event, 'delete').mockRejectedValueOnce({ code: 'P2025', message: 'Bad Delete Method.' });
      expect(service.remove({ id: Number(1) }, 1)).rejects.toThrowError(NotFoundException);
    });
  });
});
