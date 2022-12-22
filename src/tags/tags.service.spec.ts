import { Test } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaClientService } from '../../src/prisma-client/prisma-client.service';

describe('TagsService', () => {
  let service: TagsService;
  let prisma: PrismaClientService;

  const db = {
    tag: {},
  };

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
});
