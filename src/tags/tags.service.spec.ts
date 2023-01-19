import { Test } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaClientService } from '../prisma-client/prisma-client.service';

const organisationId = 1;
const tagArray = [
  {
    id: 1,
    subject: 'Changing team sizes',
    organisationId: organisationId,
    _count: {
      Events: 2,
    },
  },
  {
    id: 2,
    subject: 'Relocation',
    organisationId: organisationId,
    _count: {
      Events: 0,
    },
  },
  {
    id: 3,
    subject: 'Infrastructure',
    organisationId: organisationId,
    _count: {
      Events: 3,
    },
  },
  {
    id: 4,
    subject: 'Changing team sizes',
    organisationId: organisationId,
    _count: {
      Events: 2,
    },
  },
  {
    id: 5,
    subject: 'Work culture',
    organisationId: organisationId,
    _count: {
      Events: 1,
    },
  },
];

const db = {
  tag: {
    findMany: jest.fn().mockResolvedValue(tagArray),
  },
};

describe('TagsService', () => {
  let service: TagsService;
  let prisma: PrismaClientService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: PrismaClientService,
          useValue: db,
        },
      ],
    }).compile();

    service = mod.get<TagsService>(TagsService);
    prisma = mod.get<PrismaClientService>(PrismaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('should return a list of tags', async () => {
    const tags = await service.findAll(organisationId);
    expect(tags).toEqual(
      tagArray.map((tag) => ({
        id: tag.id,
        subject: tag.subject,
        count: tag._count.Events,
      })),
    );
  });
});
