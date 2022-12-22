import { Test } from '@nestjs/testing';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';
import { EventQueryParamsDto } from './dto/events.query.params.dto';
import { EventsService } from './events.service';
import { eventsCreateDto, eventsUpdateDto } from './dto/events.dto';
import { BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

const testEvent1: eventsCreateDto = {
  userId: 1,
  title: 'Test 1',
  description: 'Test 1',
  dateOfEvent: new Date(),
  multimediaItems: [],
  tags: [],
  content: ''
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
    content: ''
  },
  {
    userId: 1,
    title: 'Test 2',
    description: 'Test 2',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    content: ''
  },
  {
    userId: 1,
    title: 'Test 3',
    description: 'Test 3',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    content: ''
  },
  {
    userId: 1,
    title: 'Test 4',
    description: 'Test 4',
    dateOfEvent: new Date(),
    multimediaItems: [],
    tags: [],
    paragraphs: [],
    content: ''
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
  });

  describe('getAll', () => {
    it('should return an array of Events', async () => {
      const events = await service.findAll({
        min: 0,
        max: 0,
        order: '',
        searchQuery: '',
      });
      expect(events).toEqual(eventArray);
    });
  });

  describe('getOne', () => {
    it('should get a single Event', () => {
      expect(service.findOne({ id: Number(1) })).resolves.toEqual(oneEvent);
    });
  });

  describe('insertOne', () => {
    it('should successfully insert an Event', () => {
      expect(service.create(testEvent1)).resolves.toEqual(oneEvent);
    });
  });

  describe('updateOne', () => {
    it('should call the update method', async () => {
      const cat = await service.update({
        where: { id: Number(1) },
        event: oneEvent,
      });
      expect(cat).toEqual(oneEvent);
    });

    it('should return a notfound exception', () => {
      const dbSpy = jest.spyOn(prisma.event, 'update').mockRejectedValueOnce(new Error('Bad Delete Method.'));
      expect(
        service.update({
          where: { id: Number(1000) },
          event: oneEvent,
        }),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteOne', () => {
    it('should return {deleted: true}', () => {
      expect(service.remove({ id: Number(1) })).resolves.toEqual(oneEvent);
    });

    it('should return a notfound exception', () => {
      const dbSpy = jest.spyOn(prisma.event, 'delete').mockRejectedValueOnce(new Error('Bad Delete Method.'));
      expect(service.remove({ id: Number(1) })).rejects.toThrowError(NotFoundException);
    });
  });
});
